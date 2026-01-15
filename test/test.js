// build time tests for mech plugin
// see http://mochajs.org/

(function() {
  const mech = require('../client/mech')
  const {describe,it} = require('node:test')
  const assert = require('node:assert')
  const tags = /<(\/?.\w+).*?>/g

  describe('mech plugin', () => {

    describe('expand', () => {
      it('can use math notations', () => {
        const result = mech.expand('a < b && c > d')
        assert.strictEqual(result, 'a &lt; b &amp;&amp; c &gt; d')
      })
    })

    describe('tree', () => {
      it('simple HELLO', () => {
        const lines = ['HELLO']
        const result = mech.tree(lines,[],0)
        assert.strictEqual(result[0].command, 'HELLO')
      })
      it('indented HELLO', () => {
        const lines = [' HELLO']
        const result = mech.tree(lines,[],0)
        assert.strictEqual(result[0][0].command, 'HELLO')
      })
      it('nested CLICK HELLO', () => {
        const lines = ['CLICK', ' HELLO', 'CLICK', ' HELLO world']
        const result = mech.tree(lines,[],0)
        assert.strictEqual(result[0].command, 'CLICK')
        assert.strictEqual(result[1][0].command, 'HELLO')
        assert.strictEqual(result[2].command, 'CLICK')
        assert.strictEqual(result[3][0].command, 'HELLO world')
      })
    })

    describe('format', () => {
      it('simple HELLO', () => {
        const lines = ['HELLO']
        const nest = mech.tree(lines,[],0)
        const html = mech.format(nest)
        const result = html.replaceAll(/<(\/?.\w+).*?>/g,"<$1>")
        assert.strictEqual(result, '<font></font><span>HELLO</span>')
      })
      it('nested CLICK HELLO', () => {
        const lines = ['CLICK',' HELLO']
        const nest = mech.tree(lines,[],0)
        const html = mech.format(nest)
        const result = html.replaceAll(/<(\/?.\w+).*?>/g,"<$1>")
        assert.strictEqual(result, '<font></font><span>CLICK</span>\n<div><font></font><span>HELLO</span></div>')
      })
    })

    describe('run', () => {
      it('simple HELLO', () => {
        const lines = ['HELLO']
        const nest = mech.tree(lines,[],0)
        const state = {}
        const elem = {
          get innerHTML() {return 'HELLO'},
          set innerHTML(name) {this.log.push(name);},
          log: []
        }
        mech.run(nest,state,elem)
        assert.strictEqual(elem.log.join('|'), 'HELLO 😀')
      })
      it('simple REPORT', () => {
        const lines = ['REPORT']
        const nest = mech.tree(lines,[],0)
        const state = {temperature: '98.6°F'}
        const elem = {
          get innerHTML() {return 'REPORT'},
          set innerHTML(name) {this.log.push(name);},
          get previousElementSibling() {return elem},
          log: []
        }
        mech.run(nest,state,elem)
        const result = elem.log.join('|').replaceAll(tags,"<$1>")
        assert.strictEqual(result, '|REPORT<br><font>98.6°F</font>')
      })
    })

  })

}).call(this)
