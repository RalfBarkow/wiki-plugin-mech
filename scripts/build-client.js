import fs from 'node:fs/promises'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import { execFile, execFileSync } from 'node:child_process'
import { promisify } from 'node:util'

const require = createRequire(import.meta.url)
const execFileAsync = promisify(execFile)
const buildInfoPath = new URL('../client/mech-build-info.js', import.meta.url)
const buildInfoFile = fileURLToPath(buildInfoPath)
const rootPath = fileURLToPath(new URL('..', import.meta.url))

try {
  execFileSync('node', ['scripts/write-build-info.cjs'], { stdio: 'ignore', cwd: rootPath })
} catch (err) {
  // If this fails, we will surface the error when trying to load build info below.
}
let buildInfo
try {
  buildInfo = require(buildInfoFile)
} catch (err) {
  const pkgPath = fileURLToPath(new URL('../package.json', import.meta.url))
  let version = 'dev'
  try {
    const pkg = JSON.parse(await fs.readFile(pkgPath, 'utf8'))
    if (pkg.version) version = pkg.version
  } catch (readErr) {
    // use fallback values
  }
  buildInfo = {
    MECH_VERSION: version,
    MECH_BUILD_TIME: new Date().toISOString(),
    MECH_GIT_COMMIT: 'nogit',
  }
  const contents = [
    'module.exports = {',
    `  MECH_VERSION: "${buildInfo.MECH_VERSION}",`,
    `  MECH_BUILD_TIME: "${buildInfo.MECH_BUILD_TIME}",`,
    `  MECH_GIT_COMMIT: "${buildInfo.MECH_GIT_COMMIT}"`,
    '}',
    ''
  ].join('\n')
  await fs.writeFile(buildInfoFile, contents, 'utf8')
}

const banner = `/* wiki-plugin-mech build stamp */`
const define = {
  __MECH_VERSION__: JSON.stringify(buildInfo.MECH_VERSION),
  __MECH_BUILD__: JSON.stringify(buildInfo.MECH_BUILD_TIME),
  __MECH_COMMIT__: JSON.stringify(buildInfo.MECH_GIT_COMMIT),
}

let esbuild
try {
  esbuild = await import('esbuild')
} catch (err) {
  esbuild = null
}

if (esbuild) {
  const results = await esbuild.build({
    entryPoints: ['src/client/mech.js'],
    bundle: true,
    banner: { js: banner },
    define,
    minify: true,
    sourcemap: true,
    logLevel: 'info',
    metafile: true,
    outfile: 'client/mech.js',
  })
  await fs.writeFile('meta-client.json', JSON.stringify(results.metafile))
  console.log("\n  esbuild metadata written to 'meta-client.json'.")
} else {
  const cliArgs = [
    'src/client/mech.js',
    '--bundle',
    '--minify',
    '--sourcemap',
    '--log-level=info',
    `--banner:js=${banner.replace(/\n/g, '\\n')}`,
    `--define:__MECH_VERSION__=${define.__MECH_VERSION__}`,
    `--define:__MECH_BUILD__=${define.__MECH_BUILD__}`,
    `--define:__MECH_COMMIT__=${define.__MECH_COMMIT__}`,
    '--metafile=meta-client.json',
    '--outfile=client/mech.js',
  ]
  try {
    const esbuildCmd = process.env.ESBUILD_BINARY || 'esbuild'
    await execFileAsync(esbuildCmd, cliArgs, { stdio: 'inherit' })
    console.log("\n  esbuild metadata written to 'meta-client.json'.")
  } catch (err) {
    const args = ['--yes', 'esbuild', ...cliArgs]
    try {
      await execFileAsync('npx', args, { stdio: 'inherit' })
      console.log("\n  esbuild metadata written to 'meta-client.json'.")
    } catch (npxErr) {
      throw new Error("esbuild not available; run 'npm install' or ensure esbuild is on PATH.")
    }
  }
}
