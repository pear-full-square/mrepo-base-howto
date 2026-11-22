// The package's protocol as it is mounted: its protocol.js, what a runtime
// loads, its config value by value and in effect (the request check), and
// each action run on a minimal execution: its files by URI in memory, a
// temporary folder as the parent's. What can be run without building a
// child: every refusal of deploy, and a child without a runtime torn down.
// No mrepo is built, no runtime started. Every action the config names
// must be run here: the last test fails when one was left out.
import test from '../../modules/node_modules/brittle/index.js'
import { mkdtempSync, mkdirSync, writeFileSync, existsSync, rmSync } from '../../modules/node_modules/bare-fs/index.js'
import { join } from '../../modules/node_modules/bare-path/index.js'
import { tmpdir } from '../../modules/node_modules/bare-os/index.js'
import { check } from '../../modules/pear-full-square/mrepo-base-request/index.js'
import * as mounted from '../../protocol.js'

// (a form as the mrepo holds it: its URI, given here from the root as one
// string, made its segments: the prefix main, then the rest)
const seg = u => (Array.isArray(u) ? u : u === 'main' ? ['main', '.'] : u.startsWith('main/') ? ['main', u.slice(5)] : [u])
const ran = new Set()
// an action that wrote into the execution's log as it ran: every one must
const logged = new Set()
const act = async (name, exec, form) => {
  ran.add(name)
  const before = exec.entries?.length ?? 0
  // (one refused has logged too, before it threw)
  try { return await mounted.actions.boot[name](exec, form) } finally { if ((exec.entries?.length ?? 0) > before) logged.add(name) }
}
// Where a child at host is recorded: its node and its shortcut in main
// (which mrepo, the link's key), what is local to this machine about it
// in the links layer, by that key.
// Where it is placed: by its unique URI, under the work folder's mrepos/.
const NODE = '/main/host/.node.json'
const SHORTCUT = '/main/host/.shortcuts.json'
const LOCAL = '/links/k-host.json'
const LINKED = { [NODE]: Buffer.from('{}'), [SHORTCUT]: Buffer.from(JSON.stringify([{ mrepo: 'local/host', link: 'k-host' }])) }
const abs = p => (p.startsWith('/') ? p : `/${p}`)

// An execution as an action sees it: the parent's folder and unique URI,
// its files by path (given relative or slash-led), its writes kept in order.
function execution (dir, files = {}) {
  const writes = []
  const exec = {
    runtime: { dir: join(dir, 'mrepos', 'boot'), uri: 'local/boot', work: dir },
    read: async uri => { if (!(abs(uri) in files)) throw new Error(`nothing at ${uri}`); return files[abs(uri)] },
    // the rest of an execution context, standing in: a file that may not
    // be there, the log (kept: entries), a step run as it is
    find: async function (p) { try { return await this.read(p) } catch { return null } },
    log: function (level, event, data = {}) { (this.entries ??= []).push({ level, event, ...data }) },
    step: async function (event, data, fn, level = 'verbose') { const r = await fn(); (this.entries ??= []).push({ level, event, ...(typeof data === 'function' ? data(r) : data) }); return r },
    select: async uri => Object.keys(files).filter(p => p === abs(uri) || p.startsWith(abs(uri) + '/')).map(p => [p, {}]),
    put: (uri, bytes) => { writes.push(['put', abs(uri)]); files[abs(uri)] = Buffer.from(bytes) },
    remove: uri => { writes.push(['remove', abs(uri)]); delete files[abs(uri)] },
    commit: async () => { writes.push(['commit']) },
  }
  return { exec, writes, files }
}
const within = async fn => { const dir = mkdtempSync(join(tmpdir(), 'boot-mounted-')); try { return await fn(dir) } finally { rmSync(dir, { recursive: true, force: true }) } }
const B = v => Buffer.from(JSON.stringify(v))

test('what it provides: one protocol, boot, its config and its actions', (t) => {
  t.alike(Object.keys(mounted.protocols), ['boot'], 'the package provides the boot protocol, and no other')
  t.alike(Object.keys(mounted.actions), ['boot'])
  t.alike(Object.keys(mounted.actions.boot).sort(), Object.keys(mounted.protocols.boot.actions).sort(), 'a function for every action configured, and no other')
})

test('its config, value by value: each action at any position below main, a target needed', (t) => {
  const cfg = mounted.protocols.boot
  t.is(cfg.package, 'haiccing/base-package-boot', 'the package that brings it')
  t.ok(cfg.description, 'its description')
  t.alike(Object.keys(cfg).sort(), ['actions', 'description', 'package'], 'nothing else: no default action')
  t.alike(Object.keys(cfg.actions).sort(), ['deploy', 'redeploy', 'teardown'])
  for (const [name, a] of Object.entries(cfg.actions)) {
    t.alike(a.uris, ['**'], `${name}: at any position below main: what a position means, its documents say`)
    t.is(a.target, true, `${name}: a target is needed, the mrepo itself is none`)
    t.ok(a.description, `${name}: its description`)
    t.absent(a.states, `${name}: no state of its own: behind a door only where a hook puts it there`)
  }
  t.alike(cfg.actions.deploy.args, ['package'], 'deploy: one argument, required, the package')
  t.alike(cfg.actions.redeploy.args, ['package?'], 'redeploy: the package optional, the one it was deployed from else')
  t.absent(cfg.actions.teardown.args, 'teardown: no argument')
})

test('its config in effect: a request checked: the target, the argument, the URI', (t) => {
  const protocols = mounted.protocols
  const data = { service: null, protocols, active: { boot: protocols.boot } }
  const ask = (action, uri, args) => check({ protocol: 'boot', action, uri: seg(uri), args }, data)
  t.is(ask('deploy', 'main/host', ['base-component-haicc']), null, 'deploy a child from a package: allowed')
  t.is(ask('deploy', 'main', ['base-component-haicc']), 'missing argument: target', 'no target: the mrepo itself is not deployed')
  t.is(ask('deploy', 'main/host', []), 'missing argument: package', 'deploy without its package: said')
  t.is(ask('redeploy', 'main/host', []), null, 'redeploy without a package: allowed')
  t.is(ask('teardown', 'main/host'), null, 'teardown: allowed')
  t.is(ask('teardown', 'main'), 'missing argument: target', 'teardown of the mrepo itself: no')
  t.is(ask('deploy', 'main/swarms/swarm-1/node-1', ['p']), null, 'deeper below main: offered')
  t.is(ask('teardown', 'main/swarms/swarm-1/node-1'), null, 'and torn down there')
  t.is(check({ protocol: 'boot', action: 'deploy', uri: ['main', 'host'], args: ['p'] }, { ...data, active: {} }), 'not now: boot deploy (boot is not active)', 'not activated: refused')
})

test('deploy: each refusal, before anything is built', async (t) => {
  await within(async dir => {
    const store = { '/packages/manifest.json': B({ store: join(dir, 'store'), sources: [] }) }
    const form = (uri, ...args) => ({ uri: seg(uri), args })
    await t.exception(act('deploy', execution(dir, store).exec, form('main', 'haiccing/p')), /missing argument: target/, 'the mrepo itself')
    await t.exception(act('deploy', execution(dir, store).exec, form('.', 'haiccing/p')), /missing argument: target/, 'nor its root')
    await t.exception(act('deploy', execution(dir, store).exec, form('main/Host', 'haiccing/p')), /not canonical: Host \(host\)/, 'a URI that is not canonical')
    await t.exception(act('deploy', execution(dir, store).exec, form('main/1host', 'haiccing/p')), /not a position for an mrepo: 1host \(names of lowercase letters, digits, hyphens\)/, 'not a name: lowercase letters, digits, hyphens, a letter first')
    await t.exception(act('deploy', execution(dir, store).exec, form('main/swarms/swarm-1/node-1', 'haiccing/p')), /no node there: swarms\/swarm-1 \(crud\/create swarms\/swarm-1\)/, 'deeper: the node above it is there first')
    const swarm = { '/main/swarms/.node.json': B({}), '/main/swarms/local/.node.json': B({ kind: 'swarm' }) }
    await t.exception(act('deploy', execution(dir, { ...store, ...swarm }).exec, form('main/swarms/local/node-1', 'haiccing/p')), /not a swarm: local/, 'local: the swarm of what is in none, no swarm\'s name')
    await t.exception(act('deploy', execution(dir, { ...store, ...LINKED }).exec, form('main/host/node-1', 'haiccing/p')), /host is a shortcut: a URI does not run through it/, 'below a shortcut: another mrepo\'s position')
    await t.exception(act('deploy', execution(dir, store).exec, form('host', 'haiccing/p')), /not a position in main: host \(main\/<name>\)/, 'not in main: from the root the layer comes first')
    await t.exception(act('deploy', execution(dir, { ...store, ...LINKED }).exec, form('main/host', 'haiccing/p')), /deployed already: host/, 'a child linked there already, from another package (here none recorded): refused')
    const again = execution(dir, { ...store, ...LINKED, [LOCAL]: B({ package: 'haiccing/p' }) })
    t.is((await act('deploy', again.exec, form('main/host', 'haiccing/p'))).again, true, 'from the same package: a repeat, allowed, nothing done')
    t.alike(again.writes, [], 'nothing written')
    await t.exception(act('deploy', execution(dir, { ...store, '/main/host/data.json': B({}) }).exec, form('main/host', 'haiccing/p')), /host exists locally: the boot protocol cannot target it/, 'data in main at that position: not a target')
    mkdirSync(join(dir, 'mrepos', 'local', 'busy'), { recursive: true })
    await t.exception(act('deploy', execution(dir, store).exec, form('main/busy', 'haiccing/p')), /in the way: .*mrepos\/local\/busy/, 'a folder in its place: where it would be put, by its unique URI')
    await t.exception(act('deploy', execution(dir, store).exec, form('main/host')), /missing argument: package/, 'no package')
    await t.exception(act('deploy', execution(dir, store).exec, form('main/host', 'p')), /not fully qualified: p \(<org>\/<package>\)/, 'a package without its organisation: none assumed')
    await t.exception(act('deploy', execution(dir, {}).exec, form('main/host', 'haiccing/p')), /no store: the mrepo's packages manifest names none/, 'a parent that names no store')
    const last = execution(dir, { '/packages/manifest.json': B({ store: join(dir, 'store'), sources: [] }) })
    await t.exception(act('deploy', last.exec, form('main/host', 'haiccing/no-such-package')), 'a package that is in no source: refused')
    const paths = op => [...new Set(last.writes.filter(w => w[0] === op).map(w => w[1]))].sort()
    t.alike([paths('put').length, paths('remove')], [3, paths('put')], 'linked first (its node, its shortcut, its link\'s record), then undone: each removed again')
    t.alike([Object.keys(last.files).filter(p => p.startsWith('/main/') || p.startsWith('/links/')), existsSync(join(dir, 'mrepos', 'local', 'host'))], [[], false], 'a refusal leaves nothing: no link, no folder')
  })
})

test('teardown: a child without a runtime, its folder and its shortcut removed; what is not deployed, a repeat', async (t) => {
  await within(async dir => {
    const folder = join(dir, 'mrepos', 'local', 'host')
    mkdirSync(folder, { recursive: true })
    writeFileSync(join(folder, 'kept.txt'), 'x')
    const { exec, writes, files } = execution(dir, { ...LINKED, [LOCAL]: B({ package: 'haiccing/p' }) })
    t.alike(await act('teardown', exec, { uri: ['main', 'host'] }), { tornDown: 'host' }, 'what it returns')
    t.absent(existsSync(folder), 'its folder, where it was placed by its unique URI: removed')
    t.alike([writes, Object.keys(files)], [[['remove', SHORTCUT], ['remove', NODE], ['remove', LOCAL]], []], 'its shortcut and its node out of main, its link\'s record out of the links layer')
    t.alike(await act('teardown', exec, { uri: ['main', 'host'] }), { tornDown: 'host', again: true }, 'torn down already: a repeat, allowed, nothing done')
    t.ok(exec.entries.some(e => e.level === 'warn' && e.event === 'not deployed'), 'a warning: not deployed')
    await t.exception(act('teardown', execution(dir, { '/main/data/x.json': B({}) }).exec, { uri: ['main', 'data'] }), /data exists locally: the boot protocol cannot target it/, 'data in main there: not a child')
    await t.exception(act('teardown', exec, { uri: ['main', '.'] }), /missing argument: target/, 'the mrepo itself')
  })
})

test('redeploy: teardown first; what is not deployed and no package: refused; the package it was deployed from, by default', async (t) => {
  await within(async dir => {
    await t.exception(act('redeploy', execution(dir).exec, { uri: ['main', 'host'] }), /missing argument: package/, 'nothing deployed and no package given: nothing to deploy from')
    const { exec, writes } = execution(dir, { ...LINKED, [LOCAL]: B({ package: 'haiccing/gone-package' }), '/packages/manifest.json': B({ store: join(dir, 'store'), sources: [] }) })
    await t.exception(act('redeploy', exec, { uri: ['main', 'host'], args: [] }), 'no package given: the one it was deployed from, here in no source: the deploy refused')
    t.alike(writes.slice(0, 4), [['remove', SHORTCUT], ['remove', NODE], ['remove', LOCAL], ['commit']], 'torn down first, and that committed in the execution, before the deploy is tried')
  })
})

test('every action the config names was run here', (t) => {
  t.alike([...ran].sort(), Object.keys(mounted.protocols.boot.actions).sort(), 'none left out: an action added without its test fails this')
  t.alike([...logged].sort(), Object.keys(mounted.protocols.boot.actions).sort(), 'and each wrote into the request\'s log as it ran: an action that logs nothing fails this')
})
