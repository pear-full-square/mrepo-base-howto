// The workbench deployed on a fresh install: the boot mrepo put in place
// from the sources (the boot component, run on the Bare running this
// test), then `boot/deploy workbench haiccing/base-solution-workbench` at
// the root: the workbench mrepo at local/workbench, the deploy answering
// with its script, unasked, for the root's own position. In the workbench:
// its registry and its howtos namespace; an mrepo deployed below it, its
// unique URI the path below it, placed and registered by it; torn down
// through the registry by the how-to's key. The script itself run, the
// docs mrepo, the host and Splectral in service: the `haicc` command's end
// to end (base-linux-haicc, test/splectral.sh). Nothing left running.
// The sources: SOURCES, else ../../sources beside the packages; skipped without.
import test from '../../modules/node_modules/brittle/index.js'
import process from '../../modules/node_modules/bare-process/index.js'
import { spawnSync } from '../../modules/node_modules/bare-subprocess/index.js'
import fs, { mkdtempSync, rmSync, writeFileSync, readFileSync, existsSync } from '../../modules/node_modules/bare-fs/index.js'
import { join, dirname, resolve } from '../../modules/node_modules/bare-path/index.js'
import os, { tmpdir } from '../../modules/node_modules/bare-os/index.js'
import { fileURLToPath } from '../../modules/node_modules/bare-url/index.js'
import { openRepo, p2pgitBackend } from '../../modules/pear-full-square/mycelium-git/index.js'
import { record, wrap, guid } from '../../modules/pear-full-square/mrepo-base-request/index.js'
import { ask, gitdirOf, viewOf } from '../../modules/pear-full-square/mrepo-base-runtime/index.js'

const pkg = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const wait = ms => new Promise(resolve => setTimeout(resolve, ms))
const alive = pid => spawnSync('kill', ['-0', String(pid)], { stdio: 'ignore' }).status === 0
const SOURCES = resolve(process.env.SOURCES || join(pkg, '..', '..', 'sources'))
const have = ['base-component-boot', 'base-solution-workbench', 'base-package-runtime'].every(p => existsSync(join(SOURCES, 'haiccing', `${p}.bundle`)))
const HOWTO = 'haiccing/base-solution-workbench/howto/install'

test('the workbench on a fresh install: deployed by its segment, its script answered for the root; its howtos namespace, an mrepo below it by its path', { timeout: 240000, skip: !have }, async (t) => {
  const work = mkdtempSync(join(tmpdir(), 'workbench-'))
  const pids = []
  try {
    const r = spawnSync(os.execPath(), [join(SOURCES, 'haiccing', 'base-component-boot.bundle'), `--work=${work}`, `--sources=folder:${SOURCES}`], { stdio: ['ignore', 'pipe', 'pipe'] })
    t.is(r.status, 0, `the boot mrepo put in place ${r.stderr.toString()}`)
    const boot = viewOf(work, 'boot')
    const s = await ask({ repo: boot, op: 'status' })
    pids.push(s.pid)
    const repo = openRepo(p2pgitBackend(gitdirOf(work, 'boot'), { fs }))
    // a command as typed, its parts, into the boot mrepo's inbox folder; its
    // completed form read from request/done
    const typed = async (parts, tries = 600) => {
      const c = record('/test', parts, guid())
      writeFileSync(join(boot, 'inbox', `${c.key}.json`), JSON.stringify(wrap('/local/boot/inbox', c)))
      let v = null
      for (let i = 0; i < tries && !v; i++) { v = await repo.read(`/request/done/${c.key}.json`).then(b => JSON.parse(b.toString()).value.value, () => null); if (!v) await wait(100) }
      return v
    }
    // the workbench: one command at the root, its name the segment
    const d = await typed(['boot/deploy', 'workbench', 'haiccing/base-solution-workbench'])
    t.alike([d?.error, d?.output?.deployed, d?.output?.mrepo, d?.output?.solution], [undefined, 'workbench', 'local/workbench', 'solution'], `deployed at workbench, local/workbench, a solution ${d?.error ?? ''}`)
    t.alike(d?.continuation, { at: '.', script: readFileSync(join(pkg, 'scripts', 'solution.haicc'), 'utf8') }, 'answered with its script, unasked, for the root\'s own position: what it deploys lands beside it')
    const bench = viewOf(work, 'local/workbench')
    const w = await ask({ repo: bench, op: 'status' })
    pids.push(w?.pid)
    t.alike(w?.repository?.uri, 'local/workbench', 'its runtime running, placed by its unique URI: <work>/mrepos/local/workbench')
    // its boot hooks: its registry, its howtos namespace
    const wrepo = openRepo(p2pgitBackend(join(bench, '.git'), { fs }))
    let howtos = null
    for (let i = 0; i < 300 && !howtos; i++) { howtos = await wrepo.read('/main/howtos/.node.json').then(b => JSON.parse(b.toString()), () => null); if (!howtos) await wait(100) }
    t.alike(howtos, { kind: 'howtos' }, 'its main: the node howtos, a namespace\'s root')
    t.ok(await wrepo.read('/main/registry/.node.json').then(() => true, () => false), 'its main: the node registry, its own mrepo registry')
    // an mrepo below its howtos node, by a how-to's key: deployed by the workbench
    const made = await typed(['haicc', 'workbench', 'crud/create', `howtos/${HOWTO}`])
    t.absent(made?.error, `the how-to's nodes below howtos ${made?.error ?? ''}`)
    const h = await typed(['haicc', 'workbench', 'boot/deploy', `howtos/${HOWTO}/boot`, 'haiccing/base-package-runtime'])
    t.alike([h?.error, h?.output?.mrepo], [undefined, `${HOWTO}/boot`], `its unique URI: the path below howtos, the how-to's key then its name ${h?.error ?? ''}`)
    const placed = join(work, 'mrepos', ...HOWTO.split('/'), 'boot')
    const hs = await ask({ repo: placed, op: 'status' })
    pids.push(hs?.pid)
    t.alike(hs?.repository?.uri, `${HOWTO}/boot`, 'placed by it, <work>/mrepos/<its path>, its runtime running, knowing its unique URI')
    t.is(JSON.parse((await wrepo.read(`/main/registry/${HOWTO}/boot/.node.json`)).toString()).at, `howtos/${HOWTO}/boot`, 'in the workbench\'s registry by its path')
    // torn down through the registry by the how-to's key
    const down = await typed(['haicc', 'workbench', 'boot/teardown', `registry/${HOWTO}/*`])
    t.alike(down?.output, [{ tornDown: `howtos/${HOWTO}/boot` }], `a how-to's mrepos torn down by its key ${down?.error ?? ''}`)
    t.absent(existsSync(placed), 'its folder gone')
    const gone = await typed(['boot/teardown', 'workbench'])
    t.alike(gone?.output, { tornDown: 'workbench' }, `the workbench torn down as any mrepo ${gone?.error ?? ''}`)
    t.ok((await ask({ repo: boot, op: 'stop' }))?.stopping, 'the boot mrepo stopped')
    for (let i = 0; i < 100 && pids.some(p => p && alive(p)); i++) await wait(100)
    t.absent(pids.some(p => p && alive(p)), 'nothing left running')
  } finally {
    for (const p of pids) if (p && alive(p)) spawnSync('kill', [String(p)])
    rmSync(work, { recursive: true, force: true })
  }
})
