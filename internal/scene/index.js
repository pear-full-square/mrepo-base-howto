// scene: where a how-to runs, the mrepo the runner is in (`.`): its
// script read from its package's bundle, a line run as a request
// through its own inbox, the scene thrown away, and the runner's own
// record read back from its request log (README.md beside it).
import { readFileSync, existsSync } from 'bare-fs'
import { join } from 'bare-path'
import Bundle from 'bare-bundle'
import { send, layer, nameOf, DONE } from 'mrepo-base-request'
import { keyOf, partsOf, answerOf, checksOf, FILE } from '../script/index.js'

// The protocol's name: its own records in the request log are found by it.
export const PROTOCOL = 'howto'

// Where a package's bundle is, as this mrepo's packages manifest says:
// among its own packages, else in the install's store, else in a folder
// of its sources (read there, nothing installed); null where none has it.
// log: none (reads; the action says what it found)
export async function bundleOf (exec, pkg) {
  const own = join(exec.runtime.dir, 'packages', `${pkg}.bundle`)
  if (existsSync(own)) return own
  const bytes = await exec.find('/packages/manifest.json')
  let manifest = {}
  // catch: no manifest that reads: only its own packages looked at
  try { manifest = bytes === null ? {} : JSON.parse(bytes.toString()) } catch {}
  const folders = (manifest.sources ?? []).filter(x => typeof x === 'string' && x.startsWith('folder:')).map(x => x.slice('folder:'.length))
  for (const at of [manifest.store, ...folders].filter(Boolean)) if (existsSync(join(at, `${pkg}.bundle`))) return join(at, `${pkg}.bundle`)
  return null
}

// A how-to's script, from its package's bundle (bundleOf). -> its text
// log: none (reads; the action says what it found)
export async function scriptOf (exec, key) {
  const k = keyOf(key)
  const file = await bundleOf(exec, k.pkg)
  if (!file) throw new Error(`no package: ${k.pkg} (not among this mrepo's packages, in the store or in a folder of its sources)`)
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
// command does, its answer after the line's. -> { n, line, offset,
// offsets, answer, ok, checks, failed? }: offset its request's, its
// identity here; offsets every request's it made.
export async function runLine (sender, line) {
  const form = await send(sender, partsOf(line))
  const offsets = [form.offset]
  let answer = answerOf(form)
  let failed = 'error' in form
  const c = failed ? null : continuationOf(form.continuation)
  if (c) {
    const more = await send(sender, ['haicc/script', c.at, c.script])
    offsets.push(more.offset)
    answer += `\n${answerOf(more)}`
    failed = 'error' in more
  }
  return { n: line.n, line: line.line, offset: form.offset, offsets, answer, ...checksOf(line, answer, failed) }
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
  const form = await send(sender, parts)
  if ('error' in form) throw new Error(`${parts.join(' ')}: ${form.error}`)
  return form.output
}

// A command at a position from the runner: there itself, or a hop.
const at = (path, parts) => (path ? ['haicc', path, ...parts] : parts)

// What an mrepo linked, by its links layer: [{ at, how }]; none where it
// cannot be read (an mrepo without crud, or not in service: it deployed
// nothing it can tear down).
async function linksOf (sender, path) {
  const form = await send(sender, at(path, ['crud/read', '*', '--flags', 'layer=links']))
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
// the inside out, then everything in its main removed; each an ordinary
// request. -> { torn: [position...], removed: [node...] }
export async function clear (sender) {
  const torn = await down(sender, '')
  const removed = []
  for (const n of (await own(sender, ['crud/read', '.']))?.[0]?.children ?? []) { await own(sender, ['crud/delete', n, 'recurse']); removed.push(n) }
  return { torn, removed }
}

// The request log as the runner reads it: request/done, a streaming
// layer, through the request module's own reading of it (its records by
// their offsets), on what the execution may read.
// log: none (a view; its readers say what they found)
const doneOf = exec => layer({ repo: { read: p => exec.read(p), find: p => exec.find(p), select: p => exec.select(p) } }, DONE)

// The runner's own records in the request log, oldest first: [{ offset,
// action, howto, output, error }]; a record's offset its identity, the
// order they arrived in.
// log: none (reads; the action says what it found)
export async function recordsOf (exec) {
  const done = doneOf(exec)
  const out = []
  for (const name of await done.list()) {
    let core
    // catch: a record that does not read is not the runner's
    try { core = (await done.read(name)).value } catch { continue }
    const form = core?.value
    if (form?.protocol !== PROTOCOL) continue
    out.push({ offset: Number(name), action: form.action, howto: form.args?.[0] ?? null, output: form.output ?? null, error: form.error ?? null })
  }
  return out
}

// One request's form, by its offset: null where it is not done here.
// log: none (one read)
export async function formOf (exec, offset) {
  const done = doneOf(exec)
  const name = nameOf(Number(offset))
  if (!(await done.has(name))) return null
  // catch: a record that does not read: none
  try { return (await done.read(name)).value?.value ?? null } catch { return null }
}
