const { copySync } = require('cpx');

module.exports = function(bundle) {

  const {
    appOutDir,
    electronPlatformName
  } = bundle;

  copySync('resources/platform/base/**', appOutDir);
  copySync(`resources/platform/${electronPlatformName}/**`, appOutDir);
};