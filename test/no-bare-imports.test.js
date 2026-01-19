import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'

async function listJsFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  const files = []
  for (const entry of entries) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...(await listJsFiles(full)))
    } else if (entry.isFile() && entry.name.endsWith('.js')) {
      files.push(full)
    }
  }
  return files
}

function isBare(spec) {
  return !spec.startsWith('.') && !spec.startsWith('/') && !spec.startsWith('http://') && !spec.startsWith('https://')
}

describe('no bare imports in client modules', () => {
  it('avoids bare module specifiers under src/client', async () => {
    const root = path.join(process.cwd(), 'src', 'client')
    const files = await listJsFiles(root)
    const offenders = []
    const importRe = /\b(?:import|export)\s+[^'\"]*from\s+['\"]([^'\"]+)['\"]/g
    for (const file of files) {
      const text = await fs.readFile(file, 'utf8')
      let match
      while ((match = importRe.exec(text)) !== null) {
        const spec = match[1]
        if (isBare(spec)) offenders.push({ file, spec })
      }
    }
    assert.strictEqual(offenders.length, 0, `Bare imports found: ${JSON.stringify(offenders)}`)
  })
})
