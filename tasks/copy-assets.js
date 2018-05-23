const addVersion = require('./add-version');
const addPlatformFiles = require('./add-platform-files');

module.exports = async function(bundle) {
  await addVersion(bundle);
  await addPlatformFiles(bundle);
};