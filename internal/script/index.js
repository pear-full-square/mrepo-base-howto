// script: a how-to's steps, its steps.haicc, read into what it needs, its
// scene and its steps, each line as typed after haicc with what it
// answers; a line's answer, and its checks (README.md beside it).
import { words } from 'mrepo-base-request'

// The script's name, beside the how-to's page.
export const FILE = 'steps.haicc'
// What a comment line marks: # <mark>: <text>.
const MARK = /^#\s*(step|scene|expect|needs):\s*(.*)$/
// What a how-to may need beyond an install: said, not checked here.
export const NEEDS = ['docker', 'network']
// An excerpt of an answer, where a run lists it: at most this many characters.
export const EXCERPT = 400

// A how-to's key, <org>/<package>/<name>: { org, pkg, name, key }; the
// package <org>/<package>, its page and script at howto/<name>/.
export function keyOf (key) {
  const m = /^([a-z][a-z0-9-]*)\/([a-z][a-z0-9-]*)\/([a-z][a-z0-9-]*)$/.exec(String(key ?? ''))
  if (!m) throw new Error(`not a how-to: ${key ?? 'none'} (<org>/<package>/<name>, haiccing/base-package-crud/query)`)
  return { key: m[0], pkg: `${m[1]}/${m[2]}`, name: m[3], file: `/howto/${m[3]}/${FILE}` }
}

// The script read: { needs, scene, steps }. needs: [docker, network]
// (# needs: before anything else); scene: null or { title, lines }, what
// is prepared before the first step (# scene: <title>, before the
// steps); steps: [{ title, lines }] (# step: <title>, one at least, each
// with a line). A line: { n, line, at, words, expects }, at its first
// word, the position, words the command after it; expects the fragments
// of # expect: lines under it. Other comments and blank lines: none. A
// line the script cannot hold is an error that says where.
export function parse (text) {
  if (typeof text !== 'string' || !text.trim()) throw new Error(`no steps: an empty ${FILE}`)
  const needs = []
  const steps = []
  let scene = null
  let block = null
  let last = null
  const at = (n, why) => new Error(`${FILE} line ${n}: ${why}`)
  text.replace(/\r/g, '').split('\n').forEach((raw, i) => {
    const n = i + 1
    const line = raw.trim()
    if (!line) return
    const m = MARK.exec(line)
    if (m) {
      const [, mark, rest] = m
      const said = rest.trim()
      if (!said) throw at(n, `# ${mark}: says nothing`)
      if (mark === 'needs') {
        if (block) throw at(n, '# needs: before the scene and the steps')
        for (const x of said.split(/[\s,]+/).filter(Boolean)) {
          if (!NEEDS.includes(x)) throw at(n, `# needs: ${x}, none such (${NEEDS.join(', ')})`)
          if (!needs.includes(x)) needs.push(x)
        }
      } else if (mark === 'scene') {
        if (scene || steps.length) throw at(n, '# scene: once, before the first step')
        scene = block = { title: said, lines: [] }
        last = null
      } else if (mark === 'step') {
        block = { title: said, lines: [] }
        steps.push(block)
        last = null
      } else {
        if (!last) throw at(n, '# expect: under a line, what it answers')
        last.expects.push(said)
      }
      return
    }
    // any other comment: the page's, not the run's
    if (line.startsWith('#')) return
    if (!block) throw at(n, `${line}: before the first # step: (or # scene:)`)
    let w
    try { w = words(line) } catch (err) { throw at(n, err.message) }
    if (w[0].startsWith('-')) throw at(n, `${line}: ${w[0]}, an option of the haicc command: a line is a request, its position first`)
    if (w.length < 2) throw at(n, `${line}: a position, then a command`)
    last = { n, line, at: w[0], words: w.slice(1), expects: [] }
    block.lines.push(last)
  })
  if (!steps.length) throw new Error(`no steps: ${FILE} has no # step: <title>`)
  for (const b of [scene, ...steps]) if (b && !b.lines.length) throw new Error(`${FILE}: "${b.title}" has no line`)
  return { needs, scene, steps }
}

// What a line is sent as, from where the runner stands (`.`): the
// command alone at `.`, else a hop to its position, as `haicc <position>
// ...` typed at the terminal is.
export const partsOf = line => (line.at === '.' ? line.words : ['haicc', line.at, ...line.words])

// A completed form's answer, the text its checks read: its output as
// `haicc --output` prints it (one line of JSON), or `error: <message>`.
export const answerOf = form => ('error' in form ? `error: ${form.error}` : JSON.stringify(form.output ?? null))

// A line's checks on its answer: each fragment in it. A line whose request
// failed fails, unless an expect says the failure is its answer
// (`# expect: error: ...`). -> { ok, checks: [{ expect, ok }], failed? }
export function checksOf (line, answer, failed = false) {
  const checks = line.expects.map(expect => ({ expect, ok: answer.includes(expect) }))
  const meant = failed && line.expects.some(e => e.startsWith('error:'))
  const ok = checks.every(c => c.ok) && (!failed || meant)
  return { ok, checks, ...(failed && !meant ? { failed: answer } : {}) }
}

// An answer as a run lists it: whole up to EXCERPT characters, else its
// start and how long it was.
export const excerptOf = answer => (answer.length <= EXCERPT ? answer : `${answer.slice(0, EXCERPT)}... (${answer.length} characters)`)

// What a block's lines say, in natural language, for the answer: the first
// that did not pass, what was expected of it and what it answered.
export function said (lines) {
  const out = []
  for (const l of lines) {
    if (l.ok) continue
    out.push(`Line ${l.n}: ${l.line}`)
    for (const c of l.checks ?? []) if (!c.ok) out.push(`  expected: ${c.expect}`)
    // (a continuation's answer after the line's own: each cut to its start)
    for (const a of l.answer.split('\n')) out.push(`  answered: ${a.length > 200 ? `${a.slice(0, 200)}...` : a}`)
  }
  return out
}
