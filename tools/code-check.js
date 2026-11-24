// The code rules (pkgm-base-check) on this repository's code: the modules the
// packages carry (every organisation's, tools/lib/orgs.js) and the packages' own code; and each package
// against the structure it is to have (its files, its sets, its tests, a
// test of its own for what it provides); each list against its
// organisation (fully qualified, its own packages only); and the implementation
// validation: every pattern implemented has a how-to; and each module's test
// page against its tests. One line a problem;
// exit 1 when there is one.
//   tools/bare tools/code-check.js
import process from 'bare-process'
import { readFileSync, readdirSync, existsSync } from 'bare-fs'
import { join, resolve, dirname } from 'bare-path'
import { fileURLToPath } from 'bare-url'
import { checkModule, checkPackage, checkOwn, checkPatterns, checkTestPage } from '../pear-full-square/pkgm-base-check/index.js'
import { orgsHere, packagesHere, checkList } from './lib/orgs.js'

const dev = resolve(dirname(fileURLToPath(import.meta.url)), '..')
// every package here: a folder of an organisation's with a package.json,
// as <org>/<package>
const ORGS = orgsHere(dev)
const packages = packagesHere(dev)
const carried = new Set()
for (const p of packages) {
  const m = join(dev, p, 'modules', 'pear-full-square')
  if (existsSync(m)) for (const n of readdirSync(m)) carried.add(n)
}
const ours = [...carried].map(n => JSON.parse(readFileSync(join(dev, 'pear-full-square', n, 'package.json'), 'utf8')).name)
let n = 0
const say = (where, p) => { n++; console.log(`${where}/${p.file}\t${p.check}\t${p.detail}`) }
for (const m of [...carried].sort()) for (const p of checkModule(join(dev, 'pear-full-square', m), { ours })) say(`pear-full-square/${m}`, p)
// a module's test page: every test by its name, nothing else (every module here)
const modules = readdirSync(join(dev, 'pear-full-square')).sort().filter(m => existsSync(join(dev, 'pear-full-square', m, 'package.json')))
for (const m of modules) for (const p of checkTestPage(join(dev, 'pear-full-square', m))) say(`pear-full-square/${m}`, p)
for (const p of packages) for (const q of checkPackage(join(dev, p))) say(p, q)
// a list: fully qualified, its own organisation's packages only
for (const p of packages) {
  const f = join(dev, p, 'mrepo', 'packages', '.layer.json')
  if (!existsSync(f)) continue
  for (const d of checkList(p.split('/')[0], JSON.parse(readFileSync(f, 'utf8')).packages ?? [])) { n++; console.log(`${p}/mrepo/packages/.layer.json\tlist\t${d}`) }
}
// a package's structure: those that are bundled (they carry the checks)
for (const p of packages) {
  if (!existsSync(join(dev, p, 'main.js'))) continue
  for (const q of await checkOwn(join(dev, p))) { n++; console.log(`${p}\t${q.check}\t${q.detail}`) }
}
// the implementation validation: every pattern implemented has a how-to,
// over every organisation's packages (the generic how-tos are haiccing's)
for (const q of checkPatterns(packages.map(p => join(dev, p)))) { n++; console.log(`${ORGS.join('+')}\t${q.check}\t${q.detail}`) }
console.log(`${carried.size} modules, ${packages.length} packages: ${n} problems`)
process.exit(n ? 1 : 0)
