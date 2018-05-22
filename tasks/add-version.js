const fs = require('fs');
const path = require('path');

module.exports = function(bundle) {

  const {
    appOutDir
  } = bundle;

  const appInfo = bundle.packager.appInfo;

  const {
    buildVersion,
    buildNumber
  } = appInfo;

  fs.writeFileSync(
    path.join(appOutDir, 'VERSION'),
    `v${buildVersion} (build ${buildNumber || '0000' })`,
    'utf8'
  );
};