// The solution as it is configured: what defines the workbench mrepo. Its
// list of packages and its hooks, value by value; then against the
// packages it lists and those its commission deploys, their bundles read
// from the sources (SOURCES): every hook names a protocol and an action
// one of them provides; and what the hooks do, run with those packages'
// own actions on a minimal execution, in memory (the deploys and
// teardowns of its components stood in for: the workbench test deploys
// them for real): its commission, its service's transitions, its
// decommission. No mrepo is built. Every hook file the solution brings
// must be named here and run here: the tests fail when one was left out.
import test from '../../modules/node_modules/brittle/index.js'
import { readFileSync, readdirSync, existsSync } from '../../modules/node_modules/bare-fs/index.js'
import { join, dirname } from '../../modules/node_modules/bare-path/index.js'
import { fileURLToPath, pathToFileURL } from '../../modules/node_modules/bare-url/index.js'
import os from '../../modules/node_modules/bare-os/index.js'

const pkg = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const json = (...p) => JSON.parse(readFileSync(join(pkg, ...p), 'utf8'))

// The hooks the solution brings, as they are in its structure: a file a
// transition, by <transition>/<line>, each line's words (as the shell
// splits them: a quoted part one word).
const hooksDir = join(pkg, 'mrepo', 'runtime', 'hooks')
const words = l => [...l.matchAll(/'([^']*)'|(\S+)/g)].map(m => m[1] ?? m[2])
const brought = {}
for (const f of existsSync(hooksDir) ? readdirSync(hooksDir).sort() : []) readFileSync(join(hooksDir, f), 'utf8').split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('#')).forEach((l, i) => { brought[`${f.replace(/\.haicc$/, '')}/${i + 1}`] = words(l) })

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
  'haiccing/base-solution-workbench'
]
// What its commission deploys: its components, below it.
const COMPONENTS = { docs: 'haiccing/base-component-docs', splectral: 'haiccing/base-package-splectral' }
// The help viewer its commission installs in its Splectral: the mrepo under it, the component.
const VIEWER = ['haiccing/base-package-service', 'splectral/base-component-help-viewer']
// Each hook named here with its command: its commission (its
// components deployed below it, then its own service initialised and
// started), its decommission (its components torn down), what it offers
// from its boot (the haicc mrepo's: it fulfils the host's role), what its
// initialise sets up (its info, its howtos namespace), and the door its
// service opens and closes.
const HOOKS = {
  'commission/1': ['boot/deploy', 'docs', COMPONENTS.docs],
  'commission/2': ['boot/deploy', 'splectral', COMPONENTS.splectral],
  'commission/3': ['haicc', 'splectral', 'boot/deploy', 'help', 'haiccing/base-package-service'],
  'commission/4': ['haicc', 'splectral', 'splectral/install', 'help', 'splectral/base-component-help-viewer'],
  'commission/5': ['haicc', 'splectral/help', 'service/initialise'],
  'commission/6': ['haicc', 'splectral/help', 'service/start'],
  'commission/7': ['service/initialise'],
  'commission/8': ['service/start'],
  'decommission/1': ['haicc', 'splectral', 'boot/teardown', 'help'],
  'decommission/2': ['boot/teardown', 'splectral'],
  'decommission/3': ['boot/teardown', 'docs'],
  'boot/1': ['protocol/activate', '.', 'haicc'],
  'boot/2': ['protocol/activate', '.', 'haici'],
  'boot/3': ['protocol/activate', '.', 'help'],
  'boot/4': ['protocol/activate', '.', 'info'],
  'boot/5': ['protocol/activate', '.', 'runtime'],
  'boot/6': ['protocol/activate', '.', 'service'],
  'initialise/1': ['info/extract'],
  'initialise/2': ['crud/create', 'howtos', '{"kind":"howtos"}'],
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
  t.alike(json('mrepo', 'packages', '.layer.json').packages, LIST, 'the haicc component\'s packages (the host\'s role), the solution last')
})

test('its hooks, file by file, line by line, and the state it starts in', (t) => {
  t.alike(brought, HOOKS, 'each hook file, its transition, each line its command; none that is not named here')
  t.alike(json('mrepo', 'runtime', 'service.json'), { state: 'booted' }, 'the workbench starts booted: a service like every mrepo')
  t.absent(existsSync(join(pkg, 'scripts')), 'no script: what it does once deployed is its commission')
})

// The packages it lists, from the sources: each one's protocols, their
// configs and their actions, as a runtime loads them from its bundle.
const sources = os.getEnv('SOURCES')
const provided = {}
const actions = {}
const missing = []
if (sources) {
  for (const name of [...Object.values(COMPONENTS), ...VIEWER]) if (!existsSync(join(sources, `${name}.bundle`))) missing.push(name)
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
  t.alike(missing, [], 'every package of the list, and every component its commission deploys, has its bundle there')
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
  }, 'eleven protocols, one a package; the solution provides none')
})

test('every hook names a protocol and an action a listed package provides', (t) => {
  for (const [name, [first, , arg]] of Object.entries(brought)) {
    // haicc <position> <command>: goto, the haicc protocol's default; the
    // command sent on is the component's to offer (the workbench test runs it)
    const [p, a] = first === 'haicc' ? ['haicc', provided.haicc?.default] : first.split('/')
    t.ok(provided[p]?.actions?.[a], `${name}: ${first} is there (${provided[p]?.from})`)
    if (p === 'protocol') t.ok(provided[arg], `${name}: the protocol it opens or closes, ${arg}, is provided`)
  }
})

// A minimal execution, in memory: the runtime layer's files as the
// component lays them in, the protocols loaded; a command run with the
// listed packages' own actions.
// (paths given relative from the root or slash-led, the same)
const abs = p => (p.startsWith('/') ? p : `/${p}`)
function world () {
  const files = { '/runtime/service.json': Buffer.from(JSON.stringify(json('mrepo', 'runtime', 'service.json'))) }
  { const texts = {}; for (const [name, command] of Object.entries(brought)) { const tr = name.split('/')[0]; texts[tr] = (texts[tr] ?? '') + command.join(' ') + '\n' } for (const [tr, text] of Object.entries(texts)) files[`/runtime/hooks/${tr}.haicc`] = Buffer.from(text) }
  const commands = []
  const exec = {
    runtime: { protocols: provided, dir: pkg },
    read: async uri => { if (!(abs(uri) in files)) throw new Error(`nothing at ${uri}`); return files[abs(uri)] },
    // the rest of an execution context, standing in: a file that may not
    // be there, the log (kept: entries), a step run as it is
    find: async function (p) { try { return await this.read(p) } catch { return null } },
    log: function (level, event, data = {}) { (this.entries ??= []).push({ level, event, ...data }) },
    step: async function (event, data, fn, level = 'verbose') { const r = await fn(); (this.entries ??= []).push({ level, event, ...(typeof data === 'function' ? data(r) : data) }); return r },
    select: async pattern => Object.keys(files).filter(p => p.startsWith(abs(pattern).slice(0, -1))).map(p => [p, {}]),
    put: (uri, bytes) => { files[abs(uri)] = Buffer.from(bytes) },
    remove: uri => { delete files[abs(uri)] },
    run: async command => {
      const [first, uri = '.', ...args] = command
      const [p, a] = first.split('/')
      commands.push(command.join(' '))
      // a command sent on to a component (haicc <position> ...): stood in
      // for, as the component answers it (the workbench test runs it)
      if (first === 'haicc') return { sent: command.slice(1) }
      if (!actions[p]?.[a]) throw new Error(`no action: ${first}`)
      // a component deployed or torn down: stood in for (the workbench test does it)
      if (p === 'boot') return a === 'deploy' ? { deployed: uri, package: args[0], commission: 'done' } : { tornDown: uri }
      // (a hook is the mrepo's own, standing at main: its URI behind it)
      const form = { protocol: p, action: a, uri: ['main', uri], args }
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

test('what its hooks do: the boot opens what a haicc mrepo offers; the commission deploys its components and its help viewer, initialises it (its info, its howtos namespace) and starts it (its door open); stop, shutdown; the decommission tears its components down', async (t) => {
  const w = world()
  // the boot: the runtime places these as its own, in name order
  for (const name of of('boot')) await w.exec.run(brought[name])
  t.alike(w.active(), ['haicc', 'haici', 'help', 'info', 'runtime', 'service'], 'after the boot: what a haicc mrepo always offers')
  t.absent(w.active().includes('protocol'), 'the protocol protocol: not a hook\'s, the runtime opens it itself')
  // its commission: what the runtime runs as it starts after its deploy
  const commissioned = []
  for (const name of of('commission')) commissioned.push(await w.exec.run(brought[name]))
  t.absent(await w.exec.find('/main/registry/.node.json'), 'no registry of its own: the install\'s is mrepos/')
  t.alike(commissioned.slice(0, 2), [{ deployed: 'docs', package: COMPONENTS.docs, commission: 'done' }, { deployed: 'splectral', package: COMPONENTS.splectral, commission: 'done' }], 'its components deployed below it, before its own initialise, each commissioned by its own')
  t.alike(commissioned.slice(2, 6).map(c => c.sent), [['splectral', 'boot/deploy', 'help', 'haiccing/base-package-service'], ['splectral', 'splectral/install', 'help', 'splectral/base-component-help-viewer'], ['splectral/help', 'service/initialise'], ['splectral/help', 'service/start']], 'then the help viewer in its Splectral, its help view: deployed, installed, in service')
  t.alike(commissioned.slice(6), [{ service: 'initialised', state: 'initialised' }, { service: 'started', state: 'started' }], 'then itself: initialised, then started')
  t.ok(w.commands.includes('info/extract'), 'initialise: its info extracted, by its hook')
  t.alike(JSON.parse((await w.exec.read('/main/howtos/.node.json')).toString()), { kind: 'howtos' }, 'initialise: the node howtos, a namespace\'s root')
  t.alike(w.active(), ['boot', 'container', 'crud', 'haicc', 'haici', 'help', 'info', 'runtime', 'service', 'swarm'], 'started: the door open, boot, container, crud and swarm with the others')
  t.alike(await w.exec.run(['service/stop']), { service: 'stopped', state: 'initialised' })
  t.alike(w.active(), ['haicc', 'haici', 'help', 'info', 'runtime', 'service'], 'stopped: the door closed again, exactly what start opened')
  t.alike(await w.exec.run(['service/shutdown']), { service: 'shut down', state: 'booted' })
  // its decommission: asked by its teardown
  const decommissioned = []
  for (const name of of('decommission')) decommissioned.push(await w.exec.run(brought[name]))
  t.alike(decommissioned, [{ sent: ['splectral', 'boot/teardown', 'help'] }, { tornDown: 'splectral' }, { tornDown: 'docs' }], 'its decommission: the help viewer first, from its Splectral; then its components, the last deployed first')
  // every hook file ran: its command among those executed
  const ran = Object.entries(brought).filter(([, c]) => w.commands.includes(c.join(' '))).map(([n]) => n).sort()
  t.alike(ran, Object.keys(brought).sort(), 'every hook the solution brings was run here: one added without its place in this walk fails this')
})

test('every protocol the listed packages provide is opened by a hook, or closed on purpose', (t) => {
  const opened = Object.values(brought).filter(c => c[0] === 'protocol/activate').map(c => c[2]).sort()
  const closed = Object.values(brought).filter(c => c[0] === 'protocol/deactivate').map(c => c[2]).sort()
  t.alike(Object.keys(provided).filter(p => !opened.includes(p)).sort(), ['protocol'], 'only the protocol protocol is opened by no hook: the runtime opens it itself; a package added to the list without a hook for its protocol fails this')
  t.alike(closed, of('start').map(n => brought[n][2]).sort(), 'what start opens, stop closes: nothing left open behind a closed door')
})
