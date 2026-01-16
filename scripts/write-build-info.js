const fs = require('fs')
const path = require('path')
const {execSync} = require('child_process')

const root = path.resolve(__dirname, '..')
const pkgPath = path.join(root, 'package.json')
const mechPath = path.join(root, 'client', 'mech.js')
const outPath = path.join(root, 'client', 'mech-build-info.js')

const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'))
const version = pkg.version
if (!version) throw new Error('package.json version missing')

let commit = 'nogit'
try {
  const result = execSync('git rev-parse --short HEAD', {
    cwd: root,
    stdio: ['ignore', 'pipe', 'ignore']
  })
  const trimmed = result.toString().trim()
  if (trimmed) commit = trimmed
} catch (err) {
  commit = 'nogit'
}

const buildTime = new Date().toISOString()
const contents = [
  'module.exports = {',
  `  MECH_VERSION: "${version}",`,
  `  MECH_BUILD_TIME: "${buildTime}",`,
  `  MECH_GIT_COMMIT: "${commit}"`,
  '}',
  ''
].join('\n')

fs.writeFileSync(outPath, contents, 'utf8')

const banner = `/*! wiki-plugin-mech VERSION: ${version}, build: ${buildTime}, commit: ${commit} */\n`
const mechSource = fs.readFileSync(mechPath, 'utf8')
const updated = mechSource.replace(/^\/\*!\s*wiki-plugin-mech[^\n]*\n/, banner)
if (updated === mechSource) {
  throw new Error('mech.js banner comment not found for update')
}
fs.writeFileSync(mechPath, updated, 'utf8')
