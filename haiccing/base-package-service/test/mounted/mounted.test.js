// The package's protocol as it is mounted: its protocol.js, what a runtime
// loads, its config value by value and in effect (the request check, on
// each state), what its structure brings (the state it starts in, its list
// of packages, its hooks, file by file), and each action run on a minimal
// execution, in memory, over the package's own state file and hooks. No
// mrepo is built. Every action the config names must be run here, and
// every hook file the package brings must be named here: the last tests
// fail when one was left out.
import test from '../../modules/node_modules/brittle/index.js'
import { readFileSync, readdirSync, existsSync } from '../../modules/node_modules/bare-fs/index.js'
import { join, dirname } from '../../modules/node_modules/bare-path/index.js'
import { fileURLToPath } from '../../modules/node_modules/bare-url/index.js'
import { check } from '../../modules/pear-full-square/mrepo-base-request/index.js'
import * as mounted from '../../protocol.js'

const pkg = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const json = (...p) => JSON.parse(readFileSync(join(pkg, ...p), 'utf8'))
const ran = new Set()
// an action that wrote into the execution's log as it ran: every one must
const logged = new Set()
const act = async (name, exec) => {
  ran.add(name)
  const before = exec.entries?.length ?? 0
  // (one refused has logged too, before it threw)
  try { return await mounted.actions.service[name](exec, { uri: ['.'] }) } finally { if ((exec.entries?.length ?? 0) > before) logged.add(name) }
}

// The hooks the package brings, as they are in its structure: by
// <transition>/<name>, each its command.
const hooksDir = join(pkg, 'mrepo', 'runtime', 'hooks')
const brought = {}
for (const f of existsSync(hooksDir) ? readdirSync(hooksDir).sort() : []) readFileSync(join(hooksDir, f), 'utf8').split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('#')).forEach((l, i) => { brought[`${f.replace(/\.haicc$/, '')}/${i + 1}`] = l.split(/\s+/) })

// An execution as an action sees it: the runtime layer's files by URI (the
// state, the hooks), the commands it is asked to run kept in order.
function execution (state, hooks = brought) {
  const files = { '/runtime/service.json': Buffer.from(JSON.stringify({ state })) }
  { const texts = {}; for (const [name, command] of Object.entries(hooks)) { const tr = name.split('/')[0]; texts[tr] = (texts[tr] ?? '') + command.join(' ') + '\n' } for (const [tr, text] of Object.entries(texts)) files[`/runtime/hooks/${tr}.haicc`] = Buffer.from(text) }
  const waited = []
  const writes = []
  const exec = {
    read: async uri => { if (!(uri in files)) throw new Error(`nothing at ${uri}`); return files[uri] },
    // the rest of an execution context, standing in: a file that may not
    // be there, the log (kept: entries), a step run as it is
    find: async function (p) { try { return await this.read(p) } catch { return null } },
    log: function (level, event, data = {}) { (this.entries ??= []).push({ level, event, ...data }) },
    step: async function (event, data, fn, level = 'verbose') { const r = await fn(); (this.entries ??= []).push({ level, event, ...(typeof data === 'function' ? data(r) : data) }); return r },
    select: async pattern => Object.keys(files).filter(p => p.startsWith(pattern.slice(0, -1))).map(p => [p, {}]),
    put: (uri, bytes) => { writes.push(uri); files[uri] = Buffer.from(bytes) },
    runtime: { dir: '/x', uri: 'local/x' },
    resumed: null,
    // a job waited for: kept, its lines the runtime's to run; none here
    wait: job => { waited.push(job); return null },
  }
  const now = () => JSON.parse(files['/runtime/service.json'].toString()).state
  return { exec, waited, writes, now }
}

test('what it provides: one protocol, service, its config and its actions', (t) => {
  t.alike(Object.keys(mounted.protocols), ['service'], 'the package provides the service protocol, and no other')
  t.alike(Object.keys(mounted.actions), ['service'])
  t.alike(Object.keys(mounted.actions.service).sort(), Object.keys(mounted.protocols.service.actions).sort(), 'a function for every action configured, and no other')
})

test('its config, value by value: each action at the mrepo itself, in the states that allow it', (t) => {
  const cfg = mounted.protocols.service
  t.is(cfg.package, 'haiccing/base-package-service', 'the package that brings it')
  t.ok(cfg.description, 'its description')
  t.alike(Object.keys(cfg).sort(), ['actions', 'description', 'package'], 'nothing else: no default action')
  t.alike(Object.fromEntries(Object.entries(cfg.actions).map(([n, a]) => [n, a.states])), { initialise: ['booted'], start: ['initialised'], stop: ['started'], shutdown: ['initialised'] }, 'the state machine: booted, initialised, started, and back')
  for (const [name, a] of Object.entries(cfg.actions)) {
    t.alike(a.uris, ['.'], `${name}: at the mrepo itself, nowhere else`)
    t.ok(a.description, `${name}: its description`)
    t.alike(Object.keys(a).sort(), ['description', 'states', 'uris'], `${name}: nothing else: no argument, no target`)
  }
})

test('its config in effect: a request checked on each state, allowed only where the action names it', (t) => {
  const protocols = mounted.protocols
  const active = { service: protocols.service }
  const allowed = { booted: ['initialise'], initialised: ['shutdown', 'start'], started: ['stop'] }
  for (const [state, can] of Object.entries(allowed)) {
    const now = Object.keys(protocols.service.actions).filter(action => check({ protocol: 'service', action, uri: ['main', '.'] }, { service: { state }, protocols, active }) === null).sort()
    t.alike(now, can, `${state}: ${can.join(', ')} allowed, the others refused`)
  }
  t.is(check({ protocol: 'service', action: 'start', uri: ['main', '.'] }, { service: { state: 'booted' }, protocols, active }), 'not now: service start (the service is booted)', 'a refusal says the state the service is in')
  t.is(check({ protocol: 'service', action: 'start', uri: ['main', 'host'] }, { service: { state: 'initialised' }, protocols, active }), 'not offered: service start at host', 'anywhere but the mrepo itself: not offered')
  t.is(check({ protocol: 'service', action: 'start', uri: ['main', '.'] }, { service: { state: 'initialised' }, protocols, active: {} }), 'not now: service start (service is not active; the service is initialised)', 'not activated: refused whatever the state')
})

test('its structure: the state it starts in, and its list of packages', (t) => {
  t.alike(json('mrepo', 'runtime', 'service.json'), { state: 'booted' }, 'an mrepo that links it starts booted')
  const list = json('mrepo', 'packages', 'layer.json').packages
  t.alike(list, ['haiccing/base-package-runtime', 'haiccing/base-package-info', 'haiccing/base-package-help', 'haiccing/base-package-protocol', 'haiccing/base-package-service'], 'deployed alone: the runtime, info, help, the protocol protocol, itself last')
})

// The hooks it brings, each named here with its command: deployed alone,
// what the mrepo offers from its boot, and what its initialise does.
const HOOKS = {
  'boot/1': ['protocol/activate', '.', 'help'],
  'boot/2': ['protocol/activate', '.', 'info'],
  'boot/3': ['protocol/activate', '.', 'runtime'],
  'boot/4': ['protocol/activate', '.', 'service'],
  'initialise/1': ['info/extract']
}

test('its hooks, file by file: at boot help, info, runtime and service activated; on initialise the info extracted', (t) => {
  t.alike(brought, HOOKS, 'each hook file, its transition, each line its command; none that is not named here')
  t.absent(Object.keys(brought).some(n => /^(start|stop|shutdown)\//.test(n)), 'none on start, stop or shutdown: deployed alone it has no door to open')
})

test('initialise: its hook file there, the request waits for its lines; resumed, the state moved', async (t) => {
  const { exec, waited, writes, now } = execution('booted')
  t.is(await act('initialise', exec), null, 'it waits: its lines run by the runtime, through the mrepo\'s own inbox')
  t.alike([waited.length, now(), writes], [1, 'booted', []], 'one job; the state not moved yet, nothing written')
  t.alike(await act('initialise', { ...exec, resumed: { output: [{ line: 'info/extract', output: {} }] } }), { service: 'initialised', state: 'initialised' }, 'resumed: what was done, the state now')
  t.alike([now(), writes], ['initialised', ['/runtime/service.json']], 'one write: the state')
})

test('start, stop, shutdown: no hook file of its own, the state moved at once', async (t) => {
  const { exec, waited, now } = execution('initialised')
  t.alike(await act('start', exec), { service: 'started', state: 'started' })
  t.alike(await act('stop', exec), { service: 'stopped', state: 'initialised' }, 'stopped: back to initialised')
  t.alike(await act('shutdown', exec), { service: 'shut down', state: 'booted' }, 'shut down: back to booted')
  t.alike([now(), waited.length], ['booted', 0])
})

test('a hook file dropped in by a package that defines the mrepo: each transition its own; a line failed, the state not moved', async (t) => {
  const dropped = { 'start/1': ['x/first'], 'start/2': ['protocol/activate', '.', 'boot'], 'shutdown/1': ['x/last'] }
  const { exec, waited, now, writes } = execution('initialised', dropped)
  t.is(await act('start', exec), null, 'start: waits for its own lines')
  t.alike(await act('stop', { ...exec }), { service: 'stopped', state: 'initialised' }, 'stop: no file of its own, at once')
  await t.exception(act('shutdown', { ...exec, resumed: { error: 'line 1: x/last: refused' } }), /hook shutdown: line 1: x\/last: refused/, 'a line that failed: the transition fails, saying which')
  t.alike([now(), waited.length], ['initialised', 1], 'the state not moved by the failure')
  t.ok(writes.every(w => w === '/runtime/service.json'))
})

test('every action the config names was run here', (t) => {
  t.alike([...ran].sort(), Object.keys(mounted.protocols.service.actions).sort(), 'none left out: an action added without its test fails this')
  t.alike([...logged].sort(), Object.keys(mounted.protocols.service.actions).sort(), 'and each wrote into the request\'s log as it ran: an action that logs nothing fails this')
})
