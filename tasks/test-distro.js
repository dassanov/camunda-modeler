#!/usr/bin/env node

const argv = require('yargs').argv;

const pkg = require('../app/package');

const fs = require('fs');
const path = require('path');

const decompress = require('decompress');

const {
  nightly,
  win,
  linux,
  mac
} = argv;


const platforms = [
  win && 'win',
  linux && 'linux',
  mac && 'mac'
].filter((f) => f);

const expectedFiles = {
  win: [
    'camunda-modeler-${version}-win-ia32.zip',
    'camunda-modeler-${version}-win-x64.zip',
    'camunda-modeler-${version}-win-setup.exe'
  ],
  linux: [
    'camunda-modeler-${version}-linux-ia32.tar.gz',
    'camunda-modeler-${version}-linux-x64.tar.gz'
  ],
  mac: [
    'camunda-modeler-${version}-darwin.dmg',
    'camunda-modeler-${version}-darwin.zip'
  ]
};

const expectedContents = {
  win: [
    'Camunda Modeler.exe'
  ],
  linux: [
    'camunda-modeler-${version}-linux-ia32/camunda-modeler'
  ],
  mac: [
    'Camunda Modeler.app'
  ]
};


const version = nightly ? 'nightly' : pkg.version;

// execute tests
verifyArchives(platforms, version).then(
  () => console.log('SUCCESS'),
  (e) => {
    console.error('FAILURE', e);
    process.exit(1);
  }
);


// helpers ///////////

async function verifyArchives(platforms, version) {

  function replaceVersion(name) {
    return name.replace('${version}', version);
  }

  const distroDir = path.join(__dirname, '../distro');

  for (const platform of platforms) {

    const distributableNames = expectedFiles[platform].map(replaceVersion);

    console.log(`Verifying <${platform}> distributables`);
    console.log();

    for (const name of distributableNames) {

      const archivePath = `${distroDir}/${replaceVersion(name)}`;

      console.log(` - ${name}`);

      // (0): verify name exists
      if (!fs.existsSync(archivePath)) {
        throw new Error(`expected <${name}> to exist`);
      }


      // (1): verify correct contents for archive
      if (isArchive(archivePath)) {

        console.log('     > extracting');

        const files = await decompress(archivePath, `${archivePath}_extracted`);

        console.log('     > verifying contents');

        for (const expectedFile of expectedContents[platform]) {

          const contained = files.some(file => file.path === expectedFile);

          if (!contained) {
            throw new Error(`expected <${name}> to contain <${expectedFile}>`);
          }
        }

        console.log('     > ok');
      }
    }

    console.log();
  }
}

function isArchive(path) {
  return /\.(zip|gz)/.test(path);
}