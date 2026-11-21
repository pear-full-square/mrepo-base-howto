// The package's protocol as it is mounted: its protocol.js, what a runtime
// loads through the dispatcher's /protocol entry (imported here directly:
// this test is itself run by the dispatcher), its config value by value,
// each action run on a minimal execution, in memory, up to where it would
// ask Docker: what it answers and what it refuses with no replica there.
// No mrepo is built and no container made. Every action the config names
// must be run here: the last test fails when one was left out.
import test from '../../modules/node_modules/brittle/index.js'
import * as mounted from '../../protocol.js'

const B = v => Buffer.from(JSON.stringify(v))
const abs = p => (p.startsWith('/') ? p : `/${p}`)
// An execution as an action sees it: the mrepo it runs in (a swarm's node,
// by its unique URI), the files it reads and selects by path, its writes
// kept in order.
function execution (files = {}, runtime = { name: 'node-1', uri: 'swarm-1/node-1', dir: '/w/mrepos/swarm-1/node-1', work: '/w' }) {
  const writes = []
  const exec = {
    runtime,
    read: async path => { if (!(abs(path) in files)) throw new Error(`nothing at ${path}`); return files[abs(path)] },
    // the rest of an execution context, standing in: a file that may not
    // be there, the log (kept: entries), a step run as it is
    find: async function (p) { try { return await this.read(p) } catch { return null } },
    log: function (level, event, data = {}) { (this.entries ??= []).push({ level, event, ...data }) },
    step: async function (event, data, fn, level = 'verbose') { const r = await fn(); (this.entries ??= []).push({ level, event, ...(typeof data === 'function' ? data(r) : data) }); return r },
    select: async pattern => { const p = abs(pattern); return p in files ? [[p, { type: 'blob' }]] : Object.keys(files).some(f => f.startsWith(p + '/')) ? [[p, { type: 'tree' }]] : [] },
    put: (path, bytes) => { writes.push(['put', abs(path)]); files[abs(path)] = Buffer.from(bytes) },
    remove: path => { writes.push(['remove', abs(path)]); delete files[abs(path)] }
  }
  return { exec, writes, files }
}
const ran = new Set()
// an action that wrote into the execution's log as it ran: every one must
const logged = new Set()
const act = async (name, exec) => {
  ran.add(name)
  const before = exec.entries?.length ?? 0
  // (one refused has logged too, before it threw)
  try { return await mounted.actions.container[name](exec, { uri: ['main', '.'], args: [] }) } finally { if ((exec.entries?.length ?? 0) > before) logged.add(name) }
}

test('loaded as a runtime loads it: one protocol, container, its config and its actions', (t) => {
  t.alike(Object.keys(mounted.protocols), ['container'], 'the package provides the container protocol, and no other')
  t.alike(Object.keys(mounted.actions), ['container'])
  t.alike(Object.keys(mounted.actions.container).sort(), Object.keys(mounted.protocols.container.actions).sort(), 'a function for every action configured, and no other')
})

test('its config, value by value', (t) => {
  const cfg = mounted.protocols.container
  t.is(cfg.package, 'haiccing/base-package-container', 'the package that brings it')
  t.ok(cfg.description, 'its description')
  t.alike(Object.keys(cfg).sort(), ['actions', 'description', 'package'], 'nothing else: no default action, not behind a state')
  t.alike(Object.keys(cfg.actions).sort(), ['create', 'remove', 'start', 'status', 'stop'], 'create, start, stop, remove and status')
  for (const [name, a] of Object.entries(cfg.actions)) {
    t.alike(Object.keys(a).sort(), ['description', 'uris'], `${name}: its URIs and its description, nothing else: no target, no arguments, no states`)
    t.alike(a.uris, ['.'], `${name}: at the mrepo itself, the one whose replica it is about`)
    t.ok(a.description, `${name}: its description`)
  }
})

test('no replica there: status says none; start, stop and remove say so; nothing written', async (t) => {
  const { exec, writes } = execution({ '/main/layer.json': B({}) })
  t.alike(await act('status', exec), { replica: null, state: 'none' }, 'status: none, without asking Docker')
  await t.exception(act('start', exec), /no replica: container \(container\/create\)/, 'start: no replica, create first')
  await t.exception(act('stop', exec), /no replica: container \(container\/create\)/, 'stop the same')
  await t.exception(act('remove', exec), /no replica: container/, 'remove: none')
  t.alike(writes, [], 'nothing written by any of it')
  t.alike(exec.entries.filter(e => e.event === 'replica').map(e => [e.at, e.mrepo, e.dir, /^haicc-swarm-1-node-1-[0-9a-f]{8}$/.test(e.container)])[0], ['container', 'swarm-1/node-1/container', '/w/containers/swarm-1/node-1', true], 'the replica each is about, at debug: linked at container, its unique URI the mrepo\'s with container behind it, its folder beside the mrepos, its container\'s name')
})

test('what create refuses before anything is made', async (t) => {
  // the position holding data of the mrepo's own
  const local = execution({ '/main/layer.json': B({}), '/main/container/notes.json': B(1) })
  await t.exception(act('create', local.exec), /container exists locally: the container protocol cannot use it/, 'data in main at container: not the replica\'s place')
  await t.exception(act('remove', local.exec), /container exists locally/, 'nor removed as one')
  // a replica there already
  const there = execution({ '/main/layer.json': B({}), '/main/container/.node.json': B({}), '/main/container/.shortcuts.json': B([{ mrepo: 'swarm-1/node-1/container', link: 'k' }]), '/links/k.json': B({ key: 'k', uri: 'swarm-1/node-1/container', at: 'container', how: 'container' }) })
  await t.exception(act('create', there.exec), /created already: container/, 'a replica there already')
  // an mrepo without a unique URI of a swarm's kind
  const boot = execution({ '/main/layer.json': B({}) }, { name: 'boot', uri: 'boot', dir: '/w/mrepos/boot', work: '/w' })
  await t.exception(act('create', boot.exec), /no unique URI to make a replica by: boot \(<swarm>\/<name>, a path\)/, 'no unique URI: no replica')
  t.alike([local.writes, there.writes, boot.writes], [[], [], []], 'nothing written by any of it')
})

test('every action the config names was run here', (t) => {
  t.alike([...ran].sort(), Object.keys(mounted.protocols.container.actions).sort(), 'create, remove, start, status and stop')
  t.alike([...logged].sort(), Object.keys(mounted.protocols.container.actions).sort(), 'and each wrote into the request\'s log as it ran: an action that logs nothing fails this')
})
