// The component as it is configured: what defines the haicc mrepo. Its
// list of packages and its hooks, value by value; then against the
// packages it lists, their bundles read from the sources (SOURCES): every
// hook names a protocol and an action one of them provides; and what the
// hooks do, run with those packages' own actions on a minimal execution,
// in memory: which protocols are open after the boot, and through the
// service's transitions. No mrepo is built. Every hook file the component
// brings must be named here and run here: the tests fail when one was
// left out.
import test from '../../modules/node_modules/brittle/index.js'
import { readFileSync, readdirSync, existsSync } from '../../modules/node_modules/bare-fs/index.js'
import { join, dirname } from '../../modules/node_modules/bare-path/index.js'
import { fileURLToPath, pathToFileURL } from '../../modules/node_modules/bare-url/index.js'
import os from '../../modules/node_modules/bare-os/index.js'

const pkg = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const json = (...p) => JSON.parse(readFileSync(join(pkg, ...p), 'utf8'))

// The hooks the component brings, as they are in its structure: a file a
// transition, by <transition>/<line>, each line's words.
const hooksDir = join(pkg, 'mrepo', 'runtime', 'hooks')
const brought = {}
for (const f of existsSync(hooksDir) ? readdirSync(hooksDir).sort() : []) readFileSync(join(hooksDir, f), 'utf8').split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('#')).forEach((l, i) => { brought[`${f.replace(/\.haicc$/, '')}/${i + 1}`] = l.split(/\s+/) })

const LIST = [
  'haiccing/base-package-runtime',
  'haiccing/base-package-info',
  'haiccing/base-package-help',
  'haiccing/base-package-haici',
  'haiccing/base-package-protocol',
  'haiccing/base-package-boot',
  'haiccing/base-package-service',
  'haiccing/base-package-haicc',
  'haiccing/base-package-crud',
  'haiccing/base-package-container',
  'haiccing/base-package-swarm',
  'haiccing/base-component-haicc'
]
// Each hook named here with its command: what the haicc mrepo offers from
// its boot, what its initialise does, and the door its service opens and
// closes: the boot protocol, the crud protocol, the container protocol and
// the swarm protocol.
const HOOKS = {
  'boot/1': ['protocol/activate', '.', 'haicc'],
  'boot/2': ['protocol/activate', '.', 'haici'],
  'boot/3': ['protocol/activate', '.', 'help'],
  'boot/4': ['protocol/activate', '.', 'info'],
  'boot/5': ['protocol/activate', '.', 'runtime'],
  'boot/6': ['protocol/activate', '.', 'service'],
  'initialise/1': ['info/extract'],
  'start/1': ['protocol/activate', '.', 'boot'],
  'start/2': ['protocol/activate', '.', 'container'],
  'start/3': ['protocol/activate', '.', 'crud'],
  'start/4': ['protocol/activate', '.', 'swarm'],
  'stop/1': ['protocol/deactivate', '.', 'boot'],
  'stop/2': ['protocol/deactivate', '.', 'container'],
  'stop/3': ['protocol/deactivate', '.', 'crud'],
  'stop/4': ['protocol/deactivate', '.', 'swarm']
}

test('its list of packages, in deploy order, itself last', (t) => {
  t.alike(json('mrepo', 'packages', 'layer.json').packages, LIST, 'the runtime, info, help, haici, the protocol protocol, boot, service, haicc, crud, container, swarm, the component')
})

test('its hooks, file by file, line by line, and the state it starts in', (t) => {
  t.alike(brought, HOOKS, 'each hook file, its transition, each line its command; none that is not named here')
  t.alike(json('mrepo', 'runtime', 'service.json'), { state: 'booted' }, 'a haicc mrepo starts booted')
})

// The packages it lists, from the sources: each one's protocols, their
// configs and their actions, as a runtime loads them from its bundle.
const sources = os.getEnv('SOURCES')
const provided = {}
const actions = {}
const missing = []
if (sources) {
  for (const name of LIST) {
    const file = join(sources, `${name}.bundle`)
    if (!existsSync(file)) { missing.push(name); continue }
    let offered = null
    try { offered = await (await import(pathToFileURL(file).href)).run('/protocol') } catch { continue } // no protocol entry: it provides none
    for (const [p, cfg] of Object.entries(offered.protocols ?? {})) { provided[p] = { ...cfg, from: name }; actions[p] = offered.actions[p] }
  }
}

test('the packages it lists: each in the sources, the protocols they provide', (t) => {
  t.ok(sources, 'SOURCES: the sources folder, the listed packages\' bundles in it')
  t.alike(missing, [], 'every package of the list has its bundle there')
  t.alike(Object.fromEntries(Object.entries(provided).map(([p, c]) => [p, c.from]).sort()), {
    boot: 'haiccing/base-package-boot',
    container: 'haiccing/base-package-container',
    crud: 'haiccing/base-package-crud',
    haicc: 'haiccing/base-package-haicc',
    haici: 'haiccing/base-package-haici',
    help: 'haiccing/base-package-help',
    info: 'haiccing/base-package-info',
    protocol: 'haiccing/base-package-protocol',
    runtime: 'haiccing/base-package-runtime',
    service: 'haiccing/base-package-service',
    swarm: 'haiccing/base-package-swarm'
  }, 'eleven protocols, one a package; the component provides none')
})

test('every hook names a protocol and an action a listed package provides', (t) => {
  for (const [name, [first, , arg]] of Object.entries(brought)) {
    const [p, a] = first.split('/')
    t.ok(provided[p]?.actions?.[a], `${name}: ${first} is there (${provided[p]?.from})`)
    if (p === 'protocol') t.ok(provided[arg], `${name}: the protocol it opens or closes, ${arg}, is provided`)
  }
})

// A minimal execution, in memory: the runtime layer's files as the
// component lays them in, the protocols loaded; a command run with the
// listed packages' own actions.
function world () {
  const files = { '/runtime/service.json': Buffer.from(JSON.stringify(json('mrepo', 'runtime', 'service.json'))) }
  { const texts = {}; for (const [name, command] of Object.entries(brought)) { const tr = name.split('/')[0]; texts[tr] = (texts[tr] ?? '') + command.join(' ') + '\n' } for (const [tr, text] of Object.entries(texts)) files[`/runtime/hooks/${tr}.haicc`] = Buffer.from(text) }
  const commands = []
  const exec = {
    runtime: { protocols: provided, dir: pkg },
    read: async uri => { if (!(uri in files)) throw new Error(`nothing at ${uri}`); return files[uri] },
    // the rest of an execution context, standing in: a file that may not
    // be there, the log (kept: entries), a step run as it is
    find: async function (p) { try { return await this.read(p) } catch { return null } },
    log: function (level, event, data = {}) { (this.entries ??= []).push({ level, event, ...data }) },
    step: async function (event, data, fn, level = 'verbose') { const r = await fn(); (this.entries ??= []).push({ level, event, ...(typeof data === 'function' ? data(r) : data) }); return r },
    select: async pattern => Object.keys(files).filter(p => p.startsWith(pattern.slice(0, -1))).map(p => [p, {}]),
    put: (uri, bytes) => { files[uri] = Buffer.from(bytes) },
    remove: uri => { delete files[uri] },
    run: async command => {
      const [first, uri = '.', ...args] = command
      const [p, a] = first.split('/')
      commands.push(command.join(' '))
      if (!actions[p]?.[a]) throw new Error(`no action: ${first}`)
      // (a hook is the mrepo's own: its URI one segment, no prefix)
      const form = { protocol: p, action: a, uri: [uri], args }
      const r = await actions[p][a](exec, form)
      // a transition waiting for its hook file: its lines run here, as the
      // runtime runs them, then the action resumed
      if (r === null && p === 'service') { for (const name of of(a)) await exec.run(brought[name]); return actions[p][a]({ ...exec, resumed: { output: [] } }, form) }
      return r
    },
    resumed: null,
    wait: () => null,
  }
  const active = () => Object.keys(files).filter(u => u.startsWith('/protocols/')).map(u => u.slice('/protocols/'.length, -'.json'.length)).sort()
  const state = () => JSON.parse(files['/runtime/service.json'].toString()).state
  return { exec, commands, active, state }
}
const of = transition => Object.keys(brought).filter(n => n.startsWith(`${transition}/`)).sort()

test('what its hooks do: the boot opens haicc, haici, help, info, runtime and service; the service\'s start opens boot, container, crud and swarm, its stop closes them', async (t) => {
  const w = world()
  // the boot: the runtime places these as its own, in name order
  for (const name of of('boot')) await w.exec.run(brought[name])
  t.alike(w.active(), ['haicc', 'haici', 'help', 'info', 'runtime', 'service'], 'after the boot: what a haicc mrepo always offers')
  t.absent(w.active().includes('boot') || w.active().includes('crud') || w.active().includes('container') || w.active().includes('swarm'), 'the boot protocol, the crud protocol, the container protocol and the swarm protocol are behind the service\'s door')
  t.absent(w.active().includes('protocol'), 'the protocol protocol: not a hook\'s, the runtime opens it itself')
  t.alike(await w.exec.run(['service/initialise']), { service: 'initialised', state: 'initialised' })
  t.ok(w.commands.includes('info/extract'), 'initialise: the info extracted, by its hook')
  t.alike(w.active(), ['haicc', 'haici', 'help', 'info', 'runtime', 'service'], 'initialised: the same protocols open')
  t.alike(await w.exec.run(['service/start']), { service: 'started', state: 'started' })
  t.alike(w.active(), ['boot', 'container', 'crud', 'haicc', 'haici', 'help', 'info', 'runtime', 'service', 'swarm'], 'started: the door open, boot, container, crud and swarm with the others')
  t.alike(await w.exec.run(['service/stop']), { service: 'stopped', state: 'initialised' })
  t.alike(w.active(), ['haicc', 'haici', 'help', 'info', 'runtime', 'service'], 'stopped: the door closed again, exactly what start opened')
  t.alike(await w.exec.run(['service/shutdown']), { service: 'shut down', state: 'booted' })
  t.alike([w.state(), w.active()], ['booted', ['haicc', 'haici', 'help', 'info', 'runtime', 'service']], 'shut down: booted, as after the boot')
  // every hook file ran: its command among those executed
  const ran = Object.entries(brought).filter(([, c]) => w.commands.includes(c.join(' '))).map(([n]) => n).sort()
  t.alike(ran, Object.keys(brought).sort(), 'every hook the component brings was run here: one added without its place in this walk fails this')
})

test('every protocol the listed packages provide is opened by a hook, or closed on purpose', (t) => {
  const opened = Object.values(brought).filter(c => c[0] === 'protocol/activate').map(c => c[2]).sort()
  const closed = Object.values(brought).filter(c => c[0] === 'protocol/deactivate').map(c => c[2]).sort()
  t.alike(Object.keys(provided).filter(p => !opened.includes(p)).sort(), ['protocol'], 'only the protocol protocol is opened by no hook: the runtime opens it itself; a package added to the list without a hook for its protocol fails this')
  t.alike(closed, of('start').map(n => brought[n][2]).sort(), 'what start opens, stop closes: nothing left open behind a closed door')
})
