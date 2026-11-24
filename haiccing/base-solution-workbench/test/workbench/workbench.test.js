// The workbench deployed on a fresh install: the boot mrepo put in place
// from the sources (the boot component, run on the Bare running this
// test), then `boot/deploy workbench haiccing/base-solution-workbench` at
// the root: the workbench mrepo at local/workbench, the deploy answering
// once its commission is done: its components deployed below it (the docs
// mrepo, Splectral), each commissioned by its own, linked in it (the
// install's registry the work folder's mrepos/); then itself initialised
// (its info, its howtos namespace) and started. In the workbench: an mrepo
// deployed below its howtos node, its unique URI the path below it, placed
// by it in mrepos/, linked at its position; torn down there. The workbench torn down: its decommission
// tears its components down. Nothing left running. Splectral's pages, the
// docs read: the `haicc` command's end to end (base-linux-haicc,
// test/splectral.sh).
// The sources: SOURCES, else ../../sources beside the packages; skipped without.
import test from '../../modules/node_modules/brittle/index.js'
import process from '../../modules/node_modules/bare-process/index.js'
import { spawnSync } from '../../modules/node_modules/bare-subprocess/index.js'
import fs, { mkdtempSync, rmSync, writeFileSync, readFileSync, existsSync } from '../../modules/node_modules/bare-fs/index.js'
import { join, dirname, resolve } from '../../modules/node_modules/bare-path/index.js'
import os, { tmpdir } from '../../modules/node_modules/bare-os/index.js'
import { fileURLToPath } from '../../modules/node_modules/bare-url/index.js'
import { openRepo, p2pgitBackend } from '../../modules/pear-full-square/mycelium-git/index.js'
import { record, drop, nameOf, layer } from '../../modules/pear-full-square/mrepo-base-request/index.js'
import { ask, gitdirOf, viewOf } from '../../modules/pear-full-square/mrepo-base-runtime/index.js'

const pkg = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const wait = ms => new Promise(resolve => setTimeout(resolve, ms))
const alive = pid => spawnSync('kill', ['-0', String(pid)], { stdio: 'ignore' }).status === 0
const SOURCES = resolve(process.env.SOURCES || join(pkg, '..', '..', 'sources'))
const have = ['base-component-boot', 'base-solution-workbench', 'base-package-runtime'].every(p => existsSync(join(SOURCES, 'haiccing', `${p}.bundle`)))
const HOWTO = 'haiccing/base-solution-workbench/howto/install'

test('the workbench on a fresh install: deployed by its segment, commissioned (its components below it, then itself in service); its howtos namespace, an mrepo below it by its path; decommissioned with its teardown', { timeout: 600000, skip: !have }, async (t) => {
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
    const typed = async (parts, tries = 3000) => {
      const c = nameOf(drop(boot, 'local/boot', record('/test', parts)))
      let v = null
      for (let i = 0; i < tries && !v; i++) { v = await layer({ repo: repo }, 'request/done').read(c).then(r => r.value.value, () => null); if (!v) await wait(100) }
      return v
    }
    // the workbench: one command at the root, its name the segment
    const d = await typed(['boot/deploy', 'workbench', 'haiccing/base-solution-workbench'])
    t.alike([d?.error, d?.output?.deployed, d?.output?.mrepo, d?.output?.commission, d?.output?.service], [undefined, 'workbench', 'local/workbench', 'done', 'started'], `deployed at workbench, local/workbench; answered once its commission is done, in service ${d?.error ?? ''}`)
    t.absent(d?.continuation, 'no continuation: nothing runs at the root after it')
    const bench = viewOf(work, 'local/workbench')
    const w = await ask({ repo: bench, op: 'status' })
    pids.push(w?.pid)
    t.alike([w?.repository?.uri, w?.commission], ['local/workbench', { state: 'done' }], 'its runtime running, placed by its unique URI: <work>/mrepos/local/workbench; its commission done')
    const wrepo = openRepo(p2pgitBackend(join(bench, '.git'), { fs }))
    const doc = async p => wrepo.read(p).then(b => JSON.parse(b.toString()), () => null)
    t.alike(await doc('/main/howtos/.node.json'), { kind: 'howtos' }, 'its initialise: the node howtos, a namespace\'s root')
    t.alike((await doc('/runtime/service.json'))?.state, 'started', 'started')
    // its link's record, by the shortcut at a position: what the workbench knows of what it deployed
    const linkAt = async at => { const l = (await doc(`/main/${at}/.shortcuts.json`))?.[0]; return l ? doc(`/links/${l.link}.json`) : null }
    // its components: below it, linked in it, each in service by its own commission
    for (const [at, pkg] of [['docs', 'haiccing/base-component-docs'], ['splectral', 'haiccing/base-package-splectral']]) {
      const r = await linkAt(at)
      t.alike([r?.uri, r?.at, r?.package, r?.commission, r?.service], [`local/${at}`, at, pkg, 'done', 'started'], `${at}: deployed by its commission at workbench/${at}, linked there, in service`)
      const s2 = await ask({ repo: viewOf(work, `local/${at}`), op: 'status' })
      pids.push(s2?.pid)
      t.is(s2?.repository?.uri, `local/${at}`, `${at}: its unique URI local/${at}, its folder <work>/mrepos/local/${at}`)
    }
    t.absent(await repo.read('/main/docs/.shortcuts.json').then(() => true, () => false), 'not linked in the boot mrepo: the workbench\'s, forward visibility')
    t.absent(await doc('/main/registry/.node.json'), 'no registry in the workbench: the install\'s is mrepos/')
    // an mrepo below its howtos node, by a how-to's key: deployed by the workbench
    const made = await typed(['haicc', 'workbench', 'crud/create', `howtos/${HOWTO}`])
    t.absent(made?.error, `the how-to's nodes below howtos ${made?.error ?? ''}`)
    const h = await typed(['haicc', 'workbench', 'boot/deploy', `howtos/${HOWTO}/boot`, 'haiccing/base-package-runtime'])
    t.alike([h?.error, h?.output?.mrepo], [undefined, `${HOWTO}/boot`], `its unique URI: the path below howtos, the how-to's key then its name ${h?.error ?? ''}`)
    const placed = join(work, 'mrepos', ...HOWTO.split('/'), 'boot')
    const hs = await ask({ repo: placed, op: 'status' })
    pids.push(hs?.pid)
    t.alike(hs?.repository?.uri, `${HOWTO}/boot`, 'placed by it, <work>/mrepos/<its path>, its runtime running, knowing its unique URI')
    t.is((await linkAt(`howtos/${HOWTO}/boot`))?.uri, `${HOWTO}/boot`, 'linked in the workbench at its position')
    // torn down at its position
    const down = await typed(['haicc', 'workbench', 'boot/teardown', `howtos/${HOWTO}/boot`])
    t.alike(down?.output, { tornDown: `howtos/${HOWTO}/boot` }, `a how-to's mrepo torn down ${down?.error ?? ''}`)
    t.absent(existsSync(placed), 'its folder gone')
    const gone = await typed(['boot/teardown', 'workbench', '--flags', 'log=verbose'])
    t.alike(gone?.output, { tornDown: 'workbench' }, `the workbench torn down as any mrepo ${gone?.error ?? ''}`)
    t.ok(gone?.log?.some(e => /decommission$/.test(e.event) && e.decommission === 'done'), `its decommission first, a step of the teardown ${JSON.stringify(gone?.log?.map(e => e.event))}`)
    t.absent(existsSync(viewOf(work, 'local/docs')) || existsSync(viewOf(work, 'local/splectral')), 'its components torn down by its decommission: their folders gone')
    t.ok((await ask({ repo: boot, op: 'stop' }))?.stopping, 'the boot mrepo stopped')
    for (let i = 0; i < 100 && pids.some(p => p && alive(p)); i++) await wait(100)
    t.absent(pids.some(p => p && alive(p)), 'nothing left running')
  } finally {
    for (const p of pids) if (p && alive(p)) spawnSync('kill', [String(p)])
    rmSync(work, { recursive: true, force: true })
  }
})
