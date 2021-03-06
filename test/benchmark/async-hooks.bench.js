'use strict'

var helper = require('../lib/agent_helper')
var benchmark = require('../lib/benchmark')

var suite = benchmark.createBenchmark({
  name: 'async hooks',
  async: true,
  fn: test
})

var asyncHooks = require('async_hooks')
var noopHook = asyncHooks.createHook({
  init: function() {},
  before: function() {},
  after: function() {},
  destroy: function() {}
})

var tests = [
  {name: 'no agent, no hooks'},
  {
    name: 'no agent, noop async hooks',
    before: function registerHook() {
      noopHook.enable()
    },
    after: function deregisterHook() {
      noopHook.disable()
    }
  },
  {
    name: 'instrumentation',
    agent: {feature_flag: {await_support: false}},
    runInTransaction: true
  },
  {
    name: 'agent async hooks',
    agent: {feature_flag: {await_support: true}},
    runInTransaction: true
  }
]

tests.forEach((test) => suite.add(test))

suite.run()

function test(agent, cb) {
  var p = Promise.resolve()
  for (var i = 0; i < 300; ++i) {
    p = p.then(function noop() {})
  }
  p.then(cb)
}
