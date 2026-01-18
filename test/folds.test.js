import { describe, it } from 'node:test'
import assert from 'node:assert'
import { update_fold_stats } from '../src/client/blocks.js'

describe('fold canonicalization', () => {
  const recognized = new Set(['question', 'claim', 'support', 'oppose'])

  it('treats "Claims" as claim', () => {
    const stats = { encountered: {}, unknown: {} }
    const role = update_fold_stats('Claims', recognized, stats)
    assert.strictEqual(role, 'claim')
    assert.strictEqual(stats.encountered.claim, 1)
    assert.strictEqual(stats.unknown.claim, undefined)
  })

  it('treats "Claim:" as claim', () => {
    const stats = { encountered: {}, unknown: {} }
    const role = update_fold_stats('Claim:', recognized, stats)
    assert.strictEqual(role, 'claim')
    assert.strictEqual(stats.encountered.claim, 1)
  })

  it('tracks unknown folds and returns null role', () => {
    const stats = { encountered: {}, unknown: {} }
    const role = update_fold_stats('hypothesis', recognized, stats)
    assert.strictEqual(role, null)
    assert.strictEqual(stats.encountered.hypothesis, 1)
    assert.strictEqual(stats.unknown.hypothesis, 1)
  })
})
