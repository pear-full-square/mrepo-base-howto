// The package's protocol as it is mounted: its protocol.js, what a runtime
// loads through the dispatcher's /protocol entry (imported here directly:
// this test is itself run by the dispatcher), its config value by value,
// each action run on a minimal execution, in memory: what it reads and
// writes. No mrepo is built. Every action the config names must be run
// here: the last test fails when one was left out.
import test from '../../modules/node_modules/brittle/index.js'
import * as mounted from '../../protocol.js'

const B = v => Buffer.from(JSON.stringify(v))
const abs = p => (p.startsWith('/') ? p : `/${p}`)
// An execution as an action sees it: the files it reads and selects by
// path (given relative or slash-led), its writes kept in order.
function execution (files = {}) {
  const writes = []
  const kind = p => (p in files ? 'blob' : Object.keys(files).some(f => f.startsWith(p + '/')) ? 'tree' : null)
  const exec = {
    read: async path => { if (!(abs(path) in files)) throw new Error(`nothing at ${path}`); return files[abs(path)] },
    // the rest of an execution context, standing in: a file that may not
    // be there, the log (kept: entries), a step run as it is
    find: async function (p) { try { return await this.read(p) } catch { return null } },
    log: function (level, event, data = {}) { (this.entries ??= []).push({ level, event, ...data }) },
    step: async function (event, data, fn, level = 'verbose') { const r = await fn(); (this.entries ??= []).push({ level, event, ...(typeof data === 'function' ? data(r) : data) }); return r },
    select: async pattern => {
      const p = abs(pattern)
      if (!p.endsWith('/*')) return p in files ? [[p, { type: 'blob' }]] : Object.keys(files).some(f => f.startsWith(p + '/')) ? [[p, { type: 'tree' }]] : []
      const folder = p.slice(0, -1)
      const seen = new Map()
      for (const f of Object.keys(files).filter(f => f.startsWith(folder))) {
        const [name, ...rest] = f.slice(folder.length).split('/')
        if (!seen.has(name)) seen.set(name, [folder + name, { type: rest.length ? 'tree' : 'blob' }])
      }
      return [...seen.values()].sort((a, b) => (a[0] < b[0] ? -1 : 1))
    },
    // the tree itself, for a query: a node its path here
    node: async u => (kind(abs(u)) ? { type: kind(abs(u)), p: abs(u) } : null),
    children: async n => (n.type === 'blob' ? null : [...new Set(Object.keys(files).filter(f => f.startsWith(n.p + '/')).map(f => f.slice(n.p.length + 1).split('/')[0]))].sort().map(name => [name, { type: kind(`${n.p}/${name}`), p: `${n.p}/${name}` }])),
    bytes: async n => files[n.p],
    put: (path, bytes) => { writes.push(['put', abs(path), JSON.parse(bytes.toString())]); files[abs(path)] = Buffer.from(bytes) },
    remove: path => { writes.push(['remove', abs(path)]); delete files[abs(path)] },
    commit: async () => {}
  }
  return { exec, writes, files }
}
const ran = new Set()
// an action that wrote into the execution's log as it ran: every one must
const logged = new Set()
const act = async (name, exec, form) => {
  ran.add(name)
  const before = exec.entries?.length ?? 0
  // (one refused has logged too, before it threw)
  try { return await mounted.actions.crud[name](exec, form) } finally { if ((exec.entries?.length ?? 0) > before) logged.add(name) }
}
// a request's URI as the mrepo holds it for one from outside: the prefix
// main, then what was written
const at = u => ['main', u]

test('loaded as a runtime loads it: one protocol, crud, its config and its actions', (t) => {
  t.alike(Object.keys(mounted.protocols), ['crud'], 'the package provides the crud protocol, and no other')
  t.alike(Object.keys(mounted.actions), ['crud'])
  t.alike(Object.keys(mounted.actions.crud).sort(), Object.keys(mounted.protocols.crud.actions).sort(), 'a function for every action configured, and no other')
})

test('its config, value by value', (t) => {
  const cfg = mounted.protocols.crud
  t.is(cfg.package, 'haiccing/base-package-crud', 'the package that brings it')
  t.ok(cfg.description, 'its description')
  t.alike(Object.keys(cfg).sort(), ['actions', 'description', 'package'], 'nothing else: no default action, not behind a state')
  t.alike(Object.keys(cfg.actions).sort(), ['create', 'delete', 'read'], 'create, read and delete; no update')
  for (const [name, a] of Object.entries(cfg.actions)) {
    t.alike(a.uris, ['**'], `${name}: anywhere in main`)
    t.ok(a.description, `${name}: its description`)
    t.absent('states' in a, `${name}: no states: open whenever the protocol is active`)
  }
  t.alike([cfg.actions.create.target, cfg.actions.create.args], [true, ['value?']], 'create: a target needed, its value optional')
  t.alike([cfg.actions.delete.target, cfg.actions.delete.args], [true, ['recurse?']], 'delete: a target needed, recurse optional')
  t.alike(Object.keys(cfg.actions.read).sort(), ['description', 'uris'], 'read: nothing else: the root too')
})

test('create, read, delete: a node made with its path, read, removed; each idempotent', async (t) => {
  const { exec, writes, files } = execution({ '/main/.layer.json': B({}) })
  const made = await act('create', exec, { uri: at('swarms/swarm-1'), args: ['{"size":3}'] })
  t.alike(made.map(n => [n.uri, n.value, n.outcome]), [[['main', 'swarms'], {}, 'created'], [['main', 'swarms/swarm-1'], { size: 3 }, 'created']], 'create: the whole path, each node answered: its URI as held inside, its document, what happened')
  t.alike(writes, [['put', '/main/swarms/.node.json', {}], ['put', '/main/swarms/swarm-1/.node.json', { size: 3 }]], 'what it writes: a document a node, in the node\'s folder, hidden')
  t.alike((await act('create', exec, { uri: at('swarms/swarm-1'), args: ['{"size":9}'] })).map(n => [n.outcome, n.value]), [['there', {}], ['there', { size: 3 }]], 'again: there, left as it is')
  t.is(writes.length, 2, 'nothing written the second time')
  t.alike(await act('read', exec, { uri: at('swarms') }), [{ uri: ['main', 'swarms'], value: {}, children: ['swarm-1'] }], 'read: an array of the nodes selected, the children by name')
  t.alike((await act('read', exec, { uri: at('swarms/*') })).map(n => n.uri), [['main', 'swarms/swarm-1']], 'read with *: the children')
  t.alike(await act('read', exec, { uri: at('nothing') }), [], 'read what is not there: empty, no error')
  t.alike((await act('read', exec, { uri: at('swarms/*[size>2]') })).map(n => n.uri), [['main', 'swarms/swarm-1']], 'read with a filter: the nodes whose document it holds for')
  t.alike(await act('read', exec, { uri: at("swarms/*[size='none']") }), [], 'none: empty')
  t.alike(await act('read', exec, { uri: at('swarms/swarm-1/size') }), [{ uri: ['main', 'swarms/swarm-1/size'], value: 3 }], 'read inside a document: the value there')
  await t.exception(act('delete', exec, { uri: at('swarms') }), /swarms has children: not deleted \(crud\/delete swarms recurse\)/, 'delete a node with children: refused without recurse')
  t.alike((await act('delete', exec, { uri: at('swarms'), args: ['recurse'] })).map(n => [n.uri, n.outcome]), [[['main', 'swarms'], 'deleted']], 'with recurse: deleted')
  t.alike(Object.keys(files), ['/main/.layer.json'], 'the node and what was below it gone')
  t.alike(await act('delete', exec, { uri: at('swarms') }), [], 'again: nothing selected, the request succeeds')
})

test('what each refuses, writing nothing', async (t) => {
  const { exec, writes } = execution({ '/main/.layer.json': B({}), '/main/host/.node.json': B({}), '/main/host/.shortcuts.json': B([{ mrepo: 'local/host' }]) })
  await t.exception(act('create', exec, { uri: at('.') }), /missing argument: target/)
  await t.exception(act('create', exec, { uri: at('a/b.json') }), /not a name for a node: b\.json/, 'a name with an extension')
  await t.exception(act('create', exec, { uri: at('a'), args: ['nonsense'] }), /not a document: nonsense \(JSON\)/)
  await t.exception(act('create', exec, { uri: at('host/x') }), /host is a shortcut: a URI does not run through it/, 'below a shortcut')
  await t.exception(act('read', exec, { uri: at('host/x') }), /host is a shortcut/)
  await t.exception(act('read', exec, { uri: at('*[size>2]') }), /host is a shortcut: a URI does not run through it \(haicc host haicc \[size>2\] \.\.\.\)/, 'a filter on a shortcut: its document is elsewhere')
  await t.exception(act('read', exec, { uri: at('*[count(*)>1]') }), /not a function of this phase: count/, 'what the query does not read yet')
  await t.exception(act('read', exec, { uri: at("*[Size>2]") }), /bad filter/, 'a name in a filter that is no URI\'s')
  await t.exception(act('create', exec, { uri: at('a[size>2]') }), /one node, not a selection/)
  await t.exception(act('delete', exec, { uri: at('host/x') }), /host is a shortcut/)
  await t.exception(act('delete', exec, { uri: at('.') }), /missing argument: target/)
  await t.exception(act('delete', exec, { uri: at('host'), args: ['everything'] }), /not an argument: everything \(recurse\)/)
  t.alike((await act('read', exec, { uri: at('host') }))[0].shortcuts, [{ mrepo: 'local/host' }], 'a shortcut read: a node, with where its data comes from')
  t.alike(writes, [], 'nothing written by any of it')
})

test('every action the config names was run here', (t) => {
  t.alike([...ran].sort(), Object.keys(mounted.protocols.crud.actions).sort(), 'create, delete and read')
  t.alike([...logged].sort(), Object.keys(mounted.protocols.crud.actions).sort(), 'and each wrote into the request\'s log as it ran: an action that logs nothing fails this')
})
