// The component as it is configured: what defines the docs mrepo. Its
// list of packages and its hooks, value by value; then against the
// packages it lists, their bundles read from the sources (SOURCES): every
// hook names a protocol and an action one of them provides; and what the
// hooks do, run with those packages' own actions on a minimal execution,
// in memory: which protocols are open after the boot. No mrepo is built. Every hook file the component
// brings must be named here and run here: the tests fail when one was
// left out.
import test from '../../modules/node_modules/brittle/index.js'
import { readFileSync, readdirSync, existsSync } from '../../modules/node_modules/bare-fs/index.js'
import { join, dirname } from '../../modules/node_modules/bare-path/index.js'
import { fileURLToPath, pathToFileURL } from '../../modules/node_modules/bare-url/index.js'
import os from '../../modules/node_modules/bare-os/index.js'

const pkg = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const json = (...p) => JSON.parse(readFileSync(join(pkg, ...p), 'utf8'))

// The hooks the component brings, as they are in its structure: by
// <transition>/<name>, each its command.
const hooksDir = join(pkg, 'mrepo', 'runtime', 'hooks')
const brought = {}
for (const f of existsSync(hooksDir) ? readdirSync(hooksDir).sort() : []) readFileSync(join(hooksDir, f), 'utf8').split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('#')).forEach((l, i) => { brought[`${f.replace(/\.haicc$/, '')}/${i + 1}`] = l.split(/\s+/) })

const LIST = [
  'haiccing/base-package-runtime',
  'haiccing/base-package-protocol',
  'haiccing/base-package-info',
  'haiccing/base-package-help',
  'haiccing/base-docs-haicc',
  'haiccing/base-docs-hdlc',
  'haiccing/base-docs-package',
  'haiccing/base-docs-uri',
  'haiccing/base-docs-xpath',
  'haiccing/base-docs-vision',
  'haiccing/base-component-docs'
]
// Each hook named here with its command: what the docs mrepo offers from
// its boot, and its info extracted.
const HOOKS = {
  'boot/1': ['protocol/activate', '.', 'help'],
  'boot/2': ['protocol/activate', '.', 'info'],
  'boot/3': ['protocol/activate', '.', 'runtime'],
  'boot/4': ['info/extract']
}

test('its list of packages, in deploy order, itself last', (t) => {
  t.alike(json('mrepo', 'packages', 'layer.json').packages, LIST, 'the runtime, the protocol protocol, info, help, the documentation, the component')
})

test('its hooks, file by file; no service', (t) => {
  t.alike(brought, HOOKS, 'each hook file, its transition and its command; none that is not named here')
  t.absent(existsSync(join(pkg, 'mrepo', 'runtime', 'service.json')), 'no service state: the docs mrepo is not service managed')
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
    help: 'haiccing/base-package-help',
    info: 'haiccing/base-package-info',
    protocol: 'haiccing/base-package-protocol',
    runtime: 'haiccing/base-package-runtime'
  }, 'four protocols, one a package; the documentation and the component provide none')
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
  const files = {}
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
      return actions[p][a](exec, { protocol: p, action: a, uri: [uri], args })
    }
  }
  const active = () => Object.keys(files).filter(u => u.startsWith('/protocols/')).map(u => u.slice('/protocols/'.length, -'.json'.length)).sort()
  return { exec, commands, active }
}

test('what its hooks do: the boot opens help, info and runtime, and extracts the info', async (t) => {
  const w = world()
  // the boot: the runtime places these as its own, in name order
  for (const name of Object.keys(brought).sort()) await w.exec.run(brought[name])
  t.alike(w.active(), ['help', 'info', 'runtime'], 'after the boot: help, info, and the runtime\'s')
  t.absent(w.active().includes('protocol'), 'the protocol protocol: not a hook\'s, the runtime opens it itself')
  t.ok(w.commands.includes('info/extract'), 'its info extracted, by its hook')
  const ran = Object.entries(brought).filter(([, c]) => w.commands.includes(c.join(' '))).map(([n]) => n).sort()
  t.alike(ran, Object.keys(brought).sort(), 'every hook the component brings was run here')
})

test('every protocol the listed packages provide is opened by a hook, or closed on purpose', (t) => {
  const opened = Object.values(brought).filter(c => c[0] === 'protocol/activate').map(c => c[2]).sort()
  t.alike(Object.keys(provided).filter(p => !opened.includes(p)).sort(), ['protocol'], 'only the protocol protocol is left closed: a package added to the list without a hook for its protocol fails this')
})
