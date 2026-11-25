// run: howto/run . <org>/<package>/<name>, a how-to run through: its scene
// thrown away and prepared, then every step, every check (README.md
// beside it).
import { keyOf, parse, excerptOf, said } from '../../internal/script/index.js'
import { scriptOf, senderOf, runBlock, clear } from '../../internal/scene/index.js'

// A block's result as a run lists it: each line's answer an excerpt (the
// whole in the line's own record, read by howto/report).
const listed = (title, lines, of) => ({ title, ok: lines.length === of && lines.every(l => l.ok), lines: lines.map(l => ({ ...l, answer: excerptOf(l.answer) })) })

// The script read and checked, before anything runs: { key, script }.
export async function scriptAt (exec, given) {
  const { key } = keyOf(given)
  const script = parse(await scriptOf(exec, key))
  exec.log('verbose', 'script', { howto: key, scene: Boolean(script.scene), steps: script.steps.length, needs: script.needs })
  return { key, script }
}

// The job, run outside the execution while the request waits: the scene
// thrown away, prepared, then the steps in order, the first that fails
// ending the run.
export async function through (sender, key, script) {
  const cleared = await clear(sender)
  const scene = script.scene ? listed(script.scene.title, await runBlock(sender, script.scene), script.scene.lines.length) : null
  const steps = []
  if (!scene || scene.ok) {
    for (const s of script.steps) {
      const done = listed(s.title, await runBlock(sender, s), s.lines.length)
      steps.push(done)
      if (!done.ok) break
    }
  }
  const passed = (!scene || scene.ok) && steps.length === script.steps.length && steps.every(s => s.ok)
  const failed = scene && !scene.ok ? { at: 'the scene', b: scene } : steps.length && !steps.at(-1).ok ? { at: `step ${steps.length}`, b: steps.at(-1) } : null
  const answer = passed ? [`${key}: passed, ${steps.length} steps.`] : [`${key}: not passed, at ${failed.at}: ${failed.b.title}.`, ...said(failed.b.lines)]
  return { howto: key, passed, steps: script.steps.length, ran: steps.length, needs: script.needs, cleared, scene, done: steps, answer }
}

export async function run (exec, { args = [] }) {
  if (exec.resumed) {
    if (exec.resumed.error) throw new Error(exec.resumed.error)
    const r = exec.resumed.output
    exec.log(r?.passed ? 'info' : 'warn', 'ran', { howto: r?.howto, passed: r?.passed, ran: r?.ran, steps: r?.steps })
    return r
  }
  const { key, script } = await scriptAt(exec, args[0])
  const sender = senderOf(exec)
  return exec.wait(() => through(sender, key, script))
}
