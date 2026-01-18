import { describe, it } from 'node:test'
import assert from 'node:assert'
import { renderEdgesHtml } from '../src/client/blocks.js'

describe('EDGES renderer', () => {
  const edges = [
    {
      fromId: 'discourse.dreyeck.ch+trust-rent-and-the-motorboat-moment-of-ai',
      toId: 'discourse.dreyeck.ch+claim-one',
      role: 'claim',
      source: { fold: 'Claim ' },
    },
    {
      fromId: 'discourse.dreyeck.ch+trust-rent-and-the-motorboat-moment-of-ai',
      toId: 'discourse.dreyeck.ch+support-one',
      role: 'support',
      source: { fold: 'support' },
    },
    {
      fromId: 'discourse.dreyeck.ch+trust-rent-and-the-motorboat-moment-of-ai',
      toId: 'discourse.dreyeck.ch+oppose-one',
      role: 'oppose',
      source: { fold: 'Oppose' },
    },
    {
      fromId: 'discourse.dreyeck.ch+trust-rent-and-the-motorboat-moment-of-ai',
      toId: 'discourse.dreyeck.ch+question-one',
      role: 'question',
      source: { fold: 'question' },
    },
  ]
  const pagesById = {
    'discourse.dreyeck.ch+trust-rent-and-the-motorboat-moment-of-ai': {
      title: 'Trust Rent and the Motorboat Moment of AI',
    },
    'discourse.dreyeck.ch+claim-one': { title: 'Claim One' },
  }

  it('renders claim group when claim edges exist', () => {
    const html = renderEdgesHtml(edges, [], pagesById, 'EDGES')
    assert(html.includes('<summary>claim (1)</summary>'), 'Should contain claim group with count 1')
  })

  it('keeps summary counts consistent with groups', () => {
    const html = renderEdgesHtml(edges, [], pagesById, 'EDGES')

    const summaryMatch = html.match(/\(([^)]+)\)/)
    const summaryText = summaryMatch ? summaryMatch[1] : ''
    const summaryCounts = {}

    summaryText.split(', ').forEach(entry => {
      const [key, value] = entry.split(': ')
      if (key && value) summaryCounts[key] = parseInt(value, 10)
    })

    const groupRegex = /<summary>([^ ]+) \((\d+)\)<\/summary>/g
    const groupCounts = {}
    let match
    while ((match = groupRegex.exec(html)) !== null) {
      groupCounts[match[1]] = parseInt(match[2], 10)
    }

    const sumGroups = Object.values(groupCounts).reduce((sum, count) => sum + count, 0)
    const sumSummary = Object.values(summaryCounts).reduce((sum, count) => sum + count, 0)

    assert.strictEqual(sumGroups, edges.length, 'Group count total should match edges length')
    assert.strictEqual(sumSummary, edges.length, 'Summary count total should match edges length')
  })

  it('renders links with site-aware /view URLs', () => {
    const html = renderEdgesHtml(edges, [], pagesById, 'EDGES')
    assert(
      html.includes('href="//discourse.dreyeck.ch/view/trust-rent-and-the-motorboat-moment-of-ai"'),
      'Should contain site-qualified /view URL',
    )
    assert(!html.includes('>discourse.dreyeck.ch'), 'Should not contain site domain in link text')
    assert(
      !html.includes('href="/view/"') && !html.includes('href="//discourse.dreyeck.ch/view/"'),
      'Should not render empty slug hrefs',
    )
  })

  it('prefers title over slug in link labels', () => {
    const html = renderEdgesHtml(edges, [], pagesById, 'EDGES')
    assert(html.includes('Trust Rent and the Motorboat Moment of AI'), 'Should use title for link label')
    assert(
      html.includes('href="//discourse.dreyeck.ch/view/trust-rent-and-the-motorboat-moment-of-ai"'),
      'Href should use slug even when title is available',
    )
  })

  it('shows all edges by default without a limit label', () => {
    const html = renderEdgesHtml(edges, [], pagesById, 'EDGES')
    assert(html.includes('4/4 edges'), 'Default should show all edges')
    assert(!html.includes('limit:'), 'Default should not include a limit label')
  })

  it('shows slug when title is unknown', () => {
    const html = renderEdgesHtml(edges, [], {}, 'EDGES')
    assert(html.includes('>trust-rent-and-the-motorboat-moment-of-ai<'), 'Should show slug when title is unknown')
    assert(
      html.includes('href="//discourse.dreyeck.ch/view/trust-rent-and-the-motorboat-moment-of-ai"'),
      'Should keep slug for href when title is unknown',
    )
  })

  it('applies limit when provided and includes limit label', () => {
    const html = renderEdgesHtml(edges, ['2'], pagesById, 'EDGES')
    assert(html.includes('2/4 edges'), 'Limit should reduce visible edges')
    assert(html.includes('(limit: 2)'), 'Limit label should be included when set')
  })

  it('summary counts reflect filtered edges beyond the visible limit', () => {
    const manyEdges = []
    for (let i = 0; i < 24; i++) {
      manyEdges.push({
        fromId: 'example.org+source-page',
        toId: `example.org+support-${i}`,
        role: 'support',
        source: { fold: 'support' },
      })
    }
    manyEdges.push({
      fromId: 'example.org+source-page',
      toId: 'example.org+claim-one',
      role: 'claim',
      source: { fold: 'claim' },
    })
    manyEdges.push({
      fromId: 'example.org+source-page',
      toId: 'example.org+claim-two',
      role: 'claim',
      source: { fold: 'claim' },
    })
    for (let i = 0; i < 5; i++) {
      manyEdges.push({
        fromId: 'example.org+source-page',
        toId: `example.org+question-${i}`,
        role: 'question',
        source: { fold: 'question' },
      })
    }
    const html = renderEdgesHtml(manyEdges, ['25'], {}, 'EDGES')
    assert(html.includes('claim: 2'), 'Summary should include claim: 2 for all filtered edges')
  })
})
