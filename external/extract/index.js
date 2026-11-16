// extract: howto/extract, the mrepo's howto layer from the how-tos of its
// linked packages: what is there replaced (README.md beside it).
import { readFileSync, existsSync } from 'bare-fs'
import { join } from 'bare-path'
import Bundle from 'bare-bundle'
import { joined } from 'mycelium-uri'
import { extract, FOLDER, LAYER } from '../../internal/howto/index.js'

const CONFIG = { mode: 'atomic', description: 'How-tos: the how-tos of the packages the mrepo links, by activity, and their index (extracted with its help).' }
// A document that may not be there: null then; one that is there and is
// no document is an error.
// log: none (one read; the action says what it found)
const json = async (exec, uri) => {
  const bytes = await exec.find(uri)
  if (bytes === null) return null
  try { return JSON.parse(bytes.toString()) } catch (err) { throw new Error(`not a document: ${uri}`, { cause: err }) }
}

export async function extractAction (exec, { uri }) {
  const at = joined(uri)
  if (at !== '.' && at !== 'main') throw new Error(`howto extract: the whole mrepo only, . (not ${at})`)
  const listed = (await json(exec, '/packages/manifest.json'))?.packages
  if (!listed) { exec.log('verbose', 'no packages', {}); return { howtos: 0, activities: [], changed: false, problems: 0 } }
  const dir = exec.runtime.dir
  const present = Object.keys(listed).filter(pkg => existsSync(join(dir, 'packages', `${pkg}.bundle`)))
  // each package's how-tos: the READMEs of its howto/<name>/ folders
  const read = await exec.step('bundles', r => ({ listed: Object.keys(listed).length, present: present.length, howtos: r.reduce((n, p) => n + Object.keys(p.files).length, 0) }), async () => present.map(pkg => {
    const b = Bundle.from(readFileSync(join(dir, 'packages', `${pkg}.bundle`)))
    const files = {}
    for (const k of Object.keys(b.files)) if (k.startsWith(`/${FOLDER}/`) && k.endsWith('/README.md') && k.split('/').length === 4) files[k] = b.read(k)
    exec.log('debug', 'bundle', { package: pkg, howtos: Object.keys(files).length })
    return { pkg, files }
  }))
  const files = await exec.step('extract', r => ({ files: Object.keys(r).length }), async () => extract(read))
  if (await exec.find(`/${LAYER}/layer.json`) === null) files['/layer.json'] = Buffer.from(JSON.stringify(CONFIG, null, 2) + '\n')
  // what was there and is no more: the how-tos the old index names
  const old = await json(exec, `/${LAYER}/index.json`)
  let changed = false
  const written = { put: 0, removed: 0 }
  await exec.step('write', () => written, async () => {
    for (const [p, bytes] of Object.entries(files)) {
      const was = await exec.find(`/${LAYER}${p}`)
      if (!was || !Buffer.from(was).equals(bytes)) { exec.log('debug', 'put', { path: p }); exec.put(`/${LAYER}${p}`, bytes); changed = true; written.put++ }
    }
    for (const h of Object.values(old ?? {}).flat()) {
      const p = `/${h.howto}.json`
      if (!files[p]) { exec.log('debug', 'removed', { path: p }); exec.remove(`/${LAYER}${p}`); changed = true; written.removed++ }
    }
  })
  const index = JSON.parse(files['/index.json'].toString())
  const problems = JSON.parse(files['/problems.json'].toString()).length
  const howtos = Object.values(index).flat().length
  exec.log(problems ? 'warn' : 'info', 'extracted', { howtos, activities: Object.keys(index), changed, problems })
  return { howtos, activities: Object.keys(index), changed, problems }
}
