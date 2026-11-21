// The package's protocol as it is mounted: its protocol.js, what a runtime
// loads through the dispatcher's /protocol entry (imported here directly:
// this test is itself run by the dispatcher), its config value by value,
// and each action run on a minimal execution, against the log served in
// this process for two folders, a master's and a node's, the swarm said
// to each as its rns would. No mrepo is built. Every action the config
// names must be run here: the last test fails when one was left out.
import test from '../../modules/node_modules/brittle/index.js'
import { mkdtempSync, mkdirSync, writeFileSync } from '../../modules/node_modules/bare-fs/index.js'
import { join } from '../../modules/node_modules/bare-path/index.js'
import os from '../../modules/node_modules/bare-os/index.js'
import * as mounted from '../../protocol.js'
import { serve } from '../../modules/pear-full-square/mrepo-base-log/index.js'

const folder = () => { const d = mkdtempSync(join(os.tmpdir(), 'log-')); mkdirSync(join(d, 'outbox')); return d }
// An execution as an action sees it: the mrepo's folder, its log.
const execution = dir => ({ runtime: { dir }, entries: [], log (level, event, data = {}) { this.entries.push({ level, event, ...data }) } })
// A completed request, as an mrepo's outbox holds it.
const drop = (d, key, command, done) => writeFileSync(join(d, 'outbox', `${key}.json`), JSON.stringify({ topic: '/outbox', key, timestamp: done, headers: {}, value: { topic: '/haicc/terminal', key, timestamp: done, headers: {}, value: { command: command.split(' '), output: {} } } }) + '\n')
const ran = new Set()
// an action that wrote into the execution's log as it ran: every one must
const logged = new Set()
const act = async (name, exec, form) => {
  ran.add(name)
  const before = exec.entries.length
  try { return await mounted.actions.log[name](exec, form) } finally { if (exec.entries.length > before) logged.add(name) }
}

test('loaded as a runtime loads it: one protocol, log, its config and its actions', (t) => {
  t.alike(Object.keys(mounted.protocols), ['log'], 'the package provides the log protocol, and no other')
  t.alike(Object.keys(mounted.actions), ['log'])
  t.alike(Object.keys(mounted.actions.log).sort(), Object.keys(mounted.protocols.log.actions).sort(), 'a function for every action configured, and no other')
})

test('its config, value by value', (t) => {
  const cfg = mounted.protocols.log
  t.is(cfg.package, 'haiccing/base-package-log', 'the package that brings it')
  t.ok(cfg.description, 'its description')
  t.alike(Object.keys(cfg).sort(), ['actions', 'default', 'description', 'package'], 'nothing else: not behind a state of its own')
  t.is(cfg.default, 'read', 'its default action: log alone is log/read')
  t.alike(Object.keys(cfg.actions).sort(), ['read', 'status'])
  const args = { read: ['node?', 'limit?'], status: ['sync?'] }
  for (const [name, a] of Object.entries(cfg.actions)) {
    t.alike(a.uris, ['.'], `${name}: at the mrepo itself, the node whose log it is`)
    t.alike(a.args, args[name], `${name}: its arguments, each optional`)
    t.ok(a.description, `${name}: its description`)
    t.absent('states' in a || 'target' in a, `${name}: no states, no target`)
  }
})

test('its actions: a node\'s log synced to the master, read there across nodes and by node', async (t) => {
  const [m, n] = [folder(), folder()]
  const folders = { 'swarm-1/master': m, 'swarm-1/node-1': n }
  const swarmOf = uri => ({ status: async () => ({ joined: true, uri, role: uri === 'swarm-1/master' ? 'master' : 'node', master: 'swarm-1/master' }), resolve: async u => { if (!folders[u]) throw new Error(`not registered: ${u}`); return { uri: u, folder: folders[u] } } })
  drop(m, 'm1', 'rns/status', '2026-11-21T00:00:01.000Z')
  drop(n, 'n1', 'crud/read .', '2026-11-21T00:00:02.000Z')
  const M = await serve({ dir: m, every: 1e9, sync: 0, swarm: swarmOf('swarm-1/master') })
  const N = await serve({ dir: n, every: 1e9, sync: 0, swarm: swarmOf('swarm-1/node-1') })
  const s = await act('status', execution(n), { args: ['sync'] })
  t.alike([s.running, s.key, s.length, s.role, s.master, s.synced.length], [true, N.key, 1, 'node', 'swarm-1/master', 1], 'status at the node, synced: its topic, its length, how far it is synced to its master')
  t.alike((await act('status', execution(m), { args: [] })).collected, [{ uri: 'swarm-1/node-1', key: N.key, length: 1 }], 'status at the master: the node\'s topic collected')
  const all = await act('read', execution(m), { args: [] })
  t.alike([all.nodes.map(x => x.uri), all.records.map(r => [r.node, r.command, r.ok])], [['swarm-1/master', 'swarm-1/node-1'], [['swarm-1/master', 'rns/status', true], ['swarm-1/node-1', 'crud/read .', true]]], 'read at the master: every node\'s log in one view, by time')
  t.alike((await act('read', execution(m), { args: ['swarm-1/node-1', '5'] })).records.map(r => r.request), ['n1'], 'filtered by node')
  t.alike((await act('read', execution(n), { args: [] })).nodes.map(x => x.uri), ['swarm-1/node-1'], 'read at a node: its own')
  await N.close()
  await M.close()
  t.alike(await act('status', execution(n), {}), { running: false, length: 0, collected: [] }, 'status with its program not running: said')
})

test('nothing forgotten: every action configured run here, each writing into the request\'s log', (t) => {
  t.alike([...ran].sort(), Object.keys(mounted.protocols.log.actions).sort(), 'every action run')
  t.alike([...logged].sort(), Object.keys(mounted.protocols.log.actions).sort(), 'each one logged as it ran')
})
