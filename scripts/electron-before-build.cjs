// Returning false tells electron-builder the runtime has no Node
// packages to copy. The window only serves dist/ plus this main process.
module.exports = async function beforeBuild() {
  return false
}
