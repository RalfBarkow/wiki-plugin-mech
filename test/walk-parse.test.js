import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { parse_walk_command } from '../src/client/blocks.js'

describe('parse_walk_command', () => {
  it('parses questions to singular', () => {
    const { count, way } = parse_walk_command('WALK 10 questions')
    assert.strictEqual(count, '10')
    assert.strictEqual(way, 'question')
  })

  it('parses claims to singular', () => {
    const { count, way } = parse_walk_command('WALK 30 claims')
    assert.strictEqual(count, '30')
    assert.strictEqual(way, 'claim')
  })
})
