// build time tests for mech plugin neighbors rendering
// see http://mochajs.org/

(function() {
  const mech = require('../client/mech')
  const {describe,it} = (typeof global.describe === 'function' && typeof global.it === 'function')
    ? global
    : require('node:test')
  const assert = require('node:assert')

  describe('renderNeighborsDetails', () => {
    it('renders done/inflight/error labels', () => {
      const html = mech.renderNeighborsDetails({
        'done.example': {status:'done', pages: 3, updatedAt: 1},
        'inflight.example': {status:'inflight', pages: 0, updatedAt: 2},
        'error.example': {status:'error', pages: 0, updatedAt: 3}
      })
      assert(html.includes('<td>done</td>'))
      assert(html.includes('<td>inflight</td>'))
      assert(html.includes('<td>error</td>'))
    })
  })

}).call(this)
