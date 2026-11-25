// reset: howto/reset . [<org>/<package>/<name>], the scene thrown away:
// what the steps deployed torn down, what they made in main removed; the
// stepping starts again (README.md beside it).
import { keyOf } from '../../internal/script/index.js'
import { senderOf, clear } from '../../internal/scene/index.js'

export async function reset (exec, { args = [] }) {
  if (exec.resumed) {
    if (exec.resumed.error) throw new Error(exec.resumed.error)
    const r = exec.resumed.output
    exec.log('info', 'reset', { torn: r?.cleared?.torn?.length ?? 0, removed: r?.cleared?.removed?.length ?? 0 })
    return r
  }
  // (a how-to named: its key checked, recorded with the reset)
  const howto = args[0] ? keyOf(args[0]).key : null
  exec.log('verbose', 'clearing', { howto })
  const sender = senderOf(exec)
  return exec.wait(async () => {
    const cleared = await clear(sender)
    return { reset: true, howto, cleared, answer: [`The scene thrown away: ${cleared.torn.length ? `${cleared.torn.join(', ')} torn down, ` : ''}${cleared.removed.length ? `${cleared.removed.join(', ')} removed from main` : 'nothing else in main'}; stepping starts again.`] }
  })
}
