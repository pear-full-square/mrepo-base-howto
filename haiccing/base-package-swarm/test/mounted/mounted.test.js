// The package's protocol as it is mounted: its protocol.js, what a runtime
// loads through the dispatcher's /protocol entry (imported here directly:
// this test is itself run by the dispatcher), its config value by value,
// and each action run on a minimal execution: an mrepo's main written for
// the test, the commands an action sends answered here. No mrepo is
// built. Every action the config names must be run here: the last test
// fails when one was left out.
import test from '../../modules/node_modules/brittle/index.js'
import { readFileSync } from '../../modules/node_modules/bare-fs/index.js'
import { join, dirname } from '../../modules/node_modules/bare-path/index.js'
import { fileURLToPath } from '../../modules/node_modules/bare-url/index.js'
import * as mounted from '../../protocol.js'

// Its core type, as the package registers it: types/<name>.avsc.
const typeOf = name => JSON.parse(readFileSync(join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'types', `${name}.avsc`), 'utf8'))
const documented = type => Boolean(type.doc) && type.fields.every(f => f.doc && (typeof f.type !== 'object' || Array.isArray(f.type) || !f.type.fields || documented(f.type)))

// An execution as an action sees it: main's files by path, what it wrote,
// the job it waits for, the command it ran here, its log.
function execution (files = {}, resumed = null) {
  const e = {
    runtime: { dir: '/work/mrepos/local/host', uri: 'local/host' },
    resumed,
    entries: [],
    written: {},
    job: null,
    find: async p => (p in files ? Buffer.from(JSON.stringify(files[p])) : null),
    put (p, bytes) { e.written[p] = JSON.parse(bytes.toString()) },
    wait (job) { e.job = job; return null },
    run: async command => ({ ran: command }),
    log (level, event, data = {}) { e.entries.push({ level, event, ...data }) }
  }
  return e
}
// The commands a job sends, each answered as the mrepo would.
const sent = answers => { const list = []; return { list, run: async parts => { list.push(parts.join(' ')); return answers[parts.find(p => /^[a-z]+\/[a-z]+$/.test(p) && !p.startsWith('swarms'))] ?? null } } }
const ran = new Set()
// an action that wrote into the execution's log as it ran: every one must
const logged = new Set()
const act = async (name, exec, form, how) => {
  ran.add(name)
  const before = exec.entries.length
  try { return await mounted.actions.swarm[name](exec, form, how) } finally { if (exec.entries.length > before) logged.add(name) }
}
const NODE = 'haiccing/base-component-node'
const LOOKUP = { uri: 'swarm-1/master', machine: 'm', folder: '/work/mrepos/swarm-1/master', key: 'aa'.repeat(32), registry: 'bb'.repeat(32) }
const SWARM = { 'main/swarms/swarm-1/.node.json': { kind: 'swarm', master: 'master', lease: 15000, lookup: LOOKUP }, 'main/swarms/swarm-1/node-1/.shortcuts.json': [{ mrepo: 'swarm-1/node-1', link: 'k' }] }

test('loaded as a runtime loads it: one protocol, swarm, its config and its actions', (t) => {
  t.alike(Object.keys(mounted.protocols), ['swarm'], 'the package provides the swarm protocol, and no other')
  t.alike(Object.keys(mounted.actions), ['swarm'])
  t.alike(Object.keys(mounted.actions.swarm).sort(), Object.keys(mounted.protocols.swarm.actions).sort(), 'a function for every action configured, and no other')
})

test('its config, value by value', (t) => {
  const cfg = mounted.protocols.swarm
  t.is(cfg.package, 'haiccing/base-package-swarm', 'the package that brings it')
  t.ok(cfg.description, 'its description')
  t.alike(Object.keys(cfg).sort(), ['actions', 'description', 'package'], 'nothing else: no default action, not behind a state of its own')
  t.alike(Object.keys(cfg.actions).sort(), ['create', 'deploy', 'leave', 'status'])
  for (const [name, a] of Object.entries(cfg.actions)) {
    t.alike([a.uris, a.target], [['**'], true], `${name}: at a position below main, a target needed`)
    t.alike(a.args, name === 'create' ? ['lease?'] : undefined, `${name}: its arguments`)
    t.ok(a.description, `${name}: its description`)
    t.absent('states' in a, `${name}: no states`)
  }
})

test('create: its commands, in order, then the swarm\'s document', async (t) => {
  const exec = execution()
  const s = sent({ 'boot/deploy': { mrepo: 'swarm-1/master' }, 'rns/master': { lease: 15000, lookup: LOOKUP } })
  t.is(await act('create', exec, { uri: ['main', 'swarms/swarm-1'], args: [] }, { run: s.run }), null, 'it waits for its commands')
  t.alike(await exec.job(), { lease: 15000, lookup: LOOKUP })
  t.alike(s.list, ['crud/create swarms/swarm-1 {"kind":"swarm"}', `boot/deploy swarms/swarm-1/master ${NODE}`, 'haicc swarms/swarm-1/master service/initialise', 'haicc swarms/swarm-1/master service/start', 'haicc swarms/swarm-1/master rns/master . swarm-1'], 'the swarm\'s node, its master deployed, in service, made the master')
  const resumed = execution({}, { output: { lease: 15000, lookup: LOOKUP } })
  t.alike(await act('create', resumed, { uri: ['main', 'swarms/swarm-1'], args: [] }), { created: 'swarms/swarm-1', swarm: 'swarm-1', master: 'swarm-1/master', lease: 15000 }, 'resumed: answered')
  t.alike(resumed.written, { 'main/swarms/swarm-1/.node.json': { kind: 'swarm', master: 'master', lease: 15000, lookup: LOOKUP } }, 'its document: where the lookup db is')
})

test('deploy, leave, status: a node into the swarm and registered by this mrepo; taken out; the swarm asked of its master', async (t) => {
  const exec = execution(SWARM)
  const s = sent({ 'rns/join': { joined: 'swarm-1', uri: 'swarm-1/node-2', key: 'cc'.repeat(32), machine: 'm', folder: '/n2' } })
  await act('deploy', exec, { uri: ['main', 'swarms/swarm-1/node-2'] }, { run: s.run })
  t.alike(await exec.job(), { mrepo: 'swarm-1/node-2', package: NODE, registered: 'swarm-1/master' })
  t.alike(s.list.map(l => l.split(' ').slice(0, 3).join(' ')), [`boot/deploy swarms/swarm-1/node-2 ${NODE}`, 'haicc swarms/swarm-1/node-2 service/initialise', 'haicc swarms/swarm-1/node-2 service/start', 'haicc swarms/swarm-1/node-2 rns/join', 'haicc swarms/swarm-1/master rns/register'], 'deployed, in service, joined, registered at the master')
  t.ok(s.list.at(-1).includes('"by":"local/host"'), 'registered by this mrepo: the creator')
  t.alike(await act('deploy', execution(SWARM, { output: { mrepo: 'swarm-1/node-2', package: NODE, registered: 'swarm-1/master' } }), { uri: ['main', 'swarms/swarm-1/node-2'] }), { deployed: 'swarms/swarm-1/node-2', mrepo: 'swarm-1/node-2', package: NODE, registered: 'swarm-1/master' }, 'resumed: answered')
  await t.exception(act('deploy', execution(), { uri: ['main', 'swarms/swarm-1/node-2'] }), /not a swarm made here/, 'below what is no swarm made here: refused')
  const out = execution(SWARM)
  const o = sent({})
  await act('leave', out, { uri: ['main', 'swarms/swarm-1/node-1'] }, { run: o.run })
  await out.job()
  t.alike(o.list, ['haicc swarms/swarm-1/master rns/leave . swarm-1/node-1', 'boot/teardown swarms/swarm-1/node-1'], 'leave: out of the lookup db, then torn down')
  t.alike(await act('status', execution(SWARM), { uri: ['main', 'swarms/swarm-1'] }), { ran: ['haicc', 'swarms/swarm-1/master', 'rns/status'] }, 'status: the master\'s rns/status')
})

test('its core type: the swarm\'s node, every field documented, the fields create writes', async (t) => {
  const type = typeOf('swarm')
  t.is(type.name, 'haiccing.basePackageSwarm.swarm', 'named by its organisation, its package, its name')
  t.ok(documented(type), 'a doc on it and on every field')
  const resumed = execution({}, { output: { lease: 15000, lookup: LOOKUP } })
  await act('create', resumed, { uri: ['main', 'swarms/swarm-1'], args: [] })
  const written = resumed.written['main/swarms/swarm-1/.node.json']
  t.alike(type.fields.map(f => f.name), Object.keys(written), 'its fields: those of the document as create writes it')
  t.alike(type.fields.at(-1).type.fields.map(f => f.name), Object.keys(written.lookup), 'and its lookup\'s')
})

test('nothing forgotten: every action configured run here, each writing into the request\'s log', (t) => {
  t.alike([...ran].sort(), Object.keys(mounted.protocols.swarm.actions).sort(), 'every action run')
  t.alike([...logged].sort(), Object.keys(mounted.protocols.swarm.actions).sort(), 'each one logged as it ran')
})
