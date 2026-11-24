import test from 'brittle'
import { outboxOf } from 'mrepo-base-request'
import { mkdtempSync, mkdirSync, writeFileSync } from 'bare-fs'
import { join } from 'bare-path'
import { tmpdir } from 'bare-os'
import { recordOf, serve, read, status } from '../index.js'

const dir = () => { const d = mkdtempSync(join(tmpdir(), 'log-')); mkdirSync(join(d, 'outbox')); return d }
// An execution as an action sees it: the mrepo's folder, its log.
const execution = dir => ({ runtime: { dir }, entries: [], log (level, event, data = {}) { this.entries.push({ level, event, ...data }) } })
// A completed request, as an mrepo's outbox holds it.
// (its offset: its one identity, its file's name in the outbox, a streaming folder)
const O = Object.fromEntries(['k1', 'k2', 'm1', 'a1', 'a2', 'a3', 'b1', 's1', 't1'].map((k, i) => [k, 1795312345601 + i]))
const completed = (key, command, done, { sent = done, error = null } = {}) => ({ topic: '/outbox', offset: O[key], timestamp: done, headers: {}, value: { topic: '/haicc/terminal', offset: O[key], timestamp: sent, headers: {}, value: { command: command.split(' '), protocol: command.split('/')[0], action: 'x', ...(error ? { error } : { output: {} }) } } })
const drop = (d, record) => outboxOf(d).put(record.offset, record)
// The swarm as a node's rns would say it: a master and two nodes, each where it lives.
const swarmOf = (uri, folders) => ({
  status: async () => ({ joined: true, uri, role: uri === 'swarm-1/master' ? 'master' : 'node', master: 'swarm-1/master' }),
  resolve: async u => { if (!folders[u]) throw new Error(`not registered: ${u}`); return { uri: u, folder: folders[u] } }
})

test('a completed request made a log record: its request, when, how long, who asked, the command, how it ended', (t) => {
  t.alike(recordOf(completed('k1', 'crud/read .', '2026-11-21T00:00:01.500Z', { sent: '2026-11-21T00:00:01.000Z' })), { key: String(O.k1), timestamp: '2026-11-21T00:00:01.500Z', value: { request: String(O.k1), sent: '2026-11-21T00:00:01.000Z', ms: 500, from: '/haicc/terminal', command: 'crud/read .', ok: true, error: null } })
  t.alike(recordOf(completed('k2', 'boot/deploy x', '2026-11-21T00:00:02.000Z', { error: 'missing argument: package' })).value.error, 'missing argument: package', 'one that failed: its error')
  t.is(recordOf({ key: 'layer', value: { mode: 'non-atomic' } }), null, 'what is no completed record: none')
  t.is(recordOf({ key: 'k', value: { value: { command: ['x'] } } }), null, 'not completed yet: none')
})

test('each node\'s log a topic of its own, written from its outbox; synced lazily to the master; read there in one view, by node', async (t) => {
  const [m, a, b] = [dir(), dir(), dir()]
  const folders = { 'swarm-1/master': m, 'swarm-1/node-1': a, 'swarm-1/node-2': b }
  drop(m, completed('m1', 'rns/master . swarm-1', '2026-11-21T00:00:00.000Z'))
  drop(a, completed('a1', 'service/start', '2026-11-21T00:00:01.000Z'))
  drop(a, completed('a2', 'crud/read .', '2026-11-21T00:00:03.000Z'))
  drop(b, completed('b1', 'crud/create x', '2026-11-21T00:00:02.000Z', { error: 'x exists' }))
  const M = await serve({ dir: m, every: 1e9, sync: 0, swarm: swarmOf('swarm-1/master', folders) })
  const A = await serve({ dir: a, every: 1e9, sync: 0, swarm: swarmOf('swarm-1/node-1', folders) })
  const B = await serve({ dir: b, every: 1e9, sync: 0, swarm: swarmOf('swarm-1/node-2', folders) })
  t.alike([M.status().length, A.status().length, B.status().length], [1, 2, 1], 'each its own topic, the records of its outbox in it')
  t.not(A.key, B.key, 'each its own key')
  t.alike([A.status().synced.length, A.status().error], [2, undefined], 'a node: synced to the master as it started')
  t.alike(M.status().collected.map(c => [c.uri, c.key, c.length]), [['swarm-1/node-1', A.key, 2], ['swarm-1/node-2', B.key, 1]], 'the master: each node\'s topic collected, by replication')
  const all = await read(execution(m), { args: [] })
  t.alike(all.nodes, [{ uri: 'swarm-1/master', length: 1 }, { uri: 'swarm-1/node-1', length: 2 }, { uri: 'swarm-1/node-2', length: 1 }], 'log/read at the master: every node\'s log')
  t.alike(all.records.map(r => [r.node, r.command, r.ok]), [['swarm-1/master', 'rns/master . swarm-1', true], ['swarm-1/node-1', 'service/start', true], ['swarm-1/node-2', 'crud/create x', false], ['swarm-1/node-1', 'crud/read .', true]], 'in one view, by time')
  t.alike((await read(execution(m), { args: ['swarm-1/node-2'] })).records.map(r => [r.node, r.offset, r.error]), [['swarm-1/node-2', 0, 'x exists']], 'filtered by node')
  t.alike((await read(execution(m), { args: ['2'] })).records.map(r => r.request), [String(O.b1), String(O.a2)], 'a limit: the last of them')
  await t.exception(read(execution(m), { args: ['swarm-1/node-9'] }), /no log held here for it: swarm-1\/node-9 \(swarm-1\/master, swarm-1\/node-1, swarm-1\/node-2\)/)
  await t.exception(read(execution(m), { args: ['swarm-1/node-1', 'many'] }), /not a limit: many/)
  t.alike((await read(execution(a), { args: [] })).nodes, [{ uri: 'swarm-1/node-1', length: 2 }], 'log/read at a node: its own log only')
  // a record more at a node: taken from its outbox, at the master after the node's next sync
  drop(a, completed('a3', 'info/get', '2026-11-21T00:00:04.000Z'))
  drop(a, completed('a1', 'service/start', '2026-11-21T00:00:01.000Z'))
  const s = await status(execution(a), { args: ['sync'] })
  t.alike([s.length, s.synced.length, s.role, s.master], [3, 3, 'node', 'swarm-1/master'], 'log/status sync: its outbox taken, its log synced now; a record there already not logged twice')
  t.is((await read(execution(m), { args: ['swarm-1/node-1'] })).records.at(-1).command, 'info/get', 'and at the master')
  // a node not registered is not collected; another key for a node is not taken
  const stray = dir()
  drop(stray, completed('s1', 'x/y', '2026-11-21T00:00:05.000Z'))
  const S = await serve({ dir: stray, every: 1e9, sync: 0, swarm: swarmOf('swarm-1/node-9', folders) })
  t.is(S.status().error, 'not registered: swarm-1/node-9', 'a node the master\'s rns does not know: not collected, said in its status')
  const twin = dir()
  drop(twin, completed('t1', 'x/y', '2026-11-21T00:00:06.000Z'))
  const T = await serve({ dir: twin, every: 1e9, sync: 0, swarm: swarmOf('swarm-1/node-1', folders) })
  t.is(T.status().error, 'another log is collected for it already: swarm-1/node-1', 'a second log for a node: refused')
  await S.close(); await T.close()
  // started again: nothing logged twice, the collected topics kept
  await A.close(); await M.close()
  const A2 = await serve({ dir: a, every: 1e9, sync: 0, swarm: swarmOf('swarm-1/node-1', folders) })
  const M2 = await serve({ dir: m, every: 1e9, sync: 0, swarm: swarmOf('swarm-1/master', folders) })
  t.alike([A2.key, A2.status().length], [A.key, 3], 'a node started again: the same topic, nothing logged twice')
  t.alike(M2.status().collected.map(c => [c.uri, c.length]), [['swarm-1/node-1', 3], ['swarm-1/node-2', 1]], 'the master started again: what it collected kept')
  await A2.close(); await B.close(); await M2.close()
  t.alike(await status(execution(m)), { running: false, length: 0, collected: [] }, 'log/status with no program running: said, not refused')
  await t.exception(read(execution(m), { args: [] }), /the log is not running here/)
  await t.exception(status(execution(m), { args: ['now'] }), /not an argument of log\/status: now/)
})
