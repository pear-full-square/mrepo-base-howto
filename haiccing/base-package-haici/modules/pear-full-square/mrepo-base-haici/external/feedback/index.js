// feedback: haici/feedback <text> <protocol>/<action> [<argument>...] at a
// URI: feedback on a command, recorded in the request log, the command not
// executed (README.md beside it).
import { segmented, joined, MAIN } from 'mrepo-base-request'

// The URI as written, where the outside stands: main's prefix not part of it.
const written = uri => { const s = segmented(uri); return joined(s[0] === MAIN && s.length > 1 ? s.slice(1) : s) }
// A command as typed: its parts, a part with a space quoted.
const typed = parts => parts.map(p => (/[\s"']/.test(p) ? JSON.stringify(p) : p)).join(' ')

// form: the haici/feedback request, `--flags feedback <text>` rewritten
// into it: its URI the command's, its arguments the text, then the
// command's <protocol>/<action> and arguments.
export async function feedback (exec, { uri = ['.'], args = [], flags = {} }) {
  const [text, first, ...given] = args
  if (typeof text !== 'string' || !text.trim()) throw new Error('missing argument: text (the feedback, then the command it is on)')
  if (typeof first !== 'string' || !/^[a-z][a-z0-9-]*(\/[a-z][a-z0-9-]*)?$/.test(first)) throw new Error('missing argument: command (<protocol>/<action> [<argument>...])')
  const protocols = exec.runtime.protocols ?? {}
  const [protocol, action = protocols[protocol]?.default ?? null] = first.split('/')
  const on = typed([action ? `${protocol}/${action}` : protocol, written(uri), ...given, ...(Object.keys(flags).length ? ['--flags', ...Object.entries(flags).map(([k, v]) => (v === true ? k : `${k}=${v}`))] : [])])
  // the store: this request's own record, request/done/<id>.json once done
  const read = `crud/read done/${exec.id}.json --flags layer=request`
  exec.log('verbose', 'recorded', { on, id: exec.id })
  return {
    feedback: 'recorded',
    on,
    id: exec.id,
    read,
    answer: [`Feedback on ${on} recorded: request ${exec.id}.`, `To read it back: ${read}`]
  }
}
