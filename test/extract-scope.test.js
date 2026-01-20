import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { extract_emit } from '../src/client/blocks.js'

function makeElem() {
  return {
    innerHTML: '',
    previousElementSibling: { innerHTML: '' },
  }
}

describe('extract_emit scope selection', () => {
  it('prefers state.items when present and counts unscoped items', async () => {
    const calls = []
    const state = {
      items: [
        { type: 'reference', site: 'example.org', slug: 'a' },
        { site: 'example.org', title: 'Hello World' },
        { foo: 'bar' },
      ],
      api: {
        jfetch: async url => {
          calls.push(url)
          return { story: [] }
        },
        status: () => {},
        trouble: (elem, msg) => {
          throw new Error(msg)
        },
      },
    }
    await extract_emit({ elem: makeElem(), command: 'EXTRACT', args: [], state })
    assert.strictEqual(state.discourse.metadata.scopeSource, 'items')
    assert.strictEqual(state.discourse.metadata.unscopedItems, 1)
    assert.equal(calls.length, 2)
    assert.ok(calls.some(url => url.includes('//example.org/a.json')))
    assert.ok(calls.some(url => url.includes('//example.org/hello-world.json')))
  })

  it('falls back to neighborhood when items missing', async () => {
    const calls = []
    const state = {
      items: [],
      neighborhood: [
        { domain: 'n.org', slug: 'x', date: 2 },
        { domain: 'n.org', slug: 'y', date: 5 },
      ],
      api: {
        jfetch: async url => {
          calls.push(url)
          return { story: [] }
        },
        status: () => {},
        trouble: (elem, msg) => {
          throw new Error(msg)
        },
      },
    }
    await extract_emit({ elem: makeElem(), command: 'EXTRACT', args: [], state })
    assert.strictEqual(state.discourse.metadata.scopeSource, 'neighborhood')
    assert.equal(calls[0], '//n.org/y.json')
    assert.equal(calls[1], '//n.org/x.json')
  })
})
