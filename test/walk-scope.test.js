import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { scope_lineup, scope_references } from '../src/client/blocks.js'

describe('walk scope helpers', () => {
  it('lineup returns prefix of pages before current page', () => {
    const pages = [{ id: 'p1' }, { id: 'p2' }, { id: 'p3' }]
    const doc = {
      querySelectorAll(selector) {
        assert.strictEqual(selector, '.page')
        return pages
      },
    }
    const elem = {
      closest(selector) {
        assert.strictEqual(selector, '.page')
        return pages[1]
      },
    }
    const result = scope_lineup(elem, doc)
    assert.deepEqual(result, [pages[0], pages[1]])
  })

  it('references returns reference items from current page story', () => {
    const story = [
      { type: 'paragraph', text: 'ignore' },
      { type: 'reference', site: 'example.org', slug: 'one' },
      { type: 'reference', site: 'example.org', slug: 'two' },
    ]
    const wikiObj = {
      lineup: {
        atKey(key) {
          assert.strictEqual(key, 'page-key')
          return {
            getRawPage() {
              return { story }
            },
          }
        },
      },
    }
    const elem = {
      closest(selector) {
        assert.strictEqual(selector, '.page')
        return { dataset: { key: 'page-key' } }
      },
    }
    const result = scope_references(elem, wikiObj)
    assert.deepEqual(result, [story[1], story[2]])
  })
})
