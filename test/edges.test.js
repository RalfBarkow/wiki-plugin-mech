// build time tests for mech plugin EDGES rendering
// see http://mochajs.org/

(function() {
  const mech = require('../client/mech')
  const {describe,it} = (typeof global.describe === 'function' && typeof global.it === 'function')
    ? global
    : require('node:test')
  const expect = require('expect.js')

  describe('EDGES renderer', () => {
    const edges = [
      {fromId:'discourse.dreyeck.ch+trust-rent-and-the-motorboat-moment-of-ai', toId:'discourse.dreyeck.ch+claim-one', role:'claim', source:{fold:'Claim '}},
      {fromId:'discourse.dreyeck.ch+trust-rent-and-the-motorboat-moment-of-ai', toId:'discourse.dreyeck.ch+support-one', role:'support', source:{fold:'support'}},
      {fromId:'discourse.dreyeck.ch+trust-rent-and-the-motorboat-moment-of-ai', toId:'discourse.dreyeck.ch+oppose-one', role:'oppose', source:{fold:'Oppose'}},
      {fromId:'discourse.dreyeck.ch+trust-rent-and-the-motorboat-moment-of-ai', toId:'discourse.dreyeck.ch+question-one', role:'question', source:{fold:'question'}}
    ]
    const pagesById = {
      'discourse.dreyeck.ch+trust-rent-and-the-motorboat-moment-of-ai': {title:'Trust Rent and the Motorboat Moment of AI'}
    }

    it('renders claim group when claim edges exist', () => {
      const html = mech.renderEdgesHtml(edges,[],pagesById,'EDGES')
      expect(html).to.contain('<summary>claim (1)</summary>')
    })

    it('keeps summary counts consistent with groups', () => {
      const html = mech.renderEdgesHtml(edges,[],pagesById,'EDGES')
      const summary = html.match(/\(([^)]+)\)/)?.[1] || ''
      const summaryCounts = summary.split(', ').reduce((acc,entry) => {
        const [key,value] = entry.split(': ')
        if (!key || !value) return acc
        acc[key] = parseInt(value,10)
        return acc
      },{})
      const groupMatches = [...html.matchAll(/<summary>([^ ]+) \((\d+)\)<\/summary>/g)]
      const groupCounts = groupMatches.reduce((acc,match) => {
        acc[match[1]] = parseInt(match[2],10)
        return acc
      },{})
      const sumGroups = Object.values(groupCounts).reduce((sum,count) => sum + count, 0)
      const sumSummary = Object.values(summaryCounts).reduce((sum,count) => sum + count, 0)
      expect(sumGroups).to.be(edges.length)
      expect(sumSummary).to.be(edges.length)
    })

    it('removes site from displayed link labels', () => {
      const html = mech.renderEdgesHtml(edges,[],pagesById,'EDGES')
      expect(html).not.to.contain('discourse.dreyeck.ch')
      expect(html).to.contain('[[trust-rent-and-the-motorboat-moment-of-ai]]')
    })

    it('prefers title over slug in link labels', () => {
      const html = mech.renderEdgesHtml(edges,[],pagesById,'EDGES')
      expect(html).to.contain('[[Trust Rent and the Motorboat Moment of AI]]')
      expect(html).not.to.contain('[[trust-rent-and-the-motorboat-moment-of-ai]]')
    })
  })

}).call(this)
