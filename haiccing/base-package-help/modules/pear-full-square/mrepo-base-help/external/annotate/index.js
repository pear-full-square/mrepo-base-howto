// annotate: help/annotate <protocol>/<action> [<argument>...] at a URI: a
// command explained where it would run, not executed (README.md beside it).
import { check, runtimeData, segmented, joined, MAIN } from 'mrepo-base-request'
import { get, packageKey } from 'mrepo-base-info'

// The URI as written, where the outside stands: main's prefix not part of it.
const written = uri => { const s = segmented(uri); return joined(s[0] === MAIN && s.length > 1 ? s.slice(1) : s) }
// A command as typed: its parts, a part with a space quoted.
const typed = parts => parts.map(p => (/[\s"']/.test(p) ? JSON.stringify(p) : p)).join(' ')
// An argument's name in an action's config: `name`, or `name?` optional.
const named = a => ({ name: a.replace(/\?$/, ''), optional: a.endsWith('?') })

// form: the help/annotate request, `--flags help` rewritten into it: its
// URI the command's, its arguments the command's <protocol>/<action> and
// arguments.
export async function annotate (exec, { uri = ['.'], args = [], flags = {} }) {
  const [first, ...given] = args
  if (typeof first !== 'string' || !/^[a-z][a-z0-9-]*(\/[a-z][a-z0-9-]*)?$/.test(first)) throw new Error('missing argument: command (<protocol>/<action> [<argument>...])')
  const protocols = exec.runtime.protocols ?? {}
  const [protocol, action = protocols[protocol]?.default ?? null] = first.split('/')
  const at = written(uri)
  const command = typed([action ? `${protocol}/${action}` : protocol, at, ...given, ...(Object.keys(flags).length ? ['--flags', ...Object.entries(flags).map(([k, v]) => (v === true ? k : `${k}=${v}`))] : [])])
  const cfg = action ? protocols[protocol]?.actions?.[action] ?? null : null
  // the door, here and now: the check a request from outside meets as it executes
  const form = { protocol, action, uri, args: given, ...(Object.keys(flags).length ? { flags } : {}) }
  const data = await runtimeData({ repo: exec.runtime, protocols })
  const refused = action ? check(form, data, { state: true }) : `no action: ${protocol} has no default action`
  // what it does: its description, and its page here when there is one
  // (its keywords in full form: its package's organisation and keyword)
  const pkg = protocols[protocol]?.package ?? null
  const key = pkg ? packageKey(pkg) : protocol
  let page = null
  if (cfg) {
    // catch: no page for it here (no info, or not among its keywords): said, not thrown
    try { page = (await get(exec, { uri: [MAIN, `${key}/${action}`] })).choices[0] ?? null } catch (err) { exec.log('verbose', 'no page', { keyword: `${key}/${action}`, why: err.message }) }
  }
  // its arguments: those its action names, against those given
  const names = (cfg?.args ?? []).map(named)
  const missing = names.filter((a, i) => !a.optional && i >= given.length).map(a => a.name)
  const extra = names.length || !cfg ? given.slice(names.length) : []
  exec.log('verbose', 'annotated', { command, refused })
  const a = {
    help: command,
    does: cfg?.description ?? page?.oneliner ?? null,
    door: refused ? `refused here: ${refused}` : 'taken here, now',
    arguments: names.length
      ? `${names.map(a => (a.optional ? `[${a.name}]` : a.name)).join(' ')}${missing.length ? `; missing: ${missing.join(', ')}` : ''}${extra.length ? `; more than it names: ${extra.length}` : ''}`
      : (given.length && cfg ? `none named; given: ${given.length}` : 'none'),
    run: command,
    // its page; an action not there: its protocol's; a protocol not here: the top
    more: cfg ? `info/get ${key}/${action}` : protocols[protocol] ? `info/get ${key}` : 'info/get'
  }
  // the same in natural language, a line each: what the haicc command prints
  const cap = s => s[0].toUpperCase() + s.slice(1)
  return { ...a, answer: [`${a.help}: ${a.does ?? 'nothing said of what it does here'}`, `${cap(a.door)}.`, `Arguments: ${a.arguments}.`, `To run it: ${a.run}`, `To read more: ${a.more}`] }
}
