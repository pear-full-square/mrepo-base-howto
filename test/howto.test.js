import test from 'brittle'
import Bundle from 'bare-bundle'
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'bare-fs'
import { join } from 'bare-path'
import { tmpdir } from 'bare-os'
import { parse, keyOf, partsOf, answerOf, checksOf, run, step, report, reset, nextOf, seriesOf } from '../index.js'

const SCRIPT = `# needs: docker
# scene: something to read
. crud/create swarms/swarm-1 '{"size":3}'
# step: read back
# what the page says, not the run
. crud/read "swarms/*"
# expect: "size":3
# step: through the host
host crud/read .
# expect: error: not now
`

test('the script read: its needs, its scene, its steps, each line its position, its command and what it answers', (t) => {
  const s = parse(SCRIPT)
  t.alike(s.needs, ['docker'], 'what it needs')
  t.is(s.scene.title, 'something to read', 'its scene')
  t.alike(s.scene.lines.map(l => [l.n, l.at, l.words]), [[3, '.', ['crud/create', 'swarms/swarm-1', '{"size":3}']]], 'the scene\'s line, its words as the shell splits them')
  t.alike(s.steps.map(x => x.title), ['read back', 'through the host'], 'its steps, in order')
  t.alike(s.steps[0].lines[0].expects, ['"size":3'], 'an expect under its line; another comment the page\'s')
  t.alike(partsOf(s.steps[0].lines[0]), ['crud/read', 'swarms/*'], 'at `.`: the command alone')
  t.alike(partsOf(s.steps[1].lines[0]), ['haicc', 'host', 'crud/read', '.'], 'elsewhere: a hop to its position')
})

test('the script read: what it cannot hold, said with its line', (t) => {
  t.exception(() => parse(''), /no steps/, 'empty')
  t.exception(() => parse('# scene: x\n. crud/read .\n'), /no steps/, 'a scene and no step')
  t.exception(() => parse('. crud/read .\n# step: x\n. crud/read .\n'), /line 1: .*before the first # step/, 'a line before any step')
  t.exception(() => parse('# step: x\n# expect: y\n'), /line 2: # expect: under a line/, 'an expect under no line')
  t.exception(() => parse('# step: x\ncrud/read\n'), /line 2: .*a position, then a command/, 'no position')
  t.exception(() => parse('# step: x\n--raw . info/get\n'), /line 2: .*an option of the haicc command/, 'an option of the terminal\'s')
  t.exception(() => parse('# step: x\n. crud/read .\n# scene: y\n. crud/read .\n'), /line 3: # scene: once, before the first step/, 'a scene after a step')
  t.exception(() => parse('# step: x\n# step: y\n. crud/read .\n'), /"x" has no line/, 'a step with no line')
  t.exception(() => parse('# needs: gpu\n# step: x\n. crud/read .\n'), /# needs: gpu, none such/, 'an unknown need')
  t.exception(() => parse('# step: x\n. crud/read \'oops\n'), /line 2: .*a quote not closed/, 'a quote not closed')
})

test('a how-to\'s key: <org>/<package>/<name>', (t) => {
  t.alike(keyOf('haiccing/base-package-crud/query'), { key: 'haiccing/base-package-crud/query', pkg: 'haiccing/base-package-crud', name: 'query', file: '/howto/query/steps.haicc' })
  t.exception(() => keyOf('base-package-crud/query'), /not a how-to/)
  t.exception(() => keyOf(undefined), /not a how-to: none/)
})

test('a line\'s answer and its checks: every fragment in it; a failure passes only when expected', (t) => {
  const line = { expects: ['"a":1'] }
  t.is(answerOf({ output: { a: 1 } }), '{"a":1}', 'its output, one line of JSON')
  t.is(answerOf({ error: 'nope' }), 'error: nope', 'its error')
  t.alike(checksOf(line, '{"a":1}'), { ok: true, checks: [{ expect: '"a":1', ok: true }] }, 'found')
  t.is(checksOf(line, '{"a":2}').ok, false, 'not found')
  t.is(checksOf({ expects: [] }, 'error: nope', true).ok, false, 'a failure nothing expects')
  t.is(checksOf({ expects: [] }, 'error: nope', true).failed, 'error: nope', 'said')
  t.is(checksOf({ expects: ['error: no'] }, 'error: nope', true).ok, true, 'a failure expected')
  t.is(checksOf({ expects: ['nope'] }, 'error: nope', true).ok, false, 'a fragment of it, not said to be the error: still failed')
})

// An mrepo as the runner sees it: its folder with the package's bundle,
// its request log (records added as the fake runtime answers), its inbox
// a function answering each command by what the scene holds.
function mrepo (script, scene) {
  const dir = mkdtempSync(join(tmpdir(), 'howto-'))
  mkdirSync(join(dir, 'packages', 'haiccing'), { recursive: true })
  const b = new Bundle()
  b.write('/howto/demo/steps.haicc', script)
  b.write('/howto/other/README.md', '# other\n')
  writeFileSync(join(dir, 'packages', 'haiccing', 'base-package-demo.bundle'), b.toBuffer())
  const done = new Map()
  const sent = []
  let clock = 0
  const own = async (parts, key) => {
    sent.push(parts.join(' '))
    const r = scene(parts)
    const form = { command: parts, ...r, log: [{ level: 'info', event: 'request.metrics', ms: 5 }] }
    done.set(key, { key, timestamp: String(clock++).padStart(4, '0'), value: form })
    return form
  }
  const logged = []
  const exec = {
    id: 'r-0',
    runtime: { dir, uri: 'local/howtos', own },
    wait: job => job(),
    log: (level, event, data) => logged.push([level, event, data]),
    select: async () => [...done.keys()].map(k => [`/request/done/${k}.json`, k]),
    bytes: async k => Buffer.from(JSON.stringify({ value: done.get(k) })),
    find: async p => { const k = p.split('/').pop().replace(/\.json$/, ''); return done.has(k) ? Buffer.from(JSON.stringify({ value: done.get(k) })) : null }
  }
  // a request of the runner's own, recorded as the runtime records it
  const ask = async (action, args, fn) => {
    const output = await fn(exec, { args })
    done.set(`h-${clock}`, { key: `h-${clock}`, timestamp: String(clock++).padStart(4, '0'), value: { protocol: 'howto', action, args, output } })
    return output
  }
  return { dir, exec, sent, logged, ask, close: () => rmSync(dir, { recursive: true, force: true }) }
}
const DEMO = `# scene: made
. crud/create swarms
# step: read
. crud/read swarms
# expect: "children":[]
# step: the host
host crud/read .
# expect: "host"
`
const answers = parts => {
  const c = parts.join(' ')
  if (c === 'crud/read .') return { output: [{ children: ['registry', 'swarms'] }] }
  if (c === 'crud/read registry') return { output: [{ children: ['local'] }] }
  if (c === 'crud/read * --flags layer=links') return { output: [{ value: { at: 'host', how: 'deployed' } }] }
  if (c === 'haicc host crud/read * --flags layer=links') return { output: [{ value: { at: 'node-1', how: 'deployed' } }, { value: { at: 'swarms/swarm-1/node-2', how: 'container' } }] }
  if (c.endsWith('--flags layer=links')) return { error: 'no protocol: crud' }
  if (c === 'crud/read swarms') return { output: [{ children: [] }] }
  if (c === 'haicc host crud/read .') return { output: { at: 'host' } }
  return { output: { ok: c } }
}

test('run: the scene thrown away, prepared, every step and its checks; each line a request, its key in the answer', async (t) => {
  const m = mrepo(DEMO, answers)
  try {
    const r = await m.ask('run', ['haiccing/base-package-demo/demo'], run)
    t.is(r.passed, true, 'passed')
    t.alike([r.steps, r.ran, r.needs], [2, 2, []], 'two steps, both run')
    t.alike(r.cleared, { torn: ['host/node-1', 'host/swarms/swarm-1/node-2', 'host'], removed: ['swarms'] }, 'thrown away first: what it deployed torn down from the inside out, main emptied but the registry')
    t.alike(m.sent.slice(0, 10), ['crud/read * --flags layer=links', 'haicc host crud/read * --flags layer=links', 'haicc host/node-1 crud/read * --flags layer=links', 'haicc host boot/teardown node-1', 'haicc host boot/teardown swarms/swarm-1/node-2', 'boot/teardown host', 'crud/read .', 'crud/read registry', 'crud/delete registry/local recurse', 'crud/delete swarms recurse'], 'by the links: a child\'s own first, a container\'s node not looked into, then the registry\'s nodes and main')
    t.alike(m.sent.slice(-3), ['crud/create swarms', 'crud/read swarms', 'haicc host crud/read .'], 'then the scene, then the steps, a hop where a line stands elsewhere')
    t.is(r.scene.title, 'made', 'the scene')
    t.alike(r.done.map(s => [s.title, s.ok]), [['read', true], ['the host', true]], 'each step')
    t.ok(r.done[0].lines[0].key, 'each line its request\'s key')
    t.alike(r.answer, ['haiccing/base-package-demo/demo: passed, 2 steps.'], 'in natural language')
    t.ok(m.logged.some(([l, e]) => l === 'verbose' && e === 'script'), 'logged')
  } finally { m.close() }
})

test('run: a line that does not pass ends it, what was expected and what it answered said', async (t) => {
  const m = mrepo(DEMO, parts => (parts.join(' ') === 'crud/read swarms' ? { output: [{ children: ['x'] }] } : answers(parts)))
  try {
    const r = await m.ask('run', ['haiccing/base-package-demo/demo'], run)
    t.is(r.passed, false, 'not passed')
    t.is(r.ran, 1, 'nothing after it')
    t.alike(r.answer, ['haiccing/base-package-demo/demo: not passed, at step 1: read.', 'Line 4: . crud/read swarms', '  expected: "children":[]', '  answered: [{"children":["x"]}]'], 'said')
    await t.exception(run(m.exec, { args: ['haiccing/base-package-demo/other'] }), /no how-to: haiccing\/base-package-demo\/other \(haiccing\/base-package-demo has demo\)/, 'no script: said, with those there are')
    await t.exception(run(m.exec, { args: ['haiccing/base-package-none/demo'] }), /no package here: haiccing\/base-package-none/, 'no package')
  } finally { m.close() }
})

test('step: one at a time, where it is read from the request log; the first prepares the scene; the end said', async (t) => {
  const m = mrepo(DEMO, answers)
  try {
    const one = await m.ask('step', ['haiccing/base-package-demo/demo'], step)
    t.alike([one.step, one.of, one.ok, one.next], [1, 2, true, 2], 'the first')
    t.ok(one.cleared && one.scene?.ok, 'with it, the scene thrown away and prepared')
    t.is(one.answer[0], 'haiccing/base-package-demo/demo: step 1 of 2, read: passed.', 'in natural language')
    const two = await m.ask('step', ['haiccing/base-package-demo/demo'], step)
    t.alike([two.step, two.next, 'cleared' in two], [2, null, false], 'the next, the scene as it is')
    await t.exception(step(m.exec, { args: ['haiccing/base-package-demo/demo'] }), /all 2 steps done/, 'past the last: said')
    await m.ask('reset', ['haiccing/base-package-demo/demo'], reset)
    t.is((await m.ask('step', ['haiccing/base-package-demo/demo'], step)).step, 1, 'after a reset, the first again')
  } finally { m.close() }
})

test('where stepping is: after a run, a reset, or another how-to\'s first step, the first; after a failed step, said', (t) => {
  const k = 'a/b/c'
  t.is(nextOf([], k), 1, 'nothing yet')
  t.is(nextOf([{ action: 'step', howto: k, output: { step: 1, ok: true } }], k), 2, 'after its first')
  t.is(nextOf([{ action: 'step', howto: k, output: { step: 1, ok: true } }, { action: 'run', howto: 'x/y/z', output: {} }], k), 1, 'a run since')
  t.is(nextOf([{ action: 'step', howto: k, output: { step: 2, ok: true } }, { action: 'step', howto: 'x/y/z', output: { step: 1, ok: true } }], k), 1, 'another\'s first step since')
  t.is(nextOf([{ action: 'step', howto: k, output: { step: 2, ok: true } }, { action: 'step', howto: 'x/y/z', output: { step: 3, ok: true } }], k), 3, 'another\'s later step: not the scene thrown away')
  t.exception(() => nextOf([{ action: 'step', howto: k, output: { step: 2, ok: false } }], k), /step 2 failed/, 'failed')
  t.is(nextOf([{ action: 'step', howto: k, output: { step: 2, ok: false } }, { action: 'reset', output: {} }], k), 1, 'a reset since')
})

test('report: the last run, from the request log: each line\'s answer whole and its time; as Markdown; stepped', async (t) => {
  const m = mrepo(DEMO, answers)
  try {
    await t.exception(report(m.exec, { args: ['haiccing/base-package-demo/demo'] }), /no run of haiccing\/base-package-demo\/demo here yet/, 'none yet')
    await m.ask('run', ['haiccing/base-package-demo/demo'], run)
    const r = await report(m.exec, { args: ['haiccing/base-package-demo/demo'] })
    t.alike([r.kind, r.passed, r.steps, r.ran], ['run', true, 2, 2], 'its run')
    t.alike(r.done[1].lines[0], { line: 'host crud/read .', n: 7, key: r.done[1].lines[0].key, answer: '{"at":"host"}', ok: true, checks: [{ expect: '"host"', ok: true }], ms: 5, changed: [] }, 'a line: its answer from its own record, its time')
    const md = await report(m.exec, { args: ['haiccing/base-package-demo/demo', 'md'] })
    t.ok(md.markdown.startsWith('# haiccing/base-package-demo/demo\n\nPassed: 2 of 2 steps, run,'), 'as a page')
    t.ok(md.markdown.includes('## Step 2: the host') && md.markdown.includes('- ok: "host"'), 'a section a step, its checks')
    await t.exception(report(m.exec, { args: ['haiccing/base-package-demo/demo', 'pdf'] }), /no format: pdf/, 'a format there is not')
    await m.ask('step', ['haiccing/base-package-demo/demo'], step)
    const s = await report(m.exec, { args: ['haiccing/base-package-demo/demo'] })
    t.alike([s.kind, s.ran, s.passed], ['stepped', 1, false], 'stepped since: what was done, not yet passed')
  } finally { m.close() }
})

test('the series a report reads: the last run, or the steps since the last first step', (t) => {
  const k = 'a/b/c'
  const recs = [{ action: 'run', howto: k, output: { passed: true } }, { action: 'step', howto: k, output: { step: 1 } }, { action: 'step', howto: k, output: { step: 2 } }]
  t.alike(seriesOf(recs, k).kind, 'stepped')
  t.is(seriesOf(recs, k).records.length, 2)
  t.is(seriesOf(recs.slice(0, 1), k).kind, 'run')
  t.is(seriesOf(recs, 'x/y/z'), null)
})

test('reset: the scene thrown away; a key that is none refused', async (t) => {
  const m = mrepo(DEMO, answers)
  try {
    const r = await m.ask('reset', [], reset)
    t.alike(r.cleared, { torn: ['host/node-1', 'host/swarms/swarm-1/node-2', 'host'], removed: ['swarms'] })
    t.is(r.howto, null)
    t.ok(r.answer[0].startsWith('The scene thrown away'))
    await t.exception(reset(m.exec, { args: ['nope'] }), /not a how-to: nope/)
  } finally { m.close() }
})
