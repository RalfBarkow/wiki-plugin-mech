import { describe, it } from 'node:test'
import assert from 'node:assert'
import { extract_edges_from_story } from '../src/client/blocks.js'

describe('extract_edges_from_story', () => {
  const recognized = new Set(['question', 'claim', 'support', 'oppose'])

  it('claim fold produces a claim edge from paragraph link', () => {
    const story = [
      { type: 'pagefold', text: 'Claim' },
      { type: 'paragraph', text: 'See [[target-page]]' },
    ]
    const stats = { encountered: {}, unknown: {} }
    const result = extract_edges_from_story(story, 'example.org+source-page', recognized, stats)
    assert.strictEqual(result.edges.length, 1)
    assert.strictEqual(result.edges[0].role, 'claim')
    assert.strictEqual(result.edges[0].fromId, 'example.org+source-page')
    assert(result.edges[0].toId.endsWith('+target-page'))
    assert.strictEqual(result.edgesByRole.claim, 1)
  })

  it('unknown fold produces no edges and increments foldsUnknown', () => {
    const story = [
      { type: 'pagefold', text: 'Hypothesis' },
      { type: 'paragraph', text: 'See [[target-page]]' },
    ]
    const stats = { encountered: {}, unknown: {} }
    const result = extract_edges_from_story(story, 'example.org+source-page', recognized, stats)
    assert.strictEqual(result.edges.length, 0)
    assert.strictEqual(stats.unknown.hypothesis, 1)
  })

  it('support fold with two links produces two support edges', () => {
    const story = [
      { type: 'pagefold', text: 'Support' },
      { type: 'paragraph', text: '[[one]] and [[two]]' },
    ]
    const stats = { encountered: {}, unknown: {} }
    const result = extract_edges_from_story(story, 'example.org+source-page', recognized, stats)
    assert.strictEqual(result.edges.length, 2)
    assert.strictEqual(result.edgesByRole.support, 2)
  })

  it('slugifies paragraph links derived from titles', () => {
    const story = [
      { type: 'pagefold', text: 'Claim' },
      { type: 'paragraph', text: 'See [[Claim Link Survey]]' },
    ]
    const stats = { encountered: {}, unknown: {} }
    const result = extract_edges_from_story(story, 'example.org+source-page', recognized, stats)
    assert.strictEqual(result.edges.length, 1)
    assert(result.edges[0].toId.endsWith('+claim-link-survey'))
  })

  it('recognized fold but no link yields no edges', () => {
    const story = [
      { type: 'pagefold', text: 'Claim' },
      { type: 'paragraph', text: 'No links here.' },
    ]
    const stats = { encountered: {}, unknown: {} }
    const result = extract_edges_from_story(story, 'example.org+source-page', recognized, stats)
    assert.strictEqual(result.edges.length, 0)
    assert.strictEqual(result.edgesByRole.claim, 0)
  })
})
