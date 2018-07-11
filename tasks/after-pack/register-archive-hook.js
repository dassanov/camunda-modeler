/**
 * An initializer that extends electron-builder to
 * suite our needs:
 *
 *   * consistent archive contents + naming on
 *     all platforms
 *
 * @param {PackagerContext} context
 *
 * @return {Promise<any>}
 */
module.exports = function registerArchiveHook(context) {

  const {
    targets,
    packager
  } = context;

  const {
    platform
  } = packager;

  console.log('AFTER PACK');

  targets.forEach(function(target) {

    let fn = function() { };

    if (target.name === 'tar.gz' && platform.name === 'linux') {
      fn = function() {
        console.log('RENAME target contents');
      };
    }

    if (target.name === 'zip' && platform.name === 'windows') {
      fn = function() {
        console.log('WRAP archive contents in directory');
      };
    }

    postBuild(target, fn);
  });

};


/**
 * Register target postBuild hook.
 */
function postBuild(target, fn) {

  const originalBuild = target.build;

  target.build = async function(appOutDir, arch) {
    await originalBuild.call(target, appOutDir, arch);

    await fn(appOutDir, arch);
  };
}