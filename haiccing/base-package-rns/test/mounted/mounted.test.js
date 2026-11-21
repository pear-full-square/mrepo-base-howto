// The package's protocol as it is mounted: its protocol.js, what a runtime
// loads through the dispatcher's /protocol entry (imported here directly:
// this test is itself run by the dispatcher), its config value by value,
// and each action run on a minimal execution, against the rns served in
// this process for two folders, a master's and a node's. No mrepo is
// built. Every action the config names must be run here: the last test
// fails when one was left out.
import test from '../../modules/node_modules/brittle/index.js'
import { mkdtempSync } from '../../modules/node_modules/bare-fs/index.js'
import { join } from '../../modules/node_modules/bare-path/index.js'
import os from '../../modules/node_modules/bare-os/index.js'
import * as mounted from '../../protocol.js'
import { serve } from '../../modules/pear-full-square/mrepo-base-rns/index.js'

const folder = () => mkdtempSync(join(os.tmpdir(), 'rns-'))
// An execution as an action sees it: the mrepo's folder and unique URI, its log.
const execution = (dir, uri) => ({ runtime: { dir, uri }, entries: [], log (level, event, data = {}) { this.entries.push({ level, event, ...data }) }, async step (event, data, fn) { const r = await fn(); this.log('verbose', event, typeof data === 'function' ? data(r) : data); return r } })
const ran = new Set()
// an action that wrote into the execution's log as it ran: every one must
const logged = new Set()
const act = async (name, exec, form) => {
  ran.add(name)
  const before = exec.entries.length
  try { return await mounted.actions.rns[name](exec, form) } finally { if (exec.entries.length > before) logged.add(name) }
}

test('loaded as a runtime loads it: one protocol, rns, its config and its actions', (t) => {
  t.alike(Object.keys(mounted.protocols), ['rns'], 'the package provides the rns protocol, and no other')
  t.alike(Object.keys(mounted.actions), ['rns'])
  t.alike(Object.keys(mounted.actions.rns).sort(), Object.keys(mounted.protocols.rns.actions).sort(), 'a function for every action configured, and no other')
})

test('its config, value by value', (t) => {
  const cfg = mounted.protocols.rns
  t.is(cfg.package, 'haiccing/base-package-rns', 'the package that brings it')
  t.ok(cfg.description, 'its description')
  t.alike(Object.keys(cfg).sort(), ['actions', 'default', 'description', 'package'], 'nothing else: not behind a state of its own')
  t.is(cfg.default, 'status', 'its default action: rns alone is rns/status')
  t.alike(Object.keys(cfg.actions).sort(), ['join', 'leave', 'master', 'register', 'resolve', 'status'])
  const args = { status: undefined, resolve: ['node'], master: ['swarm', 'lease?'], join: ['swarm', 'lookup'], register: ['node'], leave: ['node'] }
  for (const [name, a] of Object.entries(cfg.actions)) {
    t.alike(a.uris, ['.'], `${name}: at the mrepo itself, the node whose rns it is`)
    t.alike(a.args, args[name], `${name}: its arguments`)
    t.ok(a.description, `${name}: its description`)
    t.absent('states' in a || 'target' in a, `${name}: no states, no target`)
  }
})

test('its actions: a master, a node joined and registered, the swarm answered at both, a node resolved, taken out', async (t) => {
  const [m, n] = [folder(), folder()]
  // (their clock: the test's, moved on to where a node's next turn is due)
  let clock = Date.now()
  const now = () => clock
  const M = await serve({ dir: m, every: 1e9, now })
  const N = await serve({ dir: n, every: 1e9, now })
  const master = execution(m, 'swarm-1/master')
  const node = execution(n, 'swarm-1/node-1')
  const made = await act('master', master, { args: ['swarm-1', '5'] })
  t.alike([made.master, made.swarm, made.lease, made.lookup.folder, made.lookup.key], ['swarm-1/master', 'swarm-1', 5000, m, M.key], 'master: the lookup db made, what a node needs to find it')
  const joined = await act('join', node, { args: ['swarm-1', JSON.stringify(made.lookup)] })
  t.alike([joined.joined, joined.uri, joined.key, joined.folder], ['swarm-1', 'swarm-1/node-1', N.key, n], 'join: what its creator registers it with')
  t.alike(await act('register', master, { args: [JSON.stringify({ ...joined, by: 'local/host' })] }), { registered: 'swarm-1/node-1', already: false, lease: 5000 }, 'register: at the master, by its creator')
  clock += 2000
  await N.tick()
  const there = { 'swarm-1/master': 'active', 'swarm-1/node-1': 'active' }
  const states = s => Object.fromEntries(s.nodes.map(x => [x.uri, x.state]))
  t.alike(states(await act('status', master, {})), there, 'status at the master: the node active, its lease renewed by its own rns')
  const seen = await act('status', node, {})
  t.alike([states(seen), seen.role, seen.master, typeof seen.synced], [there, 'node', 'swarm-1/master', 'string'], 'status at the node: the same, from its replica')
  const where = await act('resolve', node, { args: ['swarm-1/master'] })
  t.alike([where.role, where.folder, where.key], ['master', m, M.key], 'resolve at the node: where the master lives')
  t.alike(await act('leave', master, { args: ['swarm-1/node-1'] }), { left: 'swarm-1/node-1' }, 'leave: taken out, at the master')
  await t.exception(act('register', node, { args: [JSON.stringify(joined)] }), /not the master/, 'what is the master\'s is refused by a node')
  await N.close()
  await M.close()
  t.alike(await act('status', node, {}), { running: false, joined: false, nodes: [] }, 'status with its program not running: said')
})

test('nothing forgotten: every action configured run here, each writing into the request\'s log', (t) => {
  t.alike([...ran].sort(), Object.keys(mounted.protocols.rns.actions).sort(), 'every action run')
  t.alike([...logged].sort(), Object.keys(mounted.protocols.rns.actions).sort(), 'each one logged as it ran')
})
