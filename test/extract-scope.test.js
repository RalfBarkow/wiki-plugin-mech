import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { selectExtractScope } from '../src/client/blocks.js'

function makeElem() {
  return {
    innerHTML: '',
    previousElementSibling: { innerHTML: '' },
  }
}

describe('extract_emit scope selection', () => {
  it('prefers state.items when present and counts unscoped items', () => {
    const state = {
      items: [
        { type: 'reference', site: 'example.org', slug: 'a' },
        { site: 'example.org', title: 'Hello World' },
        { foo: 'bar' },
      ],
    }
    const result = selectExtractScope(state)
    assert.ok(result)
    assert.strictEqual(result.scopeSource, 'items')
    assert.strictEqual(result.unscopedItems, 1)
    assert.equal(result.scope.length, 2)
    assert.deepEqual(result.scope[0], { domain: 'example.org', slug: 'a', date: 0 })
    assert.deepEqual(result.scope[1], { domain: 'example.org', slug: 'hello-world', date: 0 })
  })

  it('falls back to neighborhood when items missing', () => {
    const state = {
      items: [],
      neighborhood: [
        { domain: 'n.org', slug: 'x', date: 2 },
        { domain: 'n.org', slug: 'y', date: 5 },
      ],
    }
    const result = selectExtractScope(state)
    assert.ok(result)
    assert.strictEqual(result.scopeSource, 'neighborhood')
    assert.deepEqual(result.scope[0], { domain: 'n.org', slug: 'y', date: 5 })
    assert.deepEqual(result.scope[1], { domain: 'n.org', slug: 'x', date: 2 })
  })
})
