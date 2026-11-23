// The package's protocol as it is mounted: its protocol.js, what a runtime
// loads through the dispatcher's /protocol entry (imported here directly:
// this test is itself run by the dispatcher), its config value by value,
// and each action run on a minimal execution: an mrepo's runtime view
// written for the test. No mrepo is built. Every action the config names
// must be run here: the last test fails when one was left out.
import test from '../../modules/node_modules/brittle/index.js'
import * as mounted from '../../protocol.js'

const B = v => Buffer.from(typeof v === 'string' ? v : JSON.stringify(v))

// An execution as an action sees it: an mrepo's files by path, its
// runtime's view (the protocols loaded, read access), its log.
function execution (files, protocols) {
  const abs = p => (p.startsWith('/') ? p : `/${p}`)
  const find = async p => (abs(p) in files ? B(files[abs(p)]) : null)
  const read = async p => { if (!(abs(p) in files)) throw new Error(`nothing at ${p}`); return B(files[abs(p)]) }
  const select = async pattern => Object.keys(files).filter(p => p.startsWith(abs(pattern).replace(/\*$/, ''))).map(p => [p])
  return { runtime: { protocols, find, read, select }, find, read, select, log: function (level, event, data = {}) { (this.entries ??= []).push({ level, event, ...data }) } }
}
const ran = new Set()
// an action that wrote into the execution's log as it ran: every one must
const logged = new Set()
const act = async (name, exec, form) => {
  ran.add(name)
  const before = exec.entries?.length ?? 0
  try { return await mounted.actions.help[name](exec, form) } finally { if ((exec.entries?.length ?? 0) > before) logged.add(name) }
}

test('loaded as a runtime loads it: one protocol, help, its config and its actions', (t) => {
  t.alike(Object.keys(mounted.protocols), ['help'], 'the package provides the help protocol, and no other')
  t.alike(Object.keys(mounted.actions), ['help'])
  t.alike(Object.keys(mounted.actions.help).sort(), Object.keys(mounted.protocols.help.actions).sort(), 'a function for every action configured, and no other')
})

test('its config, value by value', (t) => {
  const cfg = mounted.protocols.help
  t.is(cfg.package, 'haiccing/base-package-help', 'the package that brings it')
  t.ok(cfg.description, 'its description')
  t.alike(Object.keys(cfg).sort(), ['actions', 'default', 'description', 'package'], 'nothing else: not behind a state')
  t.is(cfg.default, 'annotate', 'its default action: help alone is help/annotate')
  t.alike(Object.keys(cfg.actions), ['annotate'])
  t.alike(cfg.actions.annotate.uris, ['**'], 'annotate: wherever the command would run')
  t.alike(cfg.actions.annotate.args, ['command', 'arguments?'], 'the command\'s <protocol>/<action>, then its arguments')
  t.ok(cfg.actions.annotate.description, 'its description')
  t.absent('states' in cfg.actions.annotate || 'target' in cfg.actions.annotate, 'no states, no target')
})

test('annotate: a command explained where it would run, nothing of it executed', async (t) => {
  const protocols = { ...mounted.protocols, crud: { package: 'haiccing/base-package-crud', default: 'read', actions: { read: { uris: ['**'], description: 'The nodes at a URI, read.' } } } }
  const files = {
    '/protocols/help.json': '{}',
    '/protocols/crud.json': '{}',
    '/runtime/service.json': '{"state":"started"}',
    '/info/index.json': JSON.stringify({ 'haiccing/base-package-crud/read': [{ page: 'packages/haiccing/base-package-crud/read/README.md', oneliner: 'Reads.', below: [] }] }),
    '/info/packages/haiccing/base-package-crud/read/README.md': '# read\n\nReads.\n'
  }
  const exec = execution(files, protocols)
  const before = JSON.stringify(files)
  const a = await act('annotate', exec, { protocol: 'help', action: 'annotate', uri: ['main', 'swarms'], args: ['crud/read'] })
  t.alike(a, { help: 'crud/read swarms', does: 'The nodes at a URI, read.', door: 'taken here, now', arguments: 'none', run: 'crud/read swarms', more: 'info/get haiccing/base-package-crud/read', answer: ['crud/read swarms: The nodes at a URI, read.', 'Taken here, now.', 'Arguments: none.', 'To run it: crud/read swarms', 'To read more: info/get haiccing/base-package-crud/read'] }, 'what it does, the door here and now, its arguments, to run it, to read more; the same in natural language')
  t.is((await act('annotate', exec, { protocol: 'help', action: 'annotate', uri: ['main', 'x'], args: ['crud/update'] })).door, 'refused here: no action: crud update (read)', 'refused: said why')
  t.is(JSON.stringify(files), before, 'nothing written')
})

test('nothing forgotten: every action configured run here, each writing into the request\'s log', (t) => {
  t.alike([...ran].sort(), Object.keys(mounted.protocols.help.actions).sort(), 'every action run')
  t.alike([...logged].sort(), Object.keys(mounted.protocols.help.actions).sort(), 'each one logged as it ran')
})
