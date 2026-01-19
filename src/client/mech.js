import { tree, format } from './interpreter.js'
import { api, run } from './blocks.js'
;('use strict')
const MECH_BUILD =
  typeof globalThis !== 'undefined' && globalThis.__MECH_BUILD__
    ? globalThis.__MECH_BUILD__
    : {}
const MECH_VERSION =
  typeof __MECH_VERSION__ !== 'undefined' ? __MECH_VERSION__ : MECH_BUILD.MECH_VERSION || 'dev'
const MECH_BUILD_TIME =
  typeof __MECH_BUILD__ !== 'undefined' ? __MECH_BUILD__ : MECH_BUILD.MECH_BUILD_TIME || 'unknown'
const MECH_GIT_COMMIT =
  typeof __MECH_COMMIT__ !== 'undefined' ? __MECH_COMMIT__ : MECH_BUILD.MECH_GIT_COMMIT || 'nogit'
const stampKey = '__MECH_BUILD_STAMP__'
if (typeof console !== 'undefined' && console.info && typeof globalThis !== 'undefined' && !globalThis[stampKey]) {
  globalThis[stampKey] = true
  console.info('[mech]', 'version:', MECH_VERSION, 'build:', MECH_BUILD_TIME, 'commit:', MECH_GIT_COMMIT)
}
export const uniq = (value, index, self) => self.indexOf(value) === index
export const delay = time => new Promise(res => setTimeout(res, time))
export const asSlug = title =>
  title
    .replace(/\s/g, '-')
    .replace(/[^A-Za-z0-9-]/g, '')
    .toLowerCase()

function expand(text) {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

// P L U G I N

function emit($item, item) {
  const lines = item.text.split(/\n/)
  const nest = tree(lines, [], 0)
  const html = format(nest)
  const $page = $item.parents('.page')
  const pageKey = $page.data('key')
  const context = {
    item,
    itemId: item.id,
    pageKey,
    page: wiki.lineup.atKey(pageKey).getRawPage(),
    origin: window.origin,
    site: $page.data('site') || window.location.host,
    slug: $page.attr('id'),
    title: $page.data('data').title,
  }
  const state = { context, api }
  $item.append(`<div style="background-color:#eee;padding:15px;border-top:8px;">${html}</div>`)
  run(nest, state)
}

function bind($item, item) {
  return $item.dblclick(() => {
    return wiki.textEditor($item, item)
  })
}

if (typeof window !== 'undefined' && window !== null) {
  window.plugins = window.plugins || {}
  if (!window.plugins.mech) window.plugins.mech = { emit, bind }
}

export { expand, tree, format, run }
export { emit, bind }
