import { describe, it } from 'node:test'
import assert from 'node:assert'
import { parse_extract_args } from '../src/client/blocks.js'

describe('parse_extract_args', () => {
  it('defaults to unbounded when no args provided', () => {
    const result = parse_extract_args([])
    assert.strictEqual(result.limit, null)
  })

  it('accepts a positive integer limit', () => {
    const result = parse_extract_args(['200'])
    assert.strictEqual(result.limit, 200)
  })
})
