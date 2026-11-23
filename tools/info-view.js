// The haicc docs view: the docs mrepo's info, as an install has it, in one
// HTML page to browse by keywords: each click answers as
// `haicc docs info/get <keywords>` would, the command shown. A transient
// install: the haicc command installed in a temporary folder, the sources
// linked, the boot, the docs mrepo deployed (base-component-docs: its list
// and every package in the store, documented), its info layer read, all
// torn down and removed. What is installed is what is shown.
//   tools/bare tools/info-view.js [--sources=<folder>] [--out=<file>] [--keep]
// The sources: sources/ here (tools/release.js); the page written to
// sources/info-view.html by default. Its page template:
// tools/lib/info-view.html. --keep: the temporary folder left, running, its
// path printed.
import process from 'bare-process'
import fs, { readFileSync, writeFileSync, mkdtempSync, rmSync, existsSync } from 'bare-fs'
import { join, resolve, dirname } from 'bare-path'
import { tmpdir } from 'bare-os'
import { fileURLToPath } from 'bare-url'
import { spawnSync } from 'bare-subprocess'
import { openRepo, p2pgitBackend } from '../pear-full-square/mycelium-git/index.js'

const dev = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const args = process.argv.slice(2)
const flag = (n, d) => args.find(a => a.startsWith(`--${n}=`))?.slice(n.length + 3) ?? d
const sources = resolve(flag('sources', join(dev, 'sources')))
const out = resolve(flag('out', join(sources, 'info-view.html')))
const keep = args.includes('--keep')
const MREPO = 'docs'
const COMPONENT = 'base-component-docs'

const T = mkdtempSync(join(tmpdir(), 'info-view-'))
const home = join(T, 'home')
const env = { ...process.env, PATH: `${join(T, 'bin')}:${process.env.PATH}`, HAICC_TIMEOUT: '180' }
for (const v of ['HAICC_HOME', 'HAICC_WORK', 'HAICC_OUTPUT', 'HAICC_RAW']) delete env[v]
// a step of the install: its command, its output; failing, said and stopped
const run = (cmd, ...a) => {
  const r = spawnSync(cmd, a, { env, cwd: T })
  const text = `${r.stdout ?? ''}${r.stderr ?? ''}`.trim()
  if (r.status !== 0) throw new Error(`${[cmd, ...a].join(' ')}: exit ${r.status}\n${text}`)
  return text
}
const haicc = (...a) => run(join(T, 'bin', 'haicc'), ...a)

let result
let problems = []
try {
  run('sh', join(dev, 'haiccing', 'base-linux-haicc', 'haicc-install.sh'), `--home=${home}`, `--bin=${join(T, 'bin')}`)
  haicc('sources', 'link', sources)
  haicc('prereq')
  haicc('boot/deploy')
  haicc('--raw', '.', 'boot/deploy', MREPO, COMPONENT)
  // answered once its boot hooks have run: its info extracted
  haicc('--raw', MREPO, 'info/get')
  // its info layer, read from the deployed mrepo
  const dir = join(home, 'work', 'mrepos', 'local', MREPO)
  const repo = openRepo(p2pgitBackend(join(dir, '.git'), { fs }))
  const json = async p => JSON.parse((await repo.read(p)).toString())
  const index = await json('/info/index.json')
  problems = await json('/info/problems.json')
  const listed = await json('/info/packages.json')
  // each package's own index, its keywords written in its context, as
  // info/get asks them: one index to browse
  for (const pkg of Object.keys(listed)) {
    const own = await json(`/info/packages/${pkg}/index.json`)
    const full = k => (k === '.' ? pkg : `${pkg}/${k}`)
    for (const [k, choices] of Object.entries(own)) index[full(k)] = choices.map(c => ({ ...c, below: c.below.map(full) }))
  }
  const pages = {}
  for (const page of new Set(Object.values(index).flat().map(c => c.page))) pages[page] = (await repo.read(`/info/${page}`)).toString()
  const targets = [{ name: `haiccing/${COMPONENT}`, kind: 'mrepo', at: MREPO, index, problems }]
  const data = JSON.stringify({ made: new Date().toISOString(), targets, pages }).replace(/<\//g, '<\\/')
  const page = readFileSync(join(dev, 'tools', 'lib', 'info-view.html'), 'utf8').replace('/*DATA*/null', () => data)
  writeFileSync(out, page)
  result = { out, packages: Object.keys(listed).length, documented: Object.values(listed).filter(p => p.documented).length, keywords: Object.keys(index).length, pages: Object.keys(pages).length, bytes: page.length, problems: problems.length }
} finally {
  if (keep) console.log(`kept: ${T}`)
  else {
    // catch: the teardown said what failed; the folder goes all the same
    try { if (existsSync(join(T, 'bin', 'haicc'))) haicc('boot/teardown') } catch (err) { console.error(err.message) }
    rmSync(T, { recursive: true, force: true })
  }
}
console.log(JSON.stringify(result))
for (const p of problems) console.log(`${p.page ?? p.keyword}\t${p.check}\t${p.detail}`)
process.exit(result.problems ? 1 : 0)
