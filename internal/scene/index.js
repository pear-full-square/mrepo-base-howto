// scene: where a how-to runs, the mrepo the runner is in (`.`): its
// script read from the package placed there, a line run as a request
// through its own inbox, the scene thrown away, and the runner's own
// record read back from its request log (README.md beside it).
import { readFileSync, existsSync } from 'bare-fs'
import { join } from 'bare-path'
import Bundle from 'bare-bundle'
import { send, guid } from 'mrepo-base-request'
import { keyOf, partsOf, answerOf, checksOf, FILE } from '../script/index.js'

// The protocol's name: its own records in the request log are found by it.
export const PROTOCOL = 'howto'
// The registry's node in main, where the scene's mrepos are recorded.
const REGISTRY = 'registry'

// A how-to's script, from its package's bundle in the mrepo's packages
// (deployed with it, or documented: documents: sources). -> its text
export function scriptOf (dir, key) {
  const k = keyOf(key)
  const file = join(dir, 'packages', `${k.pkg}.bundle`)
  if (!existsSync(file)) throw new Error(`no package here: ${k.pkg} (its bundle is not among this mrepo's packages)`)
  const b = Bundle.from(readFileSync(file))
  if (!(k.file in b.files)) {
    const has = Object.keys(b.files).filter(f => f.startsWith('/howto/') && f.endsWith(`/${FILE}`)).map(f => f.split('/')[2]).sort()
    throw new Error(`no how-to: ${k.key} (${k.pkg} has ${has.join(', ') || 'none with steps'})`)
  }
  return b.read(k.file).toString()
}

// The runtime's way to send a command into its own inbox, from an
// execution: what a waited-for job runs with.
// log: none (the runtime's view handed on; the lines are requests, each its own log)
export const senderOf = exec => ({ dir: exec.runtime.dir, uri: exec.runtime.uri, submit: exec.runtime.submit, answer: exec.runtime.answer, own: exec.runtime.own ?? null })

// A continuation a completed form holds: { at, script }, or null.
const continuationOf = c => (c && typeof c === 'object' && typeof c.at === 'string' && c.at && typeof c.script === 'string' && c.script.trim() ? c : null)

// One line run, as the terminal runs it: sent, its answer read; a
// continuation it answers with sent on as haicc/script, as the haicc
// command does, its answer after the line's. -> { n, line, key, keys,
// answer, ok, checks, failed? }: key its request's, keys every request's
// it made.
export async function runLine (sender, line) {
  const key = guid()
  const form = await send(sender, partsOf(line), { key })
  const keys = [key]
  let answer = answerOf(form)
  let failed = 'error' in form
  const c = failed ? null : continuationOf(form.continuation)
  if (c) {
    const next = guid()
    const more = await send(sender, ['haicc/script', c.at, c.script], { key: next })
    keys.push(next)
    answer += `\n${answerOf(more)}`
    failed = 'error' in more
  }
  return { n: line.n, line: line.line, key, keys, answer, ...checksOf(line, answer, failed) }
}

// A block's lines run in order, the first that fails ending it. -> [line's result]
export async function runBlock (sender, block) {
  const out = []
  for (const line of block.lines) {
    const r = await runLine(sender, line)
    out.push(r)
    if (!r.ok) break
  }
  return out
}

// A command of the runner's own, its answer: its output; an error thrown.
const own = async (sender, parts) => {
  const form = await send(sender, parts, { key: guid() })
  if ('error' in form) throw new Error(`${parts.join(' ')}: ${form.error}`)
  return form.output
}

// A command at a position from the runner: there itself, or a hop.
const at = (path, parts) => (path ? ['haicc', path, ...parts] : parts)

// What an mrepo linked, by its links layer: [{ at, how }]; none where it
// cannot be read (an mrepo without crud, or not in service: it deployed
// nothing it can tear down).
async function linksOf (sender, path) {
  const form = await send(sender, at(path, ['crud/read', '*', '--flags', 'layer=links']), { key: guid() })
  if ('error' in form || !Array.isArray(form.output)) return []
  return form.output.map(r => r?.value).filter(v => v && typeof v.at === 'string' && v.at)
}

// The mrepos below a position torn down from the inside out: what each
// linked first, then itself, at the position that links to it (a
// teardown does not take a child's own children with it). A container's
// node is the container's platform's to tear down. -> [position...]
async function down (sender, path) {
  const torn = []
  for (const l of await linksOf(sender, path)) {
    const child = path ? `${path}/${l.at}` : l.at
    if (l.how !== 'container') torn.push(...await down(sender, child))
    await own(sender, at(path, ['boot/teardown', l.at]))
    torn.push(child)
  }
  return torn
}

// The scene thrown away: every mrepo its steps deployed torn down, from
// the inside out, then everything in its main removed but the registry
// itself; each an ordinary request. -> { torn: [position...], removed:
// [node...] }
export async function clear (sender) {
  const torn = await down(sender, '')
  const removed = []
  const children = async (uri = '.') => (await own(sender, ['crud/read', uri]))?.[0]?.children ?? []
  const top = await children()
  // (the registry's nodes left by the teardowns: a swarm's, emptied)
  if (top.includes(REGISTRY)) for (const s of await children(REGISTRY)) await own(sender, ['crud/delete', `${REGISTRY}/${s}`, 'recurse'])
  for (const n of top.filter(x => x !== REGISTRY)) { await own(sender, ['crud/delete', n, 'recurse']); removed.push(n) }
  return { torn, removed }
}

// The runner's own records in the request log, oldest first: [{ name,
// action, howto, output, error, at }]; at its record's timestamp.
// log: none (reads; the action says what it found)
export async function recordsOf (exec) {
  const out = []
  for (const [path, node] of await exec.select('/request/done/*')) {
    if (!path.endsWith('.json')) continue
    let core
    // catch: a record that does not read is not the runner's
    try { core = JSON.parse((await exec.bytes(node)).toString()).value } catch { continue }
    const form = core?.value
    if (form?.protocol !== PROTOCOL) continue
    out.push({ name: core.key, action: form.action, howto: form.args?.[0] ?? null, output: form.output ?? null, error: form.error ?? null, at: core.timestamp ?? '' })
  }
  return out.sort((a, b) => (a.at < b.at ? -1 : a.at > b.at ? 1 : 0))
}

// One request's record, by its key: its form, or null.
// log: none (one read)
export async function formOf (exec, key) {
  const bytes = await exec.find(`/request/done/${key}.json`)
  if (bytes === null) return null
  // catch: a record that does not read: none
  try { return JSON.parse(bytes.toString()).value?.value ?? null } catch { return null }
}
