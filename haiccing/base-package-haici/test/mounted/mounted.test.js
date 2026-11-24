// The package's protocol as it is mounted: its protocol.js, what a runtime
// loads through the dispatcher's /protocol entry (imported here directly:
// this test is itself run by the dispatcher), its config value by value,
// and each action run on a minimal execution: a request's id and an
// mrepo's runtime view written for the test. No mrepo is built. Every
// action the config names must be run here: the last test fails when one
// was left out.
import test from '../../modules/node_modules/brittle/index.js'
import * as mounted from '../../protocol.js'

// An execution as an action sees it: its request's id, the runtime's view
// (the protocols loaded), its log; a write throws.
function execution (protocols) {
  const nope = () => { throw new Error('written') }
  return { id: '1795312345678', runtime: { protocols }, put: nope, remove: nope, log: function (level, event, data = {}) { (this.entries ??= []).push({ level, event, ...data }) } }
}
const ran = new Set()
// an action that wrote into the execution's log as it ran: every one must
const logged = new Set()
const act = async (name, exec, form) => {
  ran.add(name)
  const before = exec.entries?.length ?? 0
  try { return await mounted.actions.haici[name](exec, form) } finally { if ((exec.entries?.length ?? 0) > before) logged.add(name) }
}

test('loaded as a runtime loads it: one protocol, haici, its config and its actions', (t) => {
  t.alike(Object.keys(mounted.protocols), ['haici'], 'the package provides the haici protocol, and no other')
  t.alike(Object.keys(mounted.actions), ['haici'])
  t.alike(Object.keys(mounted.actions.haici).sort(), Object.keys(mounted.protocols.haici.actions).sort(), 'a function for every action configured, and no other')
})

test('its config, value by value', (t) => {
  const cfg = mounted.protocols.haici
  t.is(cfg.package, 'haiccing/base-package-haici', 'the package that brings it')
  t.ok(cfg.description, 'its description')
  t.alike(Object.keys(cfg).sort(), ['actions', 'default', 'description', 'package'], 'nothing else: not behind a state')
  t.is(cfg.default, 'feedback', 'its default action: haici alone is haici/feedback')
  t.alike(Object.keys(cfg.actions), ['feedback'])
  t.alike(cfg.actions.feedback.uris, ['**'], 'feedback: wherever the command would run')
  t.alike(cfg.actions.feedback.args, ['text', 'command', 'arguments?'], 'the text, then the command\'s <protocol>/<action> and its arguments')
  t.ok(cfg.actions.feedback.description, 'its description')
  t.absent('states' in cfg.actions.feedback || 'target' in cfg.actions.feedback, 'no states, no target')
})

test('feedback: recorded where the command would run, nothing of it executed, nothing written', async (t) => {
  const protocols = { ...mounted.protocols, crud: { default: 'read', actions: { read: { uris: ['**'] } } } }
  const exec = execution(protocols)
  const f = await act('feedback', exec, { protocol: 'haici', action: 'feedback', uri: ['main', 'swarms'], args: ['the list is empty', 'crud/read'] })
  t.alike(f, { feedback: 'recorded', on: 'crud/read swarms', id: '1795312345678', read: 'crud/read done/17953/179531/1795312345678.json --flags layer=request', answer: ['Feedback on crud/read swarms recorded: request 1795312345678.', 'To read it back: crud/read done/17953/179531/1795312345678.json --flags layer=request'] }, 'the command as understood, the request\'s id, to read it back; the same in natural language')
  await t.exception(act('feedback', exec, { protocol: 'haici', action: 'feedback', uri: ['main', 'x'], args: ['crud/read'] }), /missing argument: command/, 'no text: the command taken for it, none after it')
})

test('nothing forgotten: every action configured run here, each writing into the request\'s log', (t) => {
  t.alike([...ran].sort(), Object.keys(mounted.protocols.haici.actions).sort(), 'every action run')
  t.alike([...logged].sort(), Object.keys(mounted.protocols.haici.actions).sort(), 'each one logged as it ran')
})
