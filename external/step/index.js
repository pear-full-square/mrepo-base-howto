// step: howto/step . <org>/<package>/<name>, a how-to a step at a time:
// the next step run, its answer; the first prepares the scene (README.md
// beside it).
import { scriptAt } from '../run/index.js'
import { senderOf, runBlock, clear, recordsOf } from '../../internal/scene/index.js'
import { said } from '../../internal/script/index.js'

// The next step of a how-to, by the runner's own records, newest first:
// 1 after a reset or a run (any: each throws the scene away), or when
// another how-to's first step prepared the scene since; else the one
// after its last step, when that one passed. -> the step, 1 the first;
// an error when its last step failed.
export function nextOf (records, key) {
  for (const r of [...records].reverse()) {
    if (r.error) continue
    if (r.action === 'reset' || r.action === 'run') return 1
    if (r.action !== 'step' || typeof r.output?.step !== 'number') continue
    if (r.howto !== key) { if (r.output.step === 1) return 1; continue }
    if (!r.output.ok) throw new Error(`${key}: step ${r.output.step} failed (howto/reset . to start again)`)
    return r.output.step + 1
  }
  return 1
}

export async function step (exec, { args = [] }) {
  if (exec.resumed) {
    if (exec.resumed.error) throw new Error(exec.resumed.error)
    const r = exec.resumed.output
    exec.log(r?.ok ? 'info' : 'warn', 'stepped', { howto: r?.howto, step: r?.step, ok: r?.ok })
    return r
  }
  const { key, script } = scriptAt(exec, args[0])
  const n = nextOf(await recordsOf(exec), key)
  const of = script.steps.length
  if (n > of) throw new Error(`${key}: all ${of} steps done (howto/reset . to step through again)`)
  exec.log('verbose', 'next', { howto: key, step: n, of })
  const sender = senderOf(exec)
  return exec.wait(async () => {
    // the first: the scene thrown away, then prepared
    const before = n === 1 ? { cleared: await clear(sender) } : {}
    if (n === 1 && script.scene) {
      const lines = await runBlock(sender, script.scene)
      const ok = lines.length === script.scene.lines.length && lines.every(l => l.ok)
      before.scene = { title: script.scene.title, ok, lines }
      if (!ok) return { howto: key, step: n, of, title: script.steps[0].title, ok: false, lines: [], ...before, answer: [`${key}: the scene, ${script.scene.title}: not prepared.`, ...said(lines)] }
    }
    const s = script.steps[n - 1]
    const lines = await runBlock(sender, s)
    const ok = lines.length === s.lines.length && lines.every(l => l.ok)
    const answer = [`${key}: step ${n} of ${of}, ${s.title}: ${ok ? 'passed' : 'not passed'}.`, ...(ok ? lines.flatMap(l => [`$ ${l.line}`, `  ${l.answer.length > 200 ? `${l.answer.slice(0, 200)}...` : l.answer}`]) : said(lines))]
    return { howto: key, step: n, of, title: s.title, ok, lines, next: ok && n < of ? n + 1 : null, ...before, answer }
  })
}
