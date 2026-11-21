// program: a node's log as its own process: its topic, written from the
// mrepo's outbox folder; synced lazily to its swarm's master; on the
// master, the other nodes' topics collected (README.md beside it).
import process from 'bare-process'
import os from 'bare-os'
import Corestore from 'corestore'
import fs, { existsSync, readdirSync, readFileSync, writeFileSync, renameSync, rmSync, mkdirSync } from 'bare-fs'
import { join } from 'bare-path'
import { topics } from 'p2p-topic'
// The log's records' encoding: one line to change it (its type: the log
// package's types/log-entry.avsc).
import * as handler from 'mycelium-value-json'
import { socketOf, listen, request, open } from 'p2p-local'
import { lookup } from 'mrepo-base-rns'
import { recordOf } from '../entry/index.js'
import { SIDE, SOCKET } from '../client/index.js'

const TOPIC = 'log'
// The topics a master collects, this machine's: { <unique URI>: <key> }.
const COLLECTED = 'topics.json'
const hex = b => Buffer.from(b).toString('hex')
// catch: no such process: not alive
const alive = pid => { try { os.kill(pid, 0); return true } catch { return false } }

// The log of the mrepo in `dir`, served until closed.
//   every   its tick, in ms: the outbox looked at, a sync when one is due
//   sync    how long between two syncs to the master, in ms: lazily
//   swarm   the swarm as this node's lookup db has it: { status(),
//           resolve(uri) } (the node's rns; a test's in its place)
// -> { socket, key, status(), tick(), close() }
export async function serve ({ dir, every = 500, sync = 2000, swarm = lookup(dir), now = () => Date.now() }) {
  const side = join(dir, SIDE)
  mkdirSync(side, { recursive: true })
  const store = new Corestore(join(side, 'store'))
  await store.ready()
  const t = topics(store, { handler })
  const identity = await t.keyPair('node')
  const own = await t.own(TOPIC)
  const socket = socketOf(side, SOCKET)
  const outbox = join(dir, 'outbox')

  // What is in the topic already, by its request: an outbox record once.
  const logged = new Set((await own.read()).map(r => r.key))
  const failed = new Set() // outbox files that are no record: not read again
  // The topics collected (the master's): uri -> { key, topic }
  const collected = new Map()
  const file = join(side, COLLECTED)
  // catch: none collected yet, or not whole: none to start from
  try { for (const [uri, key] of Object.entries(JSON.parse(readFileSync(file, 'utf8')))) collected.set(uri, { key, topic: await t.replica(key) }) } catch {}
  const keep = () => {
    writeFileSync(`${file}.new`, JSON.stringify(Object.fromEntries([...collected].map(([uri, c]) => [uri, c.key])), null, 2) + '\n')
    renameSync(`${file}.new`, file)
  }
  let me = null // this node in its swarm, as its rns says: { uri, role, master }
  let synced = { length: 0, at: null }
  let lastSync = 0
  let error = null

  // One at a time: what appends to the topic.
  let chain = Promise.resolve()
  // catch: what a turn threw is its caller's; the chain goes on
  const queued = fn => { const r = chain.then(fn); chain = r.catch(() => {}); return r }

  // The outbox looked at: each completed record not logged yet appended,
  // the oldest first.
  const take = async () => {
    if (!existsSync(outbox)) return
    const found = []
    for (const name of readdirSync(outbox)) {
      if (!name.endsWith('.json') || logged.has(name.slice(0, -5)) || failed.has(name)) continue
      let envelope = null
      // catch: not whole yet, or not JSON: looked at again the next time
      try { envelope = JSON.parse(readFileSync(join(outbox, name), 'utf8')) } catch { continue }
      const record = recordOf(envelope)
      if (!record || logged.has(record.key)) { failed.add(name); continue }
      found.push(record)
    }
    found.sort((a, b) => String(a.timestamp).localeCompare(String(b.timestamp)))
    for (const r of found) { await own.append(r.value, { key: r.key, timestamp: r.timestamp }); logged.add(r.key) }
  }

  // Synced to the master, lazily: when the topic grew since the last
  // time, and no sooner than `sync` after it. A connection opened for it,
  // ended by the master once it holds the topic up to its length.
  const deliver = async () => {
    lastSync = now()
    try {
      const s = await swarm.status()
      me = s.joined ? { uri: s.uri, role: s.role, master: s.master } : null
      if (!me || me.role === 'master') { error = null; return }
      const m = await swarm.resolve(me.master)
      const at = socketOf(join(m.folder, SIDE), SOCKET)
      const length = own.length
      const { have } = await request(at, { op: 'have', uri: me.uri, key: own.key }, { keyPair: identity })
      if (have < length) {
        const stream = await open(at, { keyPair: identity, hello: { uri: me.uri, key: own.key, length } })
        store.replicate(stream)
        await new Promise(resolve => { const late = setTimeout(() => { stream.destroy(); resolve() }, 10000); stream.once('close', () => { clearTimeout(late); resolve() }) })
        const after = await request(at, { op: 'have', uri: me.uri, key: own.key }, { keyPair: identity })
        if (after.have < length) throw new Error(`not synced: the master has ${after.have} of ${length}`)
      }
      synced = { length, at: new Date(now()).toISOString() }
      error = null
    } catch (err) {
      // (said in its status; tried again at its next turn)
      error = err.message
    }
  }

  const turn = async () => {
    await take()
    if (now() - lastSync >= sync && (own.length > synced.length || me === null)) await deliver()
  }
  const tick = () => queued(turn)

  // A node's topic taken up by the master: registered in the swarm, as
  // its own rns says; the first key offered for a node is the one kept.
  const collect = async ({ uri, key }) => {
    const s = await swarm.status()
    if (!s.joined || s.role !== 'master') throw new Error('not the master: a node\'s log is synced to its swarm\'s master')
    await swarm.resolve(uri)
    const was = collected.get(uri)
    if (was && was.key !== key) throw new Error(`another log is collected for it already: ${uri}`)
    if (!was) { collected.set(uri, { key, topic: await t.replica(key) }); keep() }
    return collected.get(uri).topic
  }

  const status = () => ({
    running: true,
    key: own.key,
    length: own.length,
    ...(me ? { uri: me.uri, role: me.role, ...(me.role === 'node' ? { master: me.master, synced, ...(error ? { error } : {}) } : {}) } : {}),
    collected: [...collected].map(([uri, c]) => ({ uri, key: c.key, length: c.topic.length })).sort((a, b) => a.uri.localeCompare(b.uri))
  })

  const ops = {
    // catch: its rns not answering: what it knew of itself stands
    status: async () => { const s = await swarm.status().catch(() => null); if (s?.joined) me = { uri: s.uri, role: s.role, master: s.master }; return status() },
    // (the outbox taken and synced now, not at the next tick: a test's, a how-to's)
    sync: async () => { await take(); await deliver(); return status() },
    have: async ({ uri, key }) => ({ have: (await collect({ uri, key })).length }),
    // The records held, the newest last: this node's own and, on the
    // master, every node's collected; one node's when asked; the last
    // `limit` of them.
    read: async ({ node = null, limit = 100 }) => {
      await take()
      // catch: its rns not answering: its own log read still, under no name
      const s = await swarm.status().catch(() => null)
      const mine = s?.joined ? s.uri : null
      const all = [[mine, own], ...[...collected].map(([uri, c]) => [uri, c.topic])].filter(([uri]) => node === null || uri === node)
      if (node !== null && !all.length) throw new Error(`no log held here for it: ${node} (${[mine, ...collected.keys()].filter(Boolean).join(', ') || 'none'})`)
      const records = []
      for (const [uri, topic] of all) for (const r of await topic.read({ from: Math.max(0, topic.length - limit) })) records.push({ node: uri, offset: r.offset, timestamp: r.timestamp, ...r.value })
      records.sort((a, b) => String(a.timestamp).localeCompare(String(b.timestamp)))
      return { nodes: all.map(([uri, topic]) => ({ uri, length: topic.length })), records: records.slice(-limit) }
    }
  }

  const server = listen({
    path: socket,
    keyPair: identity,
    onrequest: body => {
      if (!ops[body?.op]) throw new Error(`no such op: ${body?.op}`)
      return queued(() => ops[body.op](body))
    },
    // A node delivering its log: its topic replicated over the connection
    // it opened, up to the length it said; then ended, here.
    onstream: (stream, { hello }) => {
      // (replication attached at once: what the node sends next is its;
      // a peer gets only the topics it knows the key of)
      store.replicate(stream)
      collect(hello ?? {}).then(async topic => {
        await topic.fetch({ length: hello.length, timeout: 8000 })
      // catch: not registered, or not fetched in time: the connection ended, the node told by what the master has
      }).catch(() => {}).then(() => stream.destroy())
    }
  })
  let watcher = null
  // catch: a folder that cannot be watched is looked at instead, every tick
  try { if (existsSync(outbox)) { watcher = fs.watch(outbox, () => { tick().catch(() => {}) }); watcher.on('error', () => {}) } } catch {}
  await tick()
  // catch: a tick that failed is taken again at the next
  const timer = setInterval(() => { tick().catch(() => {}) }, every)
  return {
    socket,
    key: own.key,
    status,
    tick,
    async close () {
      clearInterval(timer)
      watcher?.close()
      await chain
      await server.close()
      await store.close()
    }
  }
}

// The program: the log served in this process until it is ended (SIGTERM,
// SIGINT), its mrepo's folder is gone or its mrepo's runtime has ended.
// What runtime/start hands it:
//   --dir=<the mrepo's folder> --runtime=<pid> --state=<file>
export async function program (argv) {
  const arg = name => argv.find(a => a.startsWith(`--${name}=`))?.slice(name.length + 3)
  const dir = arg('dir')
  const state = arg('state')
  if (!dir || !state) throw new Error('--dir=<the mrepo\'s folder> --state=<file> [--runtime=<pid>]')
  const runtime = arg('runtime') ? Number(arg('runtime')) : null
  const s = await serve({ dir })
  writeFileSync(`${state}.new`, JSON.stringify({ pid: process.pid, socket: s.socket, key: s.key, started: new Date().toISOString() }) + '\n')
  renameSync(`${state}.new`, state)
  let closing = null
  const close = () => (closing ??= s.close().then(() => rmSync(state, { force: true })))
  await new Promise(resolve => {
    const end = () => close().then(resolve, resolve)
    process.on('SIGTERM', end)
    process.on('SIGINT', end)
    const t = setInterval(() => { if (!existsSync(dir) || (runtime && !alive(runtime))) { clearInterval(t); end() } }, 250)
  })
}
