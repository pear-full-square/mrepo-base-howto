// howto: a how-to read from its README, the rules on its form, and an
// mrepo's howto layer from its packages' how-tos (README.md beside it).

// Where a package keeps its how-tos: a folder each, howto/<name>/, its
// README the how-to.
export const FOLDER = 'howto'
// The layer the how-tos are extracted into.
export const LAYER = 'howto'
const WORD = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/
// The last step's why starts so: the command that proves it worked.
const CHECK = 'the check'

// A how-to's README read: its title, its one-liner, its activity, its
// steps (each a command as typed, with why), and what is wrong with its
// form: [[check, detail]...].
export function parse (text) {
  const lines = String(text).replace(/\r/g, '').split('\n')
  const title = (lines.find(l => l.startsWith('# ')) ?? '# ').slice(2).trim()
  const problems = []
  // the one-liner: the first paragraph after the title
  const at = lines.findIndex(l => l.startsWith('# '))
  const para = []
  for (const l of lines.slice(at + 1)) { if (l.trim()) para.push(l.trim()); else if (para.length) break }
  const oneliner = para.join(' ')
  // its activity: one line, one word
  const named = lines.filter(l => /^Activity:/.test(l))
  let activity = null
  if (named.length !== 1) problems.push(['activity', named.length ? 'more than one Activity line' : 'no Activity line (Activity: <word>)'])
  else {
    activity = named[0].slice('Activity:'.length).trim()
    if (!WORD.test(activity)) { problems.push(['activity', `not a word: ${activity || '(none)'} (lowercase letters, digits, hyphens)`]); activity = null }
  }
  // its steps: one sh block; a # line says why, the command below it
  const blocks = []
  let block = null
  for (const l of lines) {
    if (block === null && /^```sh\s*$/.test(l)) block = []
    else if (block !== null && /^```\s*$/.test(l)) { blocks.push(block); block = null } else if (block !== null) block.push(l)
  }
  if (block !== null) problems.push(['steps', 'its sh block is not closed'])
  if (blocks.length !== 1) problems.push(['steps', blocks.length ? `${blocks.length} sh blocks: one, its steps` : 'no sh block: its steps'])
  const steps = []
  let why = []
  for (const l of blocks[0] ?? []) {
    const t = l.trim()
    if (!t) continue
    if (t.startsWith('#')) { why.push(t.replace(/^#+\s*/, '')); continue }
    if (!t.startsWith('haicc ')) problems.push(['steps', `not a haicc command: ${t}`])
    if (!why.length) problems.push(['steps', `no why above: ${t}`])
    steps.push({ why: why.join(' '), command: t })
    why = []
  }
  if (why.length) problems.push(['steps', `a why with no command below: ${why.join(' ')}`])
  if (blocks.length === 1 && !steps.length) problems.push(['steps', 'no step'])
  if (steps.length && !steps[steps.length - 1].why.toLowerCase().startsWith(CHECK)) problems.push(['steps', `its last step is not the check (its why starts with "${CHECK}"): ${steps[steps.length - 1].command}`])
  return { title, oneliner, activity, steps, problems }
}

// The rules on one how-to's README: [[check, detail]...]; none expected.
export const check = text => parse(text).problems

// An mrepo's howto layer, the files to write, from its packages' how-tos.
//   packages   [{ pkg, files }]: a package and its how-to READMEs by
//              bundle path (/howto/<name>/README.md)
// -> { '/index.json', '/problems.json', '/<activity>/<name>.json' ... }
export function extract (packages) {
  const out = {}
  const index = {}
  const problems = []
  for (const { pkg, files } of packages) {
    for (const path of Object.keys(files).sort()) {
      const m = path.match(new RegExp(`^/${FOLDER}/([^/]+)/README\\.md$`))
      if (!m) continue
      const name = m[1]
      const h = parse(files[path].toString())
      // where its README is in the help layer
      const help = `packages/${pkg}/${FOLDER}/${name}`
      for (const [c, d] of h.problems) problems.push({ package: pkg, howto: name, check: c, detail: d })
      if (!WORD.test(name)) { problems.push({ package: pkg, howto: name, check: 'name', detail: `not a name: ${name} (lowercase letters, digits, hyphens)` }); continue }
      if (!h.activity) continue
      const key = `${h.activity}/${name}`
      if (out[`/${key}.json`]) { problems.push({ package: pkg, howto: name, check: 'name', detail: `${key} is another package's too` }); continue }
      out[`/${key}.json`] = Buffer.from(JSON.stringify({ howto: key, title: h.title, oneliner: h.oneliner, activity: h.activity, package: pkg, help, steps: h.steps }, null, 2) + '\n')
      ;(index[h.activity] ??= []).push({ howto: key, oneliner: h.oneliner, package: pkg })
    }
  }
  const sorted = Object.fromEntries(Object.keys(index).sort().map(a => [a, index[a].sort((x, y) => x.howto.localeCompare(y.howto))]))
  out['/index.json'] = Buffer.from(JSON.stringify(sorted, null, 2) + '\n')
  out['/problems.json'] = Buffer.from(JSON.stringify(problems, null, 2) + '\n')
  return out
}
