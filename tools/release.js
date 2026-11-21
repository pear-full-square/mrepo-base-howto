// The release, built into the local sources (sources/ here, gitignored):
// everything an install needs, by organisation.
//   sources/<org>/<package>.bundle      each package here (a folder of an
//                                       organisation's (tools/lib/orgs.js),
//                                       whose package.json names
//                                       its modules): assembled, then bundled
//                                       (tools/package-assemble.js,
//                                       tools/package-bundle.js), in
//   sources/<org>/manifest.json         their manifest, an organisation's:
//                                       these packages only, and the
//                                       organisations they may depend on
//                                       (tools/lib/orgs.js)
//   sources/addons/<sha256>             their native addons, every
//                                       platform's (tools/lib/platforms.js)
//   sources/holepunchto/<tarball>       Bare's runtime, third party: the
//                                       tarball this repository's lockfile
//                                       pins (bare-runtime-<platform>), one
//                                       a platform, fetched once, checked
//                                       against its sha512
//   sources/third-party.json            the third-party components: each its
//                                       file, where it comes from, its sha512
//   haiccing/base-linux-haicc/pins      Bare's pins, one a platform, for
//                                       the haicc scripts, brought in line
//                                       with the lockfile;
//   haiccing/base-linux-haicc/haicc-install.sh   its installer written
//                                       again (its build.sh)
// No executable: the boot is its bundle, run with Bare, as the haicc
// command is (haiccing/base-app-haicc; haicc boot/deploy runs the boot).
// Each package's test report against the bundle built (tools/lib/report.js:
// current, stale, failed, none) is said in the result; --strict: exit 1
// unless every one is current (a release to publish: every package tested
// as it is; a package's pre-release, tools/package-test.js, writes it).
//   tools/bare tools/release.js [--out=<folder>] [--strict]     (default: sources/ here)
import process from 'bare-process'
import crypto from 'bare-crypto'
import { readFileSync, writeFileSync, mkdirSync, existsSync, unlinkSync } from 'bare-fs'
import { join, resolve, dirname } from 'bare-path'
import { fileURLToPath } from 'bare-url'
import { spawnSync } from 'bare-subprocess'
import { statusOf } from './lib/report.js'
import { orgOf, orgsHere, packagesHere } from './lib/orgs.js'
import { PLATFORMS } from './lib/platforms.js'

const dev = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const flag = (n, d) => process.argv.slice(2).find(a => a.startsWith(`--${n}=`))?.slice(n.length + 3) ?? d
const out = resolve(flag('out', join(dev, 'sources')))
const tool = (...a) => { const r = spawnSync(join(dev, 'tools', 'bare'), a, { stdio: 'inherit' }); if (r.status !== 0) throw new Error(`failed: ${a.join(' ')}`) }

// 1. The packages: each assembled (its modules/, node_modules included:
// gitignored, so not there in a fresh clone), then bundled into the sources,
// an organisation at a time: each built, released and sourced by itself.
const orgs = orgsHere(dev)
const packages = packagesHere(dev, (org, p, pj) => Array.isArray(pj.modules))
for (const p of packages) {
  tool(join(dev, 'tools', 'package-assemble.js'), join(dev, p))
  tool(join(dev, 'tools', 'package-bundle.js'), join(dev, p), `--out=${out}`, `--org=${p.split('/')[0]}`)
}
// Each organisation's manifest names its packages only: one no longer here
// (removed, renamed) taken out, its bundle too; and the organisations its
// packages may depend on. It is published as it is (an asset of the
// release of the organisation's documentation package, what haicc sources
// download reads), so it names the release, nothing else.
for (const org of orgs) {
  const mf = join(out, org, 'manifest.json')
  if (!existsSync(mf)) continue
  const m = JSON.parse(readFileSync(mf, 'utf8'))
  const was = JSON.stringify(m)
  const keep = new Set(packages.filter(p => p.startsWith(`${org}/`)))
  for (const k of Object.keys(m.packages).filter(k => !keep.has(k))) {
    const f = join(out, m.packages[k].file)
    if (existsSync(f)) unlinkSync(f)
    delete m.packages[k]
  }
  m.depends = orgOf(org).depends
  if (JSON.stringify(m) !== was) writeFileSync(mf, JSON.stringify(m, null, 2) + '\n')
}

// 2. Bare's runtime, as the lockfile pins it, for each platform of the
// release (tools/lib/platforms.js): its tarball, by its organisation; kept
// when there and as pinned.
const locked = JSON.parse(readFileSync(join(dev, 'package-lock.json'), 'utf8')).packages
const sha512 = f => crypto.createHash('sha512').update(readFileSync(f)).digest('hex')
mkdirSync(join(out, 'holepunchto'), { recursive: true })
const bares = PLATFORMS.map(platform => {
  const lock = locked[`node_modules/bare-runtime-${platform}`]
  if (!lock) throw new Error(`no bare-runtime-${platform} in package-lock.json`)
  const want = Buffer.from(lock.integrity.replace(/^sha512-/, ''), 'base64').toString('hex')
  const file = `holepunchto/bare-runtime-${platform}-${lock.version}.tgz`
  if (!existsSync(join(out, file)) || sha512(join(out, file)) !== want) {
    const r = spawnSync('curl', ['-fsSL', '--retry', '3', '-o', join(out, file), lock.resolved], { stdio: 'inherit' })
    if (r.status !== 0) throw new Error(`could not fetch Bare's runtime: ${lock.resolved}`)
  }
  if (sha512(join(out, file)) !== want) throw new Error(`Bare's runtime is not as pinned (sha512): ${file}`)
  return { file, version: lock.version, platform, url: lock.resolved, sha512: want }
})
const version = bares[0].version
if (bares.some(b => b.version !== version)) throw new Error(`Bare's runtime pinned at different versions: ${bares.map(b => `${b.platform} ${b.version}`).join(', ')}`)
const third = { description: 'The third-party components an install needs: each its file here, where it comes from, its sha512.', components: Object.fromEntries(bares.map(b => [`bare-${b.platform}`, b])) }
writeFileSync(join(out, 'third-party.json'), JSON.stringify(third, null, 2) + '\n')

// 3. The haicc scripts: their pins of Bare the lockfile's, a build a
// platform (BARE_<os>_<arch>_FILE, _URL, _SHA512: the scripts choose the
// machine's), written in place of the Bare lines there were; their
// installer written from them (the package's own build.sh).
const linux = join(dev, 'haiccing', 'base-linux-haicc')
const pins = readFileSync(join(linux, 'pins'), 'utf8')
const v = p => p.replace(/-/g, '_')
const pinned = [`BARE_VERSION=${version}`, `BARE_PLATFORMS='${PLATFORMS.join(' ')}'`, ...bares.flatMap(b => [`BARE_${v(b.platform)}_FILE=${b.file}`, `BARE_${v(b.platform)}_URL=${b.url}`, `BARE_${v(b.platform)}_SHA512=${b.sha512}`])]
const lines = pins.split('\n')
const at = lines.findIndex(l => l.startsWith('BARE_'))
if (at < 0) throw new Error('no Bare pin in base-linux-haicc/pins')
const next = [...lines.slice(0, at).filter(l => !l.startsWith('BARE_')), ...pinned, ...lines.slice(at).filter(l => !l.startsWith('BARE_'))].join('\n')
if (next !== pins) writeFileSync(join(linux, 'pins'), next)
const built = spawnSync('sh', [join(linux, 'build.sh')], { stdio: ['ignore', 'ignore', 'inherit'] })
if (built.status !== 0) throw new Error('failed: base-linux-haicc/build.sh')

// 4. The test reports: each package's against the bundle just built.
const manifest = Object.assign({}, ...orgs.map(org => JSON.parse(readFileSync(join(out, org, 'manifest.json'), 'utf8')).packages))
const reports = Object.fromEntries(packages.map(p => [p, statusOf(join(dev, p), manifest[p]?.content)]))

const commit = spawnSync('git', ['-C', dev, 'rev-parse', 'HEAD'], { stdio: ['ignore', 'pipe', 'ignore'] }).stdout?.toString().trim() || null
console.log(JSON.stringify({ sources: out, packages, reports, bare: version, platforms: PLATFORMS, commit }))
if (process.argv.includes('--strict') && Object.values(reports).some(r => r !== 'current')) {
  console.error(`not every package's test report is current: ${Object.entries(reports).filter(([, r]) => r !== 'current').map(([p, r]) => `${p} (${r})`).join(', ')}`)
  process.exit(1)
}
