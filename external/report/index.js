// report: howto/report . <org>/<package>/<name> [json|md], the last run of a
// how-to from the request log: every step's lines, each its command, its
// answer, its checks, what it changed, its metrics (README.md beside it).
import { keyOf, answerOf } from '../../internal/script/index.js'
import { recordsOf, formOf } from '../../internal/scene/index.js'

export const FORMATS = ['json', 'md']

// What a line's own request says of itself: its metrics and what it
// changed, from its log (request.metrics, request.changed).
const entriesOf = (form, event) => (form?.log ?? []).filter(e => e.event === event).map(({ level, event: _, time, ...data }) => data)

// A line, its answer whole and its log, from its own records (the line's,
// then a continuation's, as the run made them).
// log: none (reads; report says what it found)
async function lineOf (exec, l) {
  const forms = []
  for (const k of l.keys ?? [l.key]) forms.push(await formOf(exec, k))
  const read = forms.every(Boolean)
  return {
    line: l.line,
    n: l.n,
    key: l.key,
    answer: read ? forms.map(answerOf).join('\n') : l.answer,
    ok: l.ok,
    checks: l.checks ?? [],
    ...(l.failed ? { failed: l.failed } : {}),
    ms: forms.reduce((n, f) => n + (entriesOf(f, 'request.metrics')[0]?.ms ?? 0), 0),
    changed: forms.flatMap(f => entriesOf(f, 'request.changed'))
  }
}
// log: none (lineOf's reads)
const blockOf = async (exec, b) => ({ title: b.title, ok: b.ok, lines: await Promise.all((b.lines ?? []).map(l => lineOf(exec, l))) })

// The last series of a how-to in the runner's records: its last run, or
// its steps since its last first step. -> { kind, records } or null
export function seriesOf (records, key) {
  const mine = records.filter(r => !r.error && r.howto === key && r.output)
  for (let i = mine.length - 1; i >= 0; i--) {
    const r = mine[i]
    if (r.action === 'run') return { kind: 'run', records: [r] }
    if (r.action === 'step' && r.output.step === 1) return { kind: 'stepped', records: mine.slice(i).filter(x => x.action === 'step') }
  }
  return null
}

// The report as Markdown: a section a block, its lines in a code block
// each with its answer, its checks a list.
export function markdownOf (r) {
  const out = [`# ${r.howto}`, '', `${r.passed ? 'Passed' : 'Not passed'}: ${r.ran} of ${r.steps} steps, ${r.kind}, ${r.at}.`, '']
  const block = (head, b) => {
    out.push(`## ${head}: ${b.title}`, '', b.ok ? 'Passed.' : 'Not passed.', '')
    for (const l of b.lines) {
      out.push('```haicc', l.line, '```', '', `Answered in ${l.ms} ms:`, '', '```', l.answer.length > 2000 ? `${l.answer.slice(0, 2000)}...` : l.answer, '```', '')
      for (const c of l.checks) out.push(`- ${c.ok ? 'ok' : 'not ok'}: ${c.expect}`)
      if (l.failed) out.push(`- failed: ${l.failed}`)
      for (const c of l.changed) out.push(`- changed ${c.target}: ${[...(c.added ?? []), ...(c.changed ?? []), ...(c.removed ?? [])].length} paths`)
      if (l.checks.length || l.failed || l.changed.length) out.push('')
    }
  }
  if (r.scene) block('Scene', r.scene)
  r.done.forEach((b, i) => block(`Step ${i + 1}`, b))
  return out.join('\n').trimEnd() + '\n'
}

export async function report (exec, { args = [] }) {
  const { key } = keyOf(args[0])
  const format = args[1] ?? 'json'
  if (!FORMATS.includes(format)) throw new Error(`no format: ${format} (${FORMATS.join(', ')})`)
  const s = seriesOf(await recordsOf(exec), key)
  if (!s) throw new Error(`no run of ${key} here yet (howto/run . ${key}, or howto/step)`)
  const first = s.records[0]
  let r
  if (s.kind === 'run') {
    const o = first.output
    r = { howto: key, kind: 'run', at: first.at, passed: o.passed, steps: o.steps, ran: o.ran, needs: o.needs, scene: o.scene ? await blockOf(exec, o.scene) : null, done: await Promise.all(o.done.map(b => blockOf(exec, b))) }
  } else {
    const o = s.records.map(x => x.output)
    const of = o[0].of
    const done = await Promise.all(o.map(x => blockOf(exec, x)))
    r = { howto: key, kind: 'stepped', at: first.at, passed: done.length === of && done.every(b => b.ok), steps: of, ran: done.length, scene: o[0].scene ? await blockOf(exec, o[0].scene) : null, done }
  }
  exec.log('verbose', 'report', { howto: key, kind: r.kind, passed: r.passed, format })
  if (format === 'md') { const markdown = markdownOf(r); return { howto: key, passed: r.passed, markdown, answer: markdown.trimEnd().split('\n') } }
  return { ...r, answer: [`${key}: ${r.passed ? 'passed' : 'not passed'}, ${r.ran} of ${r.steps} steps, ${r.kind}, ${r.at}.`, ...[r.scene, ...r.done].filter(Boolean).map((b, i) => `${r.scene && i === 0 ? 'scene' : `step ${r.scene ? i : i + 1}`}: ${b.title}: ${b.ok ? 'ok' : 'not ok'}, ${b.lines.reduce((n, l) => n + l.ms, 0)} ms`)] }
}
