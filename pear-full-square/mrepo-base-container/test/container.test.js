// The container actions, with Docker: a bridgehead built here (a swarm's
// node, its packages a sources folder's), an execution
// written for the actions (reads from its repository, writes collected,
// then committed), and a real container made, started, reached, stopped
// and removed. No Docker daemon answering: the test fails, saying so.
import test from 'brittle'
import fs, { mkdtempSync, rmSync, mkdirSync, writeFileSync, existsSync, readFileSync } from 'bare-fs'
import { join } from 'bare-path'
import { tmpdir } from 'bare-os'
import process from 'bare-process'
import { openRepo, writer, p2pgitBackend } from 'mycelium-git'
import { record, wrap, guid } from 'mrepo-base-request'
import { ask } from 'mrepo-base-runtime'
import { build, place, parseSource } from 'mrepo-base-boot'
import { create, start, stop, remove, status, replica, docker, available, imageOf, stateOf, AT, CONTAINERS, MOUNT, IMAGE } from '../index.js'

const json = b => JSON.parse(b.toString())
const lj = (dir, mode) => { mkdirSync(dir, { recursive: true }); writeFileSync(join(dir, 'layer.json'), JSON.stringify({ mode, description: 'test' })) }

// The packages as a sources folder holds them (the packages' build). (SOURCES: a sources folder given, as a package's
// tests pass theirs)
const SOURCES = process.env.SOURCES || join(import.meta.dirname ?? new URL('.', import.meta.url).pathname, '..', '..', '..', 'sources')
// The package the bridgehead is made of here: the runtime's own, the
// least that runs.
const PACKAGE = 'haiccing/base-package-runtime'

// A bridgehead: a swarm's node, placed by its unique URI, its packages
// manifest naming the store, the sources and its own package.
async function bridgehead (work) {
  const src = mkdtempSync(join(tmpdir(), 'container-node-'))
  try {
    for (const l of ['main', 'runtime', 'packages', 'links']) lj(join(src, l), 'atomic')
    const { dir } = await build({ from: src, dir: join(work, 'mrepos', 'swarm-1', 'node-1'), setting: false })
    await place({ dir, store: join(work, 'packages'), sources: [parseSource(`folder:${SOURCES}`)], list: [PACKAGE] })
    return dir
  } finally { rmSync(src, { recursive: true, force: true }) }
}

// An execution's context: reads the repository, writes collected and
// committed to their layers after the action.
function context (dir, work, uri = 'swarm-1/node-1') {
  const backend = p2pgitBackend(join(dir, '.git'), { fs })
  const repo = openRepo(backend)
  const abs = p => (p.startsWith('/') ? p : `/${p}`)
  const edits = []
  const exec = {
    runtime: { name: 'node-1', uri, dir, work },
    select: u => repo.select(abs(u)),
    read: u => repo.read(abs(u)),
    // the rest of an execution context, standing in: a file that may not
    // be there, the log (kept: entries), a step run as it is
    find: async function (p) { try { return await this.read(p) } catch { return null } },
    log: function (level, event, data = {}) { (this.entries ??= []).push({ level, event, ...data }) },
    step: async function (event, data, fn, level = 'verbose') { const r = await fn(); (this.entries ??= []).push({ level, event, ...(typeof data === 'function' ? data(r) : data) }); return r },
    put: (u, bytes) => edits.push(['put', abs(u), bytes]),
    remove: u => edits.push(['remove', abs(u)])
  }
  async function commit () {
    const byLayer = new Map()
    for (const [op, path, bytes] of edits.splice(0)) {
      const [, layer, ...rest] = path.split('/')
      if (!byLayer.has(layer)) byLayer.set(layer, [])
      byLayer.get(layer).push([op, `/${rest.join('/')}`, bytes])
    }
    for (const [layer, list] of byLayer) {
      const c = await writer(backend).change(layer)
      for (const [op, path, bytes] of list) op === 'put' ? await c.put(path, bytes) : c.remove(path)
      await c.commit('test', { author: { name: 'test', email: 'test@localhost' } })
    }
  }
  return { exec, commit, repo }
}

test('the replica an action is about: by the mrepo\'s unique URI, beside the mrepos; its container\'s name', (t) => {
  const exec = { runtime: { dir: '/w/mrepos/swarm-1/node-1', work: '/w', uri: 'swarm-1/node-1' }, log: () => {} }
  const r = replica(exec)
  t.alike([r.at, AT, r.mrepo], ['container', 'container', 'swarm-1/node-1/container'], 'linked at container; its unique URI the mrepo\'s, with its position behind it')
  t.alike([r.dir, r.folder, CONTAINERS], ['/w/containers/swarm-1/node-1', '../../../containers/swarm-1/node-1', 'containers'], 'its folder, by the mrepo\'s unique URI: <work>/containers/<swarm>/<name>; from the mrepo\'s own folder')
  t.ok(/^haicc-swarm-1-node-1-[0-9a-f]{8}$/.test(r.name), 'its container\'s name: the URI and the folder\'s hash')
  t.unlike(replica({ runtime: { dir: '/v/mrepos/swarm-1/node-1', work: '/v', uri: 'swarm-1/node-1' }, log: () => {} }).name, r.name, 'another install: another name')
  t.alike([r.node, r.links, r.local('k')], ['main/container/.node.json', 'main/container/.shortcuts.json', 'links/k.json'], 'its node and its shortcut in main, its link\'s record in the links layer')
  t.is(replica({ runtime: { dir: '/w/x/node-1', work: null, uri: 'swarm-1/node-1' }, log: () => {} }).dir, '/w/x/containers/swarm-1/node-1', 'no work folder: beside the mrepo')
  t.exception(() => replica({ runtime: { dir: '/w/mrepos/boot', work: '/w', uri: 'boot' }, log: () => {} }), /no unique URI to make a replica by: boot/, 'an mrepo without a unique URI: no replica')
  t.exception(() => replica({ runtime: { dir: '/mrepo', work: null, uri: 'swarm-1/node-1/container' }, log: () => {} }), /a replica makes no replica of its own: swarm-1\/node-1\/container/, 'a replica: none of its own')
  const h = replica({ runtime: { dir: '/w/mrepos/haiccing/base-package-crud/howto/query/node-1', work: '/w', uri: 'haiccing/base-package-crud/howto/query/node-1' }, log: () => {} })
  t.alike([h.dir, /^haicc-haiccing-base-package-crud-howto-query-node-1-[0-9a-f]{8}$/.test(h.name)], ['/w/containers/haiccing/base-package-crud/howto/query/node-1', true], 'a unique URI that is a path: its folder by it, its container named by it')
  t.exception(() => replica({ runtime: { dir: null, uri: 'swarm-1/node-1' }, log: () => {} }), /no directory in the context/)
  t.is(MOUNT, '/mrepo', 'its folder inside its container')
})

test('Docker: asked through its command line; a command that fails said, not thrown', (t) => {
  t.ok(/^\d+\./.test(available()), 'Docker there, its daemon answering: its version')
  const r = docker('inspect', '--type', 'container', 'haicc-no-such-container')
  t.alike([r.ok, /no such container/i.test(r.err)], [false, true], 'a command that fails: not ok, what it said')
  t.is(stateOf('haicc-no-such-container'), null, 'no such container: no state')
})

test('a replica made, started, reached, stopped, started again and removed: a real container', { timeout: 300000 }, async (t) => {
  const work = mkdtempSync(join(tmpdir(), 'container-'))
  let name = null
  try {
    const dir = await bridgehead(work)
    const { exec, commit, repo } = context(dir, work)
    name = replica(exec).name
    const placed = join(work, 'containers', 'swarm-1', 'node-1')

    t.alike(await status(exec), { replica: null, state: 'none' }, 'status, nothing made: none')
    await t.exception(start(exec), /no replica: container \(container\/create\)/, 'start before create: no replica')
    await t.exception(stop(exec), /no replica: container \(container\/create\)/, 'stop the same')
    await t.exception(remove(exec), /no replica: container/, 'nothing to remove')

    // a position that exists locally (data in main there): not the replica's
    exec.put('/main/container/notes.json', Buffer.from('1'))
    await commit()
    await t.exception(create(exec), /container exists locally: the container protocol cannot use it/, 'the position holding data of the mrepo\'s own: refused')
    exec.remove('/main/container/notes.json')
    await commit()

    exec.entries = []
    const c = await create(exec)
    await commit()
    t.alike([c.created, c.mrepo, c.package, c.container.name], ['container', 'swarm-1/node-1/container', PACKAGE, name], 'create: linked at container, its unique URI the bridgehead\'s with container behind it, made of the bridgehead\'s own package')
    t.ok(new RegExp(`^${IMAGE}:[0-9a-f]{12}$`).test(c.container.image), 'its image: Bare, named by the binary')
    t.alike(imageOf(process.execPath), { image: c.container.image, built: false }, 'the image there now: not built again')
    t.ok(existsSync(join(placed, '.git')), 'its folder: <work>/containers/swarm-1/node-1')
    t.alike(json(await openRepo(p2pgitBackend(join(placed, '.git'), { fs })).read('/runtime/mrepo.json')), { uri: 'swarm-1/node-1/container' }, 'its identity: its own unique URI')
    const [shortcut] = json(await repo.read('/main/container/.shortcuts.json'))
    const link = json(await repo.read(`/links/${shortcut.link}.json`))
    t.alike([shortcut.mrepo, link.uri, link.at, link.how, link.folder, link.package, link.container], ['swarm-1/node-1/container', 'swarm-1/node-1/container', 'container', 'container', '../../../containers/swarm-1/node-1', PACKAGE, c.container], 'its shortcut in main at container; its link\'s record: how it came about, where it is, its package, its container')
    t.alike(json(await repo.read('/main/container/.node.json')), {}, 'its node, in main')
    t.is(stateOf(name), 'created', 'its container made, not started')
    t.alike(json(docker('inspect', '--format', '{{json .Config.Labels}}', name).out), { 'haicc.mrepo': 'swarm-1/node-1/container', 'haicc.folder': placed }, 'labelled: its mrepo, its folder')
    t.alike(exec.entries.filter(e => e.level === 'info').map(e => e.event), ['created'], 'what it did, at info')
    t.alike(exec.entries.filter(e => e.level === 'verbose').map(e => e.event), ['lay', 'build', 'place', 'image', 'container'], 'its steps, at verbose')
    await t.exception(create(exec), /created already: container/)
    t.alike(await status(exec), { replica: 'container', mrepo: 'swarm-1/node-1/container', container: name, image: c.container.image, state: 'created' }, 'status: created')
    t.alike(await stop(exec), { stopped: 'container', container: name, state: 'created' }, 'stop, not running: left as it is')

    t.alike(await start(exec), { started: 'container', container: name, state: 'running', service: 'started' }, 'start: running, the replica in service by its commission')
    const s = await ask({ repo: placed, op: 'status' })
    t.alike([s?.pid, s?.repository.uri], [1, 'swarm-1/node-1/container'], 'its runtime answering on its socket in the mapped folder: process 1 of its container')
    // a request into its inbox folder, as the bridgehead reaches it: answered
    const core = record('/test', ['info/get'], guid())
    writeFileSync(join(placed, 'inbox', `${core.key}.json`), JSON.stringify(wrap('/swarm-1/node-1/container/inbox', core)))
    let back = null
    for (let i = 0; i < 150 && !back; i++) { back = existsSync(join(placed, 'outbox', `${core.key}.json`)) ? JSON.parse(readFileSync(join(placed, 'outbox', `${core.key}.json`))) : null; if (!back) await new Promise(resolve => setTimeout(resolve, 100)) }
    t.ok(back?.value.value.output?.choices?.[0]?.title, `its inbox operational: a request dropped into the mapped folder answered in its outbox folder ${back?.value.value.error ?? ''}`)
    t.alike(await start(exec), { started: 'container', container: name, state: 'running' }, 'start again: running already, left as it is')
    t.is((await status(exec)).state, 'running', 'status: running')

    t.alike(await stop(exec), { stopped: 'container', container: name, state: 'exited' }, 'stop: exited')
    t.alike([docker('inspect', '--format', '{{.State.ExitCode}}', name).out, existsSync(join(placed, 'runtime.sock'))], ['0', false], 'its runtime closed on being asked: ended with 0, its socket gone')
    t.alike(await start(exec), { started: 'container', container: name, state: 'running', service: 'started' }, 'started again: the same container, the same folder; not commissioned again, its service as it was')
    t.is((await ask({ repo: placed, op: 'status' }))?.pid, 1, 'its runtime answering again')

    exec.entries = []
    t.alike(await remove(exec), { removed: 'container', container: name }, 'remove, while it runs')
    await commit()
    t.alike([stateOf(name), existsSync(placed)], [null, false], 'its container gone, its folder gone')
    t.alike([await repo.find('/main/container/.shortcuts.json'), await repo.find('/main/container/.node.json'), (await repo.select('/links/*')).filter(([p]) => !p.endsWith('layer.json')).length], [null, null, 0], 'its shortcut and its node out of main, its link\'s record out of the links layer')
    t.alike(exec.entries.filter(e => e.level === 'info').map(e => e.event), ['removed'], 'what it did, at info')
    t.alike(await status(exec), { replica: null, state: 'none' }, 'status: none')

    // a container removed outside the protocol: said, and cleared by remove
    await create(exec)
    await commit()
    docker('rm', '-f', name)
    t.is((await status(exec)).state, 'gone', 'its container removed outside the protocol: gone')
    await t.exception(start(exec), /its container is gone: haicc-swarm-1-node-1-[0-9a-f]{8} \(container\/remove, then container\/create\)/, 'start: said')
    t.alike(await remove(exec), { removed: 'container', container: name }, 'remove: the rest taken away, no error')
    await commit()
    t.absent(existsSync(placed), 'its folder gone')
  } finally {
    if (name) docker('rm', '-f', name)
    rmSync(work, { recursive: true, force: true })
  }
})

test('nothing of a replica left when it cannot be made', { timeout: 120000 }, async (t) => {
  const work = mkdtempSync(join(tmpdir(), 'container-'))
  try {
    const dir = await bridgehead(work)
    const { exec, commit, repo } = context(dir, work)
    // a container of that name in the way: its container is not made
    const name = replica(exec).name
    const { image } = imageOf(process.execPath)
    t.ok(docker('create', '--name', name, image).ok, 'a container of its name there already')
    try {
      await t.exception(create(exec), /its container was not made: haicc-swarm-1-node-1-/, 'create: its container is not made')
      await commit()
      t.absent(existsSync(join(work, 'containers', 'swarm-1', 'node-1')), 'its folder not left')
      t.is(await repo.find('/main/container/.node.json'), null, 'nothing recorded')
    } finally { docker('rm', '-f', name) }
  } finally { rmSync(work, { recursive: true, force: true }) }
})
