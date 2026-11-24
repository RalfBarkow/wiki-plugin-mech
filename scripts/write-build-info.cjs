const fs = require('fs')
const path = require('path')
const {execSync} = require('child_process')

const root = path.resolve(__dirname, '..')
const pkgPath = path.join(root, 'package.json')
const outPath = path.join(root, 'client', 'mech-build-info.js')

const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'))
const version = process.env.MECH_VERSION || pkg.version
if (!version) throw new Error('package.json version missing')

let commit = process.env.MECH_GIT_COMMIT || 'nogit'
try {
  if (!process.env.MECH_GIT_COMMIT) {
    const result = execSync('git rev-parse --short HEAD', {
      cwd: root,
      stdio: ['ignore', 'pipe', 'ignore']
    })
    const trimmed = result.toString().trim()
    if (trimmed) commit = trimmed
  }
} catch (err) {
  commit = 'nogit'
}

const buildTime = process.env.MECH_BUILD_TIME || new Date().toISOString()
const contents = [
  'module.exports = {',
  `  MECH_VERSION: "${version}",`,
  `  MECH_BUILD_TIME: "${buildTime}",`,
  `  MECH_GIT_COMMIT: "${commit}"`,
  '}',
  ''
].join('\n')

// client/ is not tracked (its generated files are ignored), so a fresh clone,
// such as npm's for a git dependency, does not have it.
fs.mkdirSync(path.dirname(outPath), { recursive: true })
fs.writeFileSync(outPath, contents, 'utf8')
