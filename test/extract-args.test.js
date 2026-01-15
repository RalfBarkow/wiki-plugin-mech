// build time tests for mech plugin extract arg parsing
// see http://mochajs.org/

(function() {
  const mech = require('../client/mech')
  const {describe,it} = (typeof global.describe === 'function' && typeof global.it === 'function')
    ? global
    : require('node:test')
  const assert = require('node:assert')

  describe('parse_extract_args', () => {
    it('defaults to unbounded when no args provided', () => {
      const result = mech.parse_extract_args([])
      assert.strictEqual(result.limit, null)
    })

    it('accepts a positive integer limit', () => {
      const result = mech.parse_extract_args(['200'])
      assert.strictEqual(result.limit, 200)
    })
  })

}).call(this)
