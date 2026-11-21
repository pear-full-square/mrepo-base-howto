// The package's protocol as it is mounted: its protocol.js, what a runtime
// loads through the dispatcher's /protocol entry (imported here directly:
// this test is itself run by the dispatcher), its config value by value,
// and its action run on a minimal execution, the swarm said to it as the
// node's rns would. No mrepo is built. Every action the config names must
// be run here: the last test fails when one was left out.
import test from '../../modules/node_modules/brittle/index.js'
import * as mounted from '../../protocol.js'

// An execution as an action sees it: the mrepo's folder and unique URI;
// what it sent on, what it ran here, its log.
function execution () {
  const e = { runtime: { dir: '/work/mrepos/swarm-1/node-1', uri: 'swarm-1/node-1' }, entries: [], forwarded: null, log (level, event, data = {}) { e.entries.push({ level, event, ...data }) }, forward (to, command) { e.forwarded = { to, command }; return null }, run: async command => ({ ran: command }) }
  return e
}
const NODES = { 'swarm-1/node-1': { machine: 'here', folder: '/work/mrepos/swarm-1/node-1' }, 'swarm-1/node-2': { machine: 'here', folder: '/work/mrepos/swarm-1/node-2' }, 'swarm-1/far': { machine: 'elsewhere', folder: '/x' } }
const how = { machine: 'here', swarm: { resolve: async uri => { if (!NODES[uri]) throw new Error(`not registered: ${uri}`); return { uri, state: 'active', ...NODES[uri] } } } }
const ran = new Set()
// an action that wrote into the execution's log as it ran: every one must
const logged = new Set()
const act = async (name, exec, form) => {
  ran.add(name)
  const before = exec.entries.length
  try { return await mounted.actions.dispatch[name](exec, form, how) } finally { if (exec.entries.length > before) logged.add(name) }
}

test('loaded as a runtime loads it: one protocol, dispatch, its config and its action', (t) => {
  t.alike(Object.keys(mounted.protocols), ['dispatch'], 'the package provides the dispatch protocol, and no other')
  t.alike(Object.keys(mounted.actions), ['dispatch'])
  t.alike(Object.keys(mounted.actions.dispatch).sort(), Object.keys(mounted.protocols.dispatch.actions).sort(), 'a function for every action configured, and no other')
})

test('its config, value by value', (t) => {
  const cfg = mounted.protocols.dispatch
  t.is(cfg.package, 'haiccing/base-package-dispatch', 'the package that brings it')
  t.ok(cfg.description, 'its description')
  t.alike(Object.keys(cfg).sort(), ['actions', 'description', 'package'], 'nothing else: no default action, not behind a state of its own')
  t.alike(Object.keys(cfg.actions), ['send'])
  t.alike([cfg.actions.send.uris, cfg.actions.send.target], [['**'], true], 'send: at a unique URI, a target needed')
  t.alike(cfg.actions.send.args, ['command', 'arguments?'], 'the command, then its arguments')
  t.ok(cfg.actions.send.description, 'its description')
  t.absent('states' in cfg.actions.send, 'no states')
})

test('send: resolved by rns, delivered into the node\'s inbox folder on this machine; this node itself; another machine; none', async (t) => {
  const exec = execution()
  t.is(await act('send', exec, { uri: ['main', 'swarm-1/node-2'], args: ['crud/read', '.'] }), null, 'sent on: the request waits for its answer')
  t.alike(exec.forwarded, { to: { at: 'swarm-1/node-2', mrepo: 'swarm-1/node-2', folder: '../node-2', dir: '/work/mrepos/swarm-1/node-2' }, command: ['crud/read', '.'] }, 'to the node\'s own folder, the command as it is')
  const below = execution()
  await act('send', below, { uri: ['main', 'swarm-1/node-2/notes'], args: ['crud/read', '.'] })
  t.alike(below.forwarded.command, ['haicc', 'notes', 'crud/read', '.'], 'what follows the unique URI: the command goes on to it there')
  t.alike(await act('send', execution(), { uri: ['main', 'swarm-1/node-1'], args: ['info/get'] }), { ran: ['info/get'] }, 'this node itself: executed here')
  await t.exception(act('send', execution(), { uri: ['main', 'swarm-1/far'], args: ['info/get'] }), /not reachable yet: swarm-1\/far lives on elsewhere/, 'a node on another machine: not built, said')
  await t.exception(act('send', execution(), { uri: ['main', 'swarm-1/nope'], args: ['info/get'] }), /no node of the swarm by that unique URI: swarm-1\/nope/)
})

test('nothing forgotten: every action configured run here, each writing into the request\'s log', (t) => {
  t.alike([...ran].sort(), Object.keys(mounted.protocols.dispatch.actions).sort(), 'every action run')
  t.alike([...logged].sort(), Object.keys(mounted.protocols.dispatch.actions).sort(), 'each one logged as it ran')
})
