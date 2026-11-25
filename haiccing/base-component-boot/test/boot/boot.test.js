// The boot, as the component runs it: bare run.js --work=<folder> (test/boot/run.js
// its entry). The boot mrepo built, its packages put in place, its request
// handed over, its runtime started (from its own packages/). Nothing is
// deployed by it: the host is deployed by a command, and from there on
// everything is a command sent to the boot mrepo's inbox.
// The sources: SOURCES, else ../../sources beside the packages (their
// bundles in it); what needs them skipped without.
// Everything from the package's own modules/.
import test from '../../modules/node_modules/brittle/index.js'
import process from '../../modules/node_modules/bare-process/index.js'
import { spawn, spawnSync } from '../../modules/node_modules/bare-subprocess/index.js'
import fs, { mkdtempSync, rmSync, writeFileSync, readFileSync, existsSync, statSync } from '../../modules/node_modules/bare-fs/index.js'
import { join, dirname, resolve } from '../../modules/node_modules/bare-path/index.js'
import os, { tmpdir } from '../../modules/node_modules/bare-os/index.js'
import { fileURLToPath } from '../../modules/node_modules/bare-url/index.js'
import { openRepo, p2pgitBackend } from '../../modules/pear-full-square/mycelium-git/index.js'
import { record, drop, nameOf, layer, follow } from '../../modules/pear-full-square/mrepo-base-request/index.js'
import { ask, gitdirOf, viewOf } from '../../modules/pear-full-square/mrepo-base-runtime/index.js'

const pkg = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const wait = ms => new Promise(resolve => setTimeout(resolve, ms))
// What a start of the boot adds to the requests done: the boot's own, then
// its runtime's as it starts.
// (sorted: the boot's request; the protocol protocol opened by the runtime, its own; the boot hook file's lines through the inbox, at main)
const STARTS = ['boot deploy boot', 'info extract main/.', 'protocol activate .', 'protocol activate main/.', 'protocol activate main/.', 'protocol activate main/.', 'protocol activate main/.', 'protocol activate main/.', 'protocol activate main/.', 'protocol activate main/.']
const alive = pid => spawnSync('kill', ['-0', String(pid)], { stdio: 'ignore' }).status === 0
const SOURCES = resolve(process.env.SOURCES || join(pkg, '..', '..', 'sources'))
const have = ['base-package-runtime', 'base-package-info', 'base-package-help', 'base-package-haici', 'base-package-protocol', 'base-package-boot', 'base-package-service', 'base-package-haicc', 'base-component-boot', 'base-component-haicc'].every(p => existsSync(join(SOURCES, 'haiccing', `${p}.bundle`)))

// A run of the boot, on the Bare running this test: its exit code and what
// it printed (one record a line).
function boot (work, extra) {
  const r = spawnSync(os.execPath(), [join(pkg, 'run.js'), `--work=${work}`, ...extra], { stdio: ['ignore', 'pipe', 'pipe'] })
  return { code: r.status, lines: r.stdout.toString().split('\n').filter(Boolean).map(l => JSON.parse(l)), err: r.stderr.toString() }
}
test('the sources missing: the boot says so, its request printed, exit 1', async (t) => {
  const work = mkdtempSync(join(tmpdir(), 'boot-pre-'))
  try {
    const r = boot(work, ['--sources=folder:/nowhere/at/all'])
    t.is(r.code, 1, 'exit 1')
    const form = r.lines.at(-1).value
    t.alike([form.protocol, form.action, form.uri], ['boot', 'deploy', ['boot']], 'its request printed: boot deploy boot')
    t.ok(form.command.includes('--sources=folder:/nowhere/at/all'), 'the command as typed')
    t.ok(form.error, `completed with the error: ${form.error}`)
    t.is(await ask({ repo: viewOf(work, 'boot'), op: 'status' }), null, 'no runtime started')
  } finally { rmSync(work, { recursive: true, force: true }) }
})

test('the boot: put in place, its runtime started, nothing deployed; the host deployed, redeployed, torn down, deployed again by commands; haicc; run again', { timeout: 240000, skip: !have }, async (t) => {
  const work = mkdtempSync(join(tmpdir(), 'boot-'))
  try {
    const r = boot(work, [`--sources=folder:${SOURCES}`])
    t.is(r.code, 0, `done ${r.err}`)
    const out = r.lines.find(l => l.value).value.output
    const logged = r.lines.find(l => l.value).value.log
    const started = r.lines.at(-1).runtime
    t.is(started?.repository, 'boot', 'its runtime started by the boot (its status printed last)')
    t.alike(logged.map(e => [e.level, e.event]), [['info', 'built'], ['info', 'packages']], 'its steps logged in its request, with their level')
    t.absent(existsSync(join(work, 'bare')), 'no Bare put in place: the one running it is used')
    t.ok(existsSync(join(work, 'mrepos')) && existsSync(join(work, 'scripts')), 'the work folder sorted: mrepos/, the install\'s registry, and scripts/')

    // the packages: in the store once, hard linked into the boot mrepo
    const store = join(work, 'packages', 'haiccing', 'base-package-runtime.bundle')
    const mine = join(viewOf(work, 'boot'), 'packages', 'haiccing', 'base-package-runtime.bundle')
    t.ok(existsSync(store) && existsSync(mine), 'the runtime\'s bundle: in the store, in the boot mrepo')
    t.is(statSync(store).ino, statSync(mine).ino, 'hard linked: one file')
    const repo = openRepo(p2pgitBackend(gitdirOf(work, 'boot'), { fs }))
    const listed = JSON.parse((await repo.read('/packages/manifest.json')).toString()).packages
    t.alike(Object.keys(listed), ['haiccing/base-package-runtime', 'haiccing/base-package-info', 'haiccing/base-package-help', 'haiccing/base-package-haici', 'haiccing/base-package-protocol', 'haiccing/base-package-boot', 'haiccing/base-package-haicc', 'haiccing/base-package-crud', 'haiccing/base-component-boot'], 'the packages layer: the component\'s list (the runtime, the info protocol, the help protocol, the haici protocol, the protocol protocol, the boot protocol, the haicc protocol, the crud protocol, the component itself last)')
    t.alike(logged[1].packages, Object.keys(listed), 'logged at info by name (the hashes at verbose)')
    t.absent((await repo.select('/packages/haiccing')).length, 'not the bytes')
    // the runtime: from the boot mrepo's own packages, on the Bare that ran the boot
    t.is(out.runtime, `${os.execPath()} ${mine} ${viewOf(work, 'boot')}`, 'its command recorded')
    const s = await ask({ repo: viewOf(work, 'boot'), op: 'status' })
    t.alike(s?.repository, { name: 'boot', uri: 'local/boot', storage: 'filesystem', id: null, key: null }, 'running the boot mrepo, its unique URI local/boot')
    const child = { pid: s.pid }
    // a command as typed, its parts, into the boot mrepo's inbox folder; its
    // completed form read from request/done
    const typed = async (parts, tries = 300) => {
      const c = nameOf(drop(viewOf(work, 'boot'), 'local/boot', record('/test', parts)))
      let v = null
      for (let i = 0; i < tries && !v; i++) { v = await layer({ repo: repo }, 'request/done').read(c).then(r => r.value.value, () => null); if (!v) await wait(100) }
      return v
    }
    // nothing deployed by the boot: no host, nothing pending
    const host = viewOf(work, 'local/host')
    t.absent(existsSync(host), 'nothing deployed by the boot: no host yet')
    // the host deployed by a command at the root, the name joined to the
    // position: boot/deploy /host (the runtime the target)
    const first = await typed(['boot/deploy', 'host', 'haiccing/base-package-runtime'])
    t.alike([first?.error, first?.uri, first?.output?.deployed, first?.output?.mrepo], [undefined, ['main', 'host'], 'host', 'local/host'], `boot/deploy host: in the form its URI the prefix main and what was written, in its output as written: done ${first?.error ?? ''}`)
    const h = await ask({ repo: host, op: 'status' })
    t.is(h?.repository.name, 'host', 'the host deployed, placed by its unique URI beside the boot mrepo (mrepos/local/host), its runtime running')
    t.is(statSync(join(host, 'packages', 'haiccing', 'base-package-runtime.bundle')).ino, statSync(store).ino, 'its runtime linked from the store')
    // (its link written first, its record completed when the action ends)
    const linkOf = async () => { const l = await repo.read('/main/host/.shortcuts.json').then(b => JSON.parse(b.toString())[0], () => null); return l ? repo.read(`/links/${l.link}.json`).then(b => JSON.parse(b.toString()), () => null) : null }
    let node = null
    for (let i = 0; i < 100 && !node?.runtime; i++) { node = await linkOf(); if (!node?.runtime) await wait(100) }
    t.alike([node.package, node.packages], ['haiccing/base-package-runtime', ['haiccing/base-package-info', 'haiccing/base-package-help', 'haiccing/base-package-protocol', 'haiccing/base-package-service', 'haiccing/base-package-runtime']], 'what is local to this machine about it, its link\'s record: the package it was deployed from, the packages placed')
    const [shortcut] = JSON.parse((await repo.read('/main/host/.shortcuts.json')).toString())
    t.alike([shortcut.mrepo, shortcut.link, Object.keys(shortcut)], ['local/host', node.key, ['mrepo', 'link']], 'its shortcut, in main: the mrepo linked there by its unique URI, and its link\'s key: what is needed to show it')
    t.alike([node.key, node.uri, node.at, node.how, node.runtime?.pid], [shortcut.link, 'local/host', 'host', 'deployed', h.pid], 'its link\'s record, in the links layer by that key: which mrepo, where, how, its runtime')
    t.absent(await repo.find('/main/registry/.node.json'), 'no registry in main: the install\'s is mrepos/')
    t.alike(JSON.parse((await repo.read('/main/host/.node.json')).toString()), {}, 'its node, in main beside it')
    t.is(h?.repository.uri, 'local/host', 'the host knows its own unique URI')
    // (moved to request/done on the runtime's next pass)
    let history = []
    const backend = p2pgitBackend(gitdirOf(work, 'boot'), { fs })
    for (let i = 0; i < 300 && history.length < 11; i++) {
      history = []
      // (request/done's natural order, its offsets': when each arrived. Not
      // when each was done: that order is a race between a request and the
      // hook lines it sets off)
      const done = []
      for (const n of await layer({ repo, backend }, 'request/done').arrived()) done.push(await layer({ repo }, 'request/done').read(n))
      history = done.map(r => r.value.value)
      if (history.length < 11) await wait(100)
    }
    // (what is causal is asserted in order: the mrepo's own requests, one
    // after the other; the first command comes from outside while they run:
    // where it arrives among them is not said, only that it is after the deploy)
    const told = history.map(f => `${f.protocol} ${f.action} ${Array.isArray(f.uri) ? f.uri.join("/") : f.uri} ${(f.args ?? []).join(' ')}`.trim())
    const FIRST = 'boot deploy main/host haiccing/base-package-runtime'
    t.alike(told.filter(c => c !== FIRST), ['boot deploy boot', 'protocol activate . protocol', 'protocol activate main/. boot', 'protocol activate main/. crud', 'protocol activate main/. haicc', 'protocol activate main/. haici', 'protocol activate main/. help', 'protocol activate main/. info', 'protocol activate main/. runtime', 'info extract main/.'], 'the history, in the order it arrived: the boot\'s deploy, the protocol protocol opened by the runtime, then its boot hook file a line a request (its protocols activated, its info extracted)')
    t.ok(told.indexOf(FIRST) > 0 && told.filter(c => c === FIRST).length === 1, 'and the first command, once, after the boot\'s deploy')
    t.alike(await layer({ repo }, 'inbox').list().then(r => r.length, () => 0), 1, 'through the inbox: only the command; the boot hook file\'s lines are the mrepo\'s own, internal')
    t.ok(history.slice(1, 10).every(f => !f.error), `its hooks done without an error ${history.slice(1, 10).map(f => f.error).filter(Boolean).join('; ')}`)
    t.alike((await repo.select('/protocols/*')).map(([p]) => p.slice(p.lastIndexOf('/') + 1)).filter(n => n !== '.layer.json').sort(), ['boot.json', 'crud.json', 'haicc.json', 'haici.json', 'help.json', 'info.json', 'protocol.json', 'runtime.json'], 'its active protocols, in its protocols layer: the boot\'s, crud, haicc, haici, help, info, the runtime\'s; the protocol protocol, opened by the runtime itself')
    const info = history.find(f => f.protocol === 'info' && f.action === 'extract')
    t.ok(info?.output?.keywords > 0 && info.output.pages > 0 && info.output.changed, `and its info: its pages by keywords ${JSON.stringify(info?.output ?? info?.error)}`)
    t.absent((await typed(['protocol/activate', '.', 'protocol']))?.error, 'the protocol protocol open from outside: the restrictions lifted for base')
    // followed: every record of the boot mrepo's request layers and its child's, one line each
    const lines = []
    const f = follow({ dir: viewOf(work, 'boot'), name: 'boot', print: l => lines.push(l) })
    await f.pass()
    f.stop()
    t.ok(lines.every(l => !l.includes('\n') && JSON.parse(l).offset), 'one compact record a line')
    const topics = lines.map(l => JSON.parse(l).topic)
    t.ok(topics.includes('/boot/request/done'), 'the boot mrepo\'s, its topic the full path')
    t.ok(topics.every(x => x.startsWith('/boot/')), 'from the root')
    // redeploy, sent to the running boot mrepo through its inbox folder: the
    // host's runtime stopped, the host rebuilt, its runtime started again
    const core = nameOf(drop(viewOf(work, 'boot'), 'local/boot', record('/test', { protocol: 'boot', action: 'redeploy', uri: 'host' })))
    let redone = null
    for (let i = 0; i < 300 && !redone; i++) { redone = await layer({ repo: repo }, 'request/done').read(core).then(r => r.value.value, () => null); if (!redone) await wait(100) }
    t.ok(redone, 'boot redeploy /host: done')
    t.absent(redone?.error, `without an error ${redone?.error ?? ''}`)
    t.alike([redone?.output.tornDown, redone?.output.deployed, redone?.output.package], ['host', 'host', 'haiccing/base-package-runtime'], 'torn down and deployed again, its type as recorded')
    const tornDown = redone?.log?.find(e => e.event === 'boot.redeploy.torn down')
    t.is(tornDown?.runtime?.pid, h.pid, `the old runtime stopped, how logged: ${tornDown?.runtime?.how}`)
    t.alike(redone?.log?.filter(e => e.level === 'info' && e.event !== 'request.changed').map(e => e.event), ['boot.redeploy.torn down', 'boot.redeploy.deployed', 'request.metrics'], 'its log at info: what it did, and its metrics')
    t.alike(Object.fromEntries(redone?.log?.filter(e => e.event === 'request.changed').map(e => [e.target, e.changed]) ?? []), { links: [`${node.key}.json`] }, 'its audit: what is local about the child changed (its runtime\'s process): its link\'s record; its shortcut and its node the same again, the link keeping its key: nothing said of them')
    t.absent(alive(h.pid), 'the old host runtime\'s process ended')
    const h2 = await ask({ repo: host, op: 'status' })
    t.ok(h2 && h2.pid !== h.pid, 'a new host runtime running')
    let node2 = null
    for (let i = 0; i < 100 && node2?.runtime?.pid !== h2?.pid; i++) { node2 = await linkOf(); if (node2?.runtime?.pid !== h2?.pid) await wait(100) }
    t.is(node2?.runtime?.pid, h2?.pid, 'what is local about it updated: its runtime\'s new process')

    // teardown, then deploy again, each a request to the running boot mrepo
    // (the child the runtime package alone)
    const sent = async (form, tries = 300) => {
      const c = nameOf(drop(viewOf(work, 'boot'), 'local/boot', record('/test', { protocol: 'boot', ...form })))
      let v = null
      for (let i = 0; i < tries && !v; i++) { v = await layer({ repo: repo }, 'request/done').read(c).then(r => r.value.value, () => null); if (!v) await wait(100) }
      return v
    }
    const down = await sent({ action: 'teardown', uri: 'host' })
    t.alike([down?.error, down?.output], [undefined, { tornDown: 'host' }], 'boot teardown host: done')
    t.absent(alive(h2.pid), 'the host\'s runtime ended')
    t.absent(existsSync(host), 'its folder removed')
    let gone = false
    for (let i = 0; i < 100 && !gone; i++) { gone = (await repo.read('/main/host/.shortcuts.json').catch(() => null)) === null; if (!gone) await wait(100) }
    t.ok(gone, 'its shortcut out of main')
    const up = await sent({ action: 'deploy', uri: 'host', args: ['haiccing/base-package-runtime'] })
    t.absent(up?.error, `boot deploy /host again: done ${up?.error ?? ''}`)
    const h3 = await ask({ repo: host, op: 'status' })
    t.ok(h3 && h3.pid !== h2.pid, 'the host back, a new runtime running')

    // haicc: go to a node position and execute the command that follows. A
    // command as typed, its parts; at a shortcut it is sent on to the mrepo
    // linked there, unchanged; the request waits, the response its result
    const far = await typed(['haicc', 'host', 'info/get'])
    t.alike([far?.error, far?.protocol, far?.action, far?.uri, far?.args], [undefined, 'haicc', 'goto', ['main', 'host'], ['info/get']], `haicc host info/get: haicc alone is haicc/goto, what follows its arguments ${far?.error ?? ''}`)
    t.alike([far?.output?.keyword, far?.remote?.at, far?.remote?.folder, typeof far?.remote?.offset], ['.', 'host', '../local/host', 'number'], 'answered by the host: host is a shortcut, the command sent on to the mrepo linked there')
    const hostRepo = openRepo(p2pgitBackend(join(host, '.git'), { fs }))
    // (what it waits for: the child's offset, at the host)
    const passed = await layer({ repo: hostRepo }, 'request/done').read(nameOf(far?.remote?.offset)).then(r => r.value, () => null)
    t.alike([/^\/local\/boot\/execute\/\d{13}$/.test(passed?.topic ?? ''), passed?.value?.command, passed?.value?.protocol, passed?.value?.uri], [true, ['info/get'], 'info', ['main', '.']], 'in the host: the command that followed, unchanged (the hop taken off, nothing rewritten), addressed back to the waiting request\'s branch')
    let kept = null // moved to done right after its principal, in the same pass
    // (here under an offset of its own, given as it came in; the host's on its core)
    const responseIn = async l => { for (const n of (await layer({ repo }, l).list()).reverse()) { const r = await layer({ repo }, l).read(n); if (r.value?.offset === far?.remote?.offset && String(r.value?.topic).startsWith('/local/boot/execute/')) return r } return null }
    for (let i = 0; i < 50 && !kept; i++) { kept = (await responseIn('request/done'))?.value ?? null; if (!kept) await wait(100) }
    t.alike([kept?.value?.uri, kept?.value?.output?.keyword, 'output' in (kept?.value ?? {})], [['main', '.'], '.', true], 'the host\'s response, merged in with its principal: kept in done')
    t.absent(await responseIn('outbox'), 'and not sent on')
    const near = await typed(['haicc', '.', 'info/get'])
    t.alike([near?.error, near?.remote], [undefined, undefined], `haicc . info/get: the root, executed here ${near?.error ?? ''}`)
    const packagesOf = async parts => (await typed(parts))?.output?.choices?.[0]?.below.map(b => b.keyword) ?? []
    t.alike([far?.output?.choices?.[0]?.title, far?.output?.choices?.[0]?.below.some(b => b.keyword === 'haiccing'), (await packagesOf(['haicc', 'host', 'info/get', 'haiccing'])).includes('haiccing/base-package-boot')], ['base-package-runtime', true, false], 'the host\'s own top page, its organisation; its packages: no boot protocol')
    t.alike([near?.output?.choices?.[0]?.title, (await packagesOf(['info/get', 'haiccing'])).includes('haiccing/base-package-boot')], ['base-component-boot', true], 'the boot mrepo\'s own: its component, the boot protocol among its packages, in full form')
    t.alike((await p2pgitBackend(gitdirOf(work, 'boot'), { fs }).listBranches()).map(([b]) => b).filter(b => b.startsWith('execute/')), [], 'no request branch left: the principal\'s removed once it was returned')
    t.is((await typed(['haicc', 'host/packages', 'info/get']))?.error, 'no action: haicc (haicc has no default action)', 'a URI running through a shortcut: sent on, what is left of it a haicc there (which this host does not link)')
    t.is((await typed(['haicc', 'nowhere', 'info/get']))?.error, 'haicc nowhere: no node there', 'a position that is not there: said')
    t.is((await typed(['haicc', 'host', 'haicc', '.', 'info/get']))?.error, 'no action: haicc (haicc has no default action)', 'chained: the second haicc is the host\'s to execute, and this host does not link the haicc protocol: its error returned')
    t.is((await typed(['boot/deploy', 'host', 'haiccing/base-package-runtime']))?.output?.again, true, 'a plain command at the root, the name read from where it stands: main/host (deployed already: a repeat)')
    // the runtime protocol, built in: a linked package's tests, through its
    // dispatcher; a dry run says what would run, a run returns the results
    const dry = await sent({ protocol: 'runtime', action: 'run', uri: '.', args: ['packages/haiccing/base-package-runtime/test/full', 'dry-run'] })
    const runs = dry?.output?.runs ?? []
    t.ok(!dry?.error && runs.slice(0, 5).join() === '/test/start,/test/info,/test/code,/test/mrepo,/test/package' && runs.length > 5 && runs.slice(5).every(u => u.startsWith('/test/modules/')), `runtime run, a dry run: what test/full would run, nothing run ${JSON.stringify(dry?.output ?? dry?.error)}`)
    const ran = await sent({ protocol: 'runtime', action: 'run', uri: '.', args: ['packages/haiccing/base-package-runtime/test/validate'] }, 1200)
    t.absent(ran?.error, `runtime run test/validate: done ${ran?.error ?? ''}`)
    t.alike([ran?.output?.ok, ran?.output?.units?.map(u => u.unit)], [true, ['/test/start', '/test/info', '/test/code', '/test/mrepo', '/test/package']], 'its result: the start test, its info, its code, its mrepo side and its structure passed, in a floating instance')
    t.ok(ran?.log?.some(e => e.event === 'runtime.run.unit' && e.unit === '/test/start' && e.ok), 'a summary logged, a line a unit')
    // its info, extracted by its runtime as it started: read by keywords
    const root = await sent({ protocol: 'info', action: 'get', uri: '.' })
    t.alike([root?.error, root?.output?.choices?.[0]?.title], [undefined, 'base-component-boot'], `info get: the mrepo's top page, its own component's README ${root?.error ?? ''}`)
    t.alike(['haiccing', 'modules', 'third-party'].map(k => root?.output?.choices?.[0]?.below.some(b => b.keyword === k)), [true, true, true], 'its keywords: its organisation; the pages made here')
    const org = await sent({ protocol: 'info', action: 'get', uri: 'haiccing' })
    t.alike(['runtime', 'info', 'protocol', 'boot', 'haicc', 'crud'].map(k => org?.output?.choices?.[0]?.below.some(b => b.keyword === `haiccing/base-package-${k}`)), [true, true, true, true, true, true], 'below it each package it includes, by its name fully qualified')
    const tb = await sent({ protocol: 'info', action: 'get', uri: 'haiccing/base-component-boot/test/boot' })
    t.ok(!tb?.error && tb?.output?.choices?.[0]?.title === 'boot/' && tb.output.choices[0].page, `info get haiccing/base-component-boot/test/boot, this very test: its page ${tb?.error ?? ''}`)
    const hostInfo = await openRepo(p2pgitBackend(join(host, '.git'), { fs })).read('/info/index.json').then(b => JSON.parse(b.toString()), () => null)
    t.is(hostInfo?.['.']?.[0]?.page, 'packages/haiccing/base-package-runtime/README.md', 'the host\'s info: extracted by its own runtime, from its own packages')
    // each package checks, in situ, what this mrepo's runtime made of its info
    for (const p of ['base-component-boot', 'base-package-boot', 'base-package-runtime', 'base-package-info', 'base-package-protocol', 'base-package-haicc']) {
      const v = await sent({ protocol: 'runtime', action: 'run', uri: '.', args: [`packages/haiccing/${p}/test/validate-in-situ`] }, 1200)
      t.alike([v?.error, v?.output?.ok, v?.output?.units?.map(u => [u.unit, u.asserts.passed > 0 && u.asserts.passed === u.asserts.total])], [undefined, true, [['/test/info-in-situ', true], ['/test/mrepo-in-situ', true]]], `${p}: validate-in-situ, its info and itself as this mrepo holds it ${v?.error ?? JSON.stringify(v?.output?.units?.map(u => u.failures) ?? '')}`)
    }
    // an mrepo with a service, deployed from the service package: its
    // external API gated by its state, its protocols recorded
    const svcUp = await sent({ action: 'deploy', uri: 'svc', args: ['haiccing/base-package-service'] }, 600)
    t.absent(svcUp?.error, `boot deploy svc from the service package ${svcUp?.error ?? ''}`)
    const svc = viewOf(work, 'local/svc')
    const svcRepo = openRepo(p2pgitBackend(join(svc, '.git'), { fs }))
    const toSvc = async (form, tries = 600) => {
      const c = nameOf(drop(svc, 'local/svc', record('/test', form)))
      let v = null
      for (let i = 0; i < tries && !v; i++) { v = await layer({ repo: svcRepo }, 'outbox').read(c).then(r => r.value.value, () => null); if (!v) await wait(100) }
      return v
    }
    const svcReq = (protocol, action, uri, args) => toSvc({ protocol, action, uri, ...(args ? { args } : {}) })
    t.is((await svcReq('info', 'get', '.'))?.error, 'no info extracted in this mrepo yet (info/extract)', 'booted: info active from boot, not behind the door; nothing extracted yet: that is its initialise hook')
    t.is(JSON.parse((await svcRepo.read('/runtime/service.json')).toString()).state, 'booted', 'its state, from the service package\'s structure')
    t.alike((await svcRepo.select('/protocols/*')).map(([p]) => p.slice(p.lastIndexOf('/') + 1)).filter(n => n !== '.layer.json').sort(), ['help.json', 'info.json', 'protocol.json', 'runtime.json', 'service.json'], 'its active protocols, by its boot hooks: the runtime\'s, help, info, service')
    t.is((await svcReq('service', 'start', '.'))?.error, 'not now: service start (the service is booted)', 'the service\'s own actions: each in its state')
    const svcInit = await svcReq('service', 'initialise', '.')
    t.alike(svcInit?.output, { service: 'initialised', state: 'initialised' })
    t.alike(svcInit?.log?.filter(e => e.event === 'service.initialise.hooks').map(e => [e.transition, e.ran]), [['initialise', ['info/extract']]], 'its initialise hook file: its lines run first, each its own request; the request resumed after them, logged')
    t.is((await svcReq('info', 'get', '.'))?.output?.choices?.[0]?.title, 'base-package-service', 'initialised: its info extracted by the hook, its top page answered')
    t.alike((await svcReq('service', 'start', '.'))?.output, { service: 'started', state: 'started' })
    t.is((await svcReq('crud', 'read', '.'))?.error, 'no protocol: crud (help, info, protocol, runtime, service)', 'a protocol it does not link: said, with the active ones')
    t.is((await svcReq('service', 'start', 'host'))?.error, 'not offered: service start at host', 'an action, only at the URIs its config names')
    const svcSitu = await svcReq('runtime', 'run', '.', ['packages/haiccing/base-package-service/test/validate-in-situ'])
    t.alike([svcSitu?.error, svcSitu?.output?.ok, svcSitu?.output?.units?.map(u => u.unit)], [undefined, true, ['/test/info-in-situ', '/test/mrepo-in-situ']], `the service package validated in situ, in the mrepo it serves ${svcSitu?.error ?? JSON.stringify(svcSitu?.output?.units?.map(u => u.failures) ?? '')}`)
    const svcDown = await sent({ action: 'teardown', uri: 'svc' })
    t.alike([svcDown?.error, svcDown?.output], [undefined, { tornDown: 'svc' }], 'torn down again')
    // the haicc component: the mrepo a host is managed with, deployed by a
    // command (the package named without its organisation: haiccing); service
    // managed, its boot protocol behind the door; a node deployed inside it,
    // commands chained through both shortcuts
    const comp = await typed(['boot/deploy', 'haicc', 'haiccing/base-component-haicc'], 900)
    t.alike([comp?.error, comp?.output?.package, comp?.output?.mrepo], [undefined, 'haiccing/base-component-haicc', 'local/haicc'], `boot/deploy haicc haiccing/base-component-haicc ${comp?.error ?? ''}`)
    const hc = viewOf(work, 'local/haicc')
    const hcRepo = openRepo(p2pgitBackend(join(hc, '.git'), { fs }))
    t.alike(JSON.parse((await hcRepo.read('/packages/.layer.json')).toString()).packages, comp?.output?.packages, 'its packages layer: the component\'s own list (laid in last)')
    t.alike((await hcRepo.select('/main/*')).map(([p]) => p), ['/main/.layer.json'], 'its main empty')
    t.alike([comp?.output?.commission, comp?.output?.service], ['done', 'started'], 'its commission done before the deploy answered: initialised, started')
    t.alike((await typed(['haicc', 'haicc', 'service/initialise']))?.output, { service: 'initialised', state: 'started', again: true }, 'haicc haicc service/initialise, passed through to it: a repeat, the state as it is')
    t.alike((await hcRepo.select('/protocols/*')).map(([p]) => p.slice(p.lastIndexOf('/') + 1)).filter(n => n !== '.layer.json').sort(), ['boot.json', 'container.json', 'crud.json', 'haicc.json', 'haici.json', 'help.json', 'info.json', 'protocol.json', 'runtime.json', 'service.json', 'swarm.json'], 'started: boot, container, crud and swarm activated by the start hooks, beside those active from boot')
    const nodeUp = await typed(['haicc', 'haicc', 'boot/deploy', 'node-1', 'haiccing/base-package-runtime'], 900)
    t.alike([nodeUp?.error, nodeUp?.output?.deployed, nodeUp?.output?.mrepo], [undefined, 'node-1', 'local/node-1'], `started: haicc haicc boot/deploy node-1, executed by the haicc mrepo ${nodeUp?.error ?? ''}`)
    const n1 = viewOf(work, 'local/node-1')
    t.ok((await ask({ repo: n1, op: 'status' }))?.pid, 'the node the haicc mrepo deployed, placed by its unique URI (mrepos/local/node-1), its runtime running')
    t.ok(await hcRepo.read('/main/node-1/.shortcuts.json').then(() => true, () => false), 'its shortcut in the haicc mrepo\'s main')
    t.is(await repo.read('/main/node-1/.shortcuts.json').catch(() => null), null, 'not in the boot mrepo\'s: each mrepo knows only its own shortcuts')
    const two = await typed(['haicc', 'haicc', 'haicc', 'node-1', 'info/get'])
    t.alike([two?.error, two?.output?.choices?.[0]?.title], [undefined, 'base-package-runtime'], `haicc haicc haicc node-1 info/get: chained through two shortcuts, answered by the node, its own top page ${two?.error ?? ''}`)
    const atRoot = await typed(['haicc', 'haicc', 'haicc', '.', 'info/get'])
    t.alike([atRoot?.error, atRoot?.output?.choices?.[0]?.title], [undefined, 'base-component-haicc'], `haicc haicc haicc . info/get: the second haicc at the haicc mrepo's root, executed there ${atRoot?.error ?? ''}`)
    const hcSitu = await typed(['haicc', 'haicc', 'runtime/run', '.', 'packages/haiccing/base-component-haicc/test/validate-in-situ'], 1200)
    t.alike([hcSitu?.error, hcSitu?.output?.ok, hcSitu?.output?.units?.map(u => u.unit)], [undefined, true, ['/test/info-in-situ', '/test/mrepo-in-situ']], `the component validated in situ, in the mrepo it makes ${hcSitu?.error ?? JSON.stringify(hcSitu?.output?.units?.map(u => u.failures) ?? '')}`)
    t.alike((await typed(['haicc', 'haicc', 'boot/teardown', 'node-1']))?.output, { tornDown: 'node-1' }, 'haicc haicc boot/teardown node-1')
    t.alike((await typed(['haicc', 'haicc', 'service/stop']))?.output, { service: 'stopped', state: 'initialised' }, 'haicc haicc service/stop')
    t.absent(await hcRepo.read('/protocols/boot.json').then(() => true, () => false), 'stopped: boot deactivated by the stop hook, out of its protocols layer')
    t.is((await typed(['haicc', 'haicc', 'boot/deploy', 'node-2', 'haiccing/base-package-runtime']))?.error, 'not now: boot deploy (boot is not active; the service is initialised)', 'the door closed again')
    t.alike((await typed(['haicc', '.', 'boot/teardown', 'haicc']))?.output, { tornDown: 'haicc' }, 'haicc . boot/teardown haicc: a command at the root about the shortcut as an item')
    t.absent(existsSync(hc), 'removed')
    const refused = await sent({ protocol: 'runtime', action: 'run', uri: '.', args: ['packages/haiccing/base-package-runtime/run'] })
    t.ok(/not run here/.test(refused?.error ?? ''), 'a package\'s program: not run in the runtime')

    for (const r of [viewOf(work, 'boot'), host]) t.ok((await ask({ repo: r, op: 'stop' }))?.stopping, `stopped: ${r.endsWith('host') ? 'the host' : 'the boot'}`)
    for (let i = 0; i < 100 && (alive(child.pid) || alive(h3.pid)); i++) await wait(100)
    t.absent(alive(child.pid) || alive(h3.pid), 'both processes ended')

    // run again: already built, the packages unchanged; its runtime started
    // again: only its own requests are added, nothing done before is repeated
    const doneNow = async () => {
      const out = {}
      for (const p of await layer({ repo }, 'request/done').list()) { const v = (await layer({ repo }, 'request/done').read(p)).value.value; out[p] = `${v.protocol} ${v.action} ${Array.isArray(v.uri) ? v.uri.join("/") : v.uri}` }
      return out
    }
    const before = await doneNow()
    const again = boot(work, [`--sources=folder:${SOURCES}`])
    t.is(again.code, 0)
    const o2 = again.lines.find(l => l.value).value.log
    t.ok(o2[0].already, 'already built')
    t.is(o2[1].committed, false, 'the packages unchanged: nothing committed')
    let added = []
    for (let i = 0; i < 100 && added.length < STARTS.length; i++) { const now = await doneNow(); added = Object.keys(now).filter(k => !(k in before)).map(k => now[k]).sort(); if (added.length < STARTS.length) await wait(100) }
    await wait(1000) // nothing more follows
    const after = await doneNow()
    t.alike(Object.keys(after).filter(k => !(k in before)).map(k => after[k]).sort(), STARTS, 'its runtime again: the boot\'s own request and its runtime\'s as it starts, nothing else repeated')
    t.ok(await ask({ repo: host, op: 'status' }) === null, 'the host not redeployed, nor started (its runtime stopped above)')
    const s2 = await ask({ repo: viewOf(work, 'boot'), op: 'status' })
    t.ok((await ask({ repo: viewOf(work, 'boot'), op: 'stop' }))?.stopping, 'stopped again')
    for (let i = 0; i < 100 && alive(s2.pid); i++) await wait(100)
    t.absent(alive(s2.pid))
  } finally {
    // whatever happened: its runtimes stopped (the host's, the boot's), then its folder removed
    for (const r of [viewOf(work, 'local/node-1'), viewOf(work, 'local/haicc'), viewOf(work, 'local/host'), viewOf(work, 'boot')]) {
      const s = await ask({ repo: r, op: 'status' }).catch(() => null)
      if (s?.pid) { try { os.kill(s.pid, 'SIGTERM') } catch {} for (let i = 0; i < 50 && alive(s.pid); i++) await wait(100) }
    }
    rmSync(work, { recursive: true, force: true })
  }
})
