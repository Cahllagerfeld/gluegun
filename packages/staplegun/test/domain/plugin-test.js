const test = require('ava')
const Plugin = require('../../src/domain/plugin')

test('default state', t => {
  const plugin = new Plugin()
  t.truthy(plugin)
  t.is(plugin.loadState, 'none')
  t.is(plugin.errorState, 'none')
  t.falsy(plugin.directory)
  t.falsy(plugin.namespace)
  t.deepEqual(plugin.commands, [])
  t.deepEqual(plugin.defaults, {})
  t.falsy(plugin.exception)
})
