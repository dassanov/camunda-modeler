#!/usr/bin/env node

const argv = require('yargs')
  .option('nightly', {
    describe: 'build nightly distro',
    type: 'boolean'
  })
  .option('publish', {
    describe: 'publish distro',
    type: 'boolean'
  })
  .option('targets', {
    describe: 'target platforms to build distributions for',
    coerce: function(val) {
      return val.split(/,/g);
    }
  })
  .argv;

const exec = require('execa').sync;

const getVersion = require('../app/util/get-version');

const pkg = require('../app/package');

const {
  nightly,
  publish
} = argv;


let artifactOptions = [
  '-c.artifactName=${name}-${version}-${os}-${arch}.${ext}',
  '-c.dmg.artifactName=${name}-${version}-${os}.${ext}',
  '-c.nsis.artifactName=${name}-${version}-${os}-setup.${ext}',
  '-c.nsisWeb.artifactName=${name}-${version}-${os}-web-setup.${ext}'
];

let nightlyVersion = nightly && getVersion(pkg, {
  nightly: 'nightly'
});

if (nightlyVersion) {

  artifactOptions =
    artifactOptions.map(s => s.replace('${version}', 'nightly'));

  const publishNightlyArgs = [
    'publish',
    `--repo-version=${nightlyVersion}`,
    '--skip-npm',
    '--skip-git',
    '--yes'
  ];

  console.log(`
Setting ${pkg.name} version to nightly

---

lerna ${ publishNightlyArgs.join(' ') }

---
`);

  exec('lerna', publishNightlyArgs, {
    stdio: 'inherit'
  });
}

// interpret shorthand target options
// --win, --linux, --mac(os)
const platforms = argv.targets || [
  argv.win ? 'win' : null,
  argv.linux ? 'linux': null,
  (argv.macos || argv.mac) ? 'macos' : null
].filter(f => f);

const platformOptions = platforms.map(p => `--${p}`);

const publishOptions = typeof publish !== undefined ? [
  `--publish=${ publish ? 'always' : 'never' }`
] : [];

const signingOptions = [
  `-c.forceCodeSigning=${publish}`
];

const archOptions = 'x64' in argv ? [ '--x64' ] : [
  '--ia32',
  '--x64',
];

const args = [
  ...archOptions,
  ...signingOptions,
  ...platformOptions,
  ...publishOptions,
  ...artifactOptions
];

console.log(`
Building ${pkg.name} distro

---

  version: ${nightlyVersion || pkg.version}
  platforms: [${ platforms.length && platforms || 'current' }]
  publish: ${publish || false}

---

electron-builder ${ args.join(' ') }
`
);

exec('electron-builder', args, {
  stdio: 'inherit'
});