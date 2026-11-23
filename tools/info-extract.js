// The info layer as a runtime extracts it, from bundles, into a folder to
// browse, with its problems: the documentation checked against the rules
// (haiccing/base-docs-package, "READMEs"). The extraction and the rules
// are mrepo-base-info's: the same here.
//   tools/bare tools/info-extract.js [<org>/<component>...] [--sources=<folder>] [--out=<folder>]
//   tools/bare tools/info-extract.js --files
// The mrepos: by default each component's (base-component-boot,
// base-component-haicc, base-component-docs), its list from its
// mrepo/packages/layer.json, its bundles from sources/ here. The out folder
// (default sources/info/<component>/): the pages, index.json and
// problems.json. --files: the rules on this repository's own READMEs (every
// organisation's packages, the modules they carry), by file. Exit 1 when there
// is a problem.
import process from 'bare-process'
import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync, readdirSync, statSync } from 'bare-fs'
import { join, resolve, dirname } from 'bare-path'
import { fileURLToPath } from 'bare-url'
import Bundle from 'bare-bundle'
import { check, extract } from '../pear-full-square/mrepo-base-info/index.js'
import { packagesHere } from './lib/orgs.js'

const dev = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const args = process.argv.slice(2)
const flag = (n, d) => args.find(a => a.startsWith(`--${n}=`))?.slice(n.length + 3) ?? d
// (a schema a package carries: its own, its modules')
const SCHEMA = /^\/(modules\/[^/]+\/[^/]+\/)?schemas\/[^/]+\.json$/
const WANTED = k => k.endsWith('/README.md') || k === '/package.json' || k === '/mrepo/packages/layer.json' || k === '/modules/third-party.json' || SCHEMA.test(k)

if (args.includes('--files')) {
  // every package here, and every module a package carries
  const packages = packagesHere(dev)
  const carried = new Set(packages.flatMap(p => { const m = join(dev, p, 'modules', 'pear-full-square'); return existsSync(m) ? readdirSync(m) : [] }))
  const roots = [...packages, ...[...carried].sort().map(m => `pear-full-square/${m}`)]
  const found = []
  const walk = d => { for (const n of readdirSync(join(dev, d)).sort()) { const p = `${d}/${n}`; if (n === 'node_modules' || n === 'modules' || n === '.git') continue; if (statSync(join(dev, p)).isDirectory()) walk(p); else if (n === 'README.md') found.push(p) } }
  for (const r of roots) walk(r)
  let n = 0
  for (const f of found) for (const [c, d] of check(readFileSync(join(dev, f), 'utf8'))) { n++; console.log(`${f}\t${c}\t${d}`) }
  console.log(`${found.length} READMEs, ${n} problems`)
  process.exit(n ? 1 : 0)
}

const sources = resolve(flag('sources', join(dev, 'sources')))
let components = args.filter(a => !a.startsWith('--'))
if (!components.length) components = ['haiccing/base-component-boot', 'haiccing/base-component-haicc', 'haiccing/base-component-docs']
// a package's bundle, what extraction reads of it
const read = (pkg, documented = false) => {
  const b = Bundle.from(readFileSync(join(sources, `${pkg}.bundle`)))
  const wanted = {}
  for (const k of Object.keys(b.files)) if (WANTED(k)) wanted[k] = b.read(k)
  return { pkg, files: wanted, paths: Object.keys(b.files), documented }
}
// every package the sources offer: each org's manifest
const offered = () => readdirSync(sources).filter(o => existsSync(join(sources, o, 'manifest.json'))).flatMap(o => Object.keys(JSON.parse(readFileSync(join(sources, o, 'manifest.json'))).packages ?? {})).sort()
let all = 0
for (const c of components) {
  const def = JSON.parse(readFileSync(join(dev, c, 'mrepo', 'packages', 'layer.json')))
  const list = def.packages
  // documents: store: every other package, documented only (here, the
  // sources stand for an install's store: all of them)
  const documented = def.documents === 'store' ? offered().filter(p => !list.includes(p)) : []
  const out = resolve(flag('out', join(dev, 'sources', 'info')), c.split('/').pop())
  const files = extract([...list.map(pkg => read(pkg)), ...documented.map(pkg => read(pkg, true))])
  if (existsSync(out)) rmSync(out, { recursive: true })
  for (const [p, bytes] of Object.entries(files)) { mkdirSync(dirname(join(out, p)), { recursive: true }); writeFileSync(join(out, p), bytes) }
  const problems = JSON.parse(files['/problems.json'].toString())
  const byCheck = {}
  for (const p of problems) byCheck[p.check] = (byCheck[p.check] ?? 0) + 1
  for (const p of problems) console.log(`${c}\t${p.page ?? p.keyword}\t${p.check}\t${p.detail}`)
  console.log(JSON.stringify({ component: c, out, packages: list.length, documented: documented.length, keywords: Object.entries(files).filter(([p]) => p.endsWith('index.json')).reduce((n, [, b]) => n + Object.keys(JSON.parse(b.toString())).length, 0), problems: problems.length, byCheck }))
  all += problems.length
}
process.exit(all ? 1 : 0)
