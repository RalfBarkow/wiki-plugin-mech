import { describe, it } from 'node:test'
import assert from 'node:assert'
import { renderNeighborsDetails } from '../src/client/blocks.js'

describe('renderNeighborsDetails', () => {
  it('renders done/inflight/error labels', () => {
    const html = renderNeighborsDetails({
      'done.example': { status: 'done', pages: 3, updatedAt: 1 },
      'inflight.example': { status: 'inflight', pages: 0, updatedAt: 2 },
      'error.example': { status: 'error', pages: 0, updatedAt: 3 },
    })
    assert(html.includes('<td>done</td>'))
    assert(html.includes('<td>inflight</td>'))
    assert(html.includes('<td>error</td>'))
  })
})
