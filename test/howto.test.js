// The howto protocol: a how-to read from its README, the rules on its
// form, the layer extracted from packages written here as bundles, and
// the actions on an execution written for them (its files by path, its
// writes applied at once).
import test from 'brittle'
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'bare-fs'
import { join } from 'bare-path'
import { tmpdir } from 'bare-os'
import Bundle from 'bare-bundle'
import { parse, check, extract, get, extractAction, CONFIG, FOLDER, LAYER } from '../index.js'

const B = v => Buffer.from(JSON.stringify(v))
const J = b => JSON.parse(b.toString())
const DEPLOY = `# deploy

Deploys a node in a swarm of this host and brings it into service.

Activity: node

## Steps

\`\`\`sh
# the swarm's place, in this mrepo's main
haicc . crud/create swarms/swarm-1
# the node, deployed below it,
# from the haicc component
haicc . boot/deploy swarms/swarm-1/node-1 base-component-haicc
# the check: the node answers
haicc swarms/swarm-1/node-1 crud/read .
\`\`\`
`
const REPLICA = DEPLOY.replace('# deploy', '# replica').replace('Deploys a node in a swarm of this host and brings it into service.', 'Gives a node its replica in a container.').replace('Activity: node', 'Activity: container')

test('a how-to read: its title, its one-liner, its activity, its steps, each with why', (t) => {
  const h = parse(DEPLOY)
  t.alike([h.title, h.oneliner, h.activity], ['deploy', 'Deploys a node in a swarm of this host and brings it into service.', 'node'], 'its title, its one-liner, its activity')
  t.alike(h.steps, [
    { why: 'the swarm\'s place, in this mrepo\'s main', command: 'haicc . crud/create swarms/swarm-1' },
    { why: 'the node, deployed below it, from the haicc component', command: 'haicc . boot/deploy swarms/swarm-1/node-1 base-component-haicc' },
    { why: 'the check: the node answers', command: 'haicc swarms/swarm-1/node-1 crud/read .' }
  ], 'its steps: each command as typed, the # lines above it its why, joined')
  t.alike([h.problems, check(DEPLOY)], [[], []], 'nothing against its form')
})

test('the rules on its form: each said', (t) => {
  const said = text => check(text).map(([c, d]) => `${c}: ${d}`)
  t.alike(said(DEPLOY.replace('Activity: node\n', '')), ['activity: no Activity line (Activity: <word>)'], 'no activity')
  t.alike(said(DEPLOY.replace('Activity: node', 'Activity: node\nActivity: host')), ['activity: more than one Activity line'], 'two')
  t.alike(said(DEPLOY.replace('Activity: node', 'Activity: Swarm Nodes')), ['activity: not a word: Swarm Nodes (lowercase letters, digits, hyphens)'], 'an activity that is no word')
  t.alike(said('# x\n\nOne.\n\nActivity: node\n'), ['steps: no sh block: its steps'], 'no steps')
  t.alike(said(DEPLOY + '\n```sh\n# the check: again\nhaicc . crud/read .\n```\n'), ['steps: 2 sh blocks: one, its steps'], 'two blocks')
  t.alike(said(DEPLOY.replace('haicc . crud/create swarms/swarm-1', 'mkdir swarms')), ['steps: not a haicc command: mkdir swarms'], 'a command that is not haicc\'s')
  t.alike(said(DEPLOY.replace('# the swarm\'s place, in this mrepo\'s main\n', '')), ['steps: no why above: haicc . crud/create swarms/swarm-1'], 'a command without its why')
  t.alike(said(DEPLOY.replace('# the check: the node answers', '# the node answers')), ['steps: its last step is not the check (its why starts with "the check"): haicc swarms/swarm-1/node-1 crud/read .'], 'the last step not the check')
  t.alike(said(DEPLOY.replace('haicc swarms/swarm-1/node-1 crud/read .\n```', '```')), ['steps: a why with no command below: the check: the node answers', 'steps: its last step is not the check (its why starts with "the check"): haicc . boot/deploy swarms/swarm-1/node-1 base-component-haicc'], 'a why with nothing below it')
  t.alike(said('# x\n\nOne.\n\nActivity: node\n\n```sh\n```\n'), ['steps: no step'], 'an empty block')
  t.alike(said('# x\n\nOne.\n\nActivity: node\n\n```sh\n# the check: it\nhaicc . crud/read .\n'), ['steps: its sh block is not closed', 'steps: no sh block: its steps'], 'a block not closed')
})

test('the layer from the packages\' how-tos: the index by activity, a document a how-to, the problems', (t) => {
  const out = extract([
    { pkg: 'haiccing/a', files: { '/howto/deploy/README.md': Buffer.from(DEPLOY), '/howto/replica/README.md': Buffer.from(REPLICA), '/howto/README.md': Buffer.from('# howto/\n\nThe how-tos.\n') } },
    { pkg: 'haiccing/b', files: { '/howto/deploy/README.md': Buffer.from(DEPLOY), '/howto/Bad/README.md': Buffer.from(DEPLOY), '/howto/broken/README.md': Buffer.from(DEPLOY.replace('Activity: node\n', '')), '/howto/join/README.md': Buffer.from(DEPLOY.replace('# deploy', '# join')) } }
  ])
  t.alike(Object.keys(out).sort(), ['/container/replica.json', '/index.json', '/node/deploy.json', '/node/join.json', '/problems.json'], 'its files: the index, the problems, a document a how-to at <activity>/<name>')
  t.alike(J(out['/index.json']), {
    container: [{ howto: 'container/replica', oneliner: 'Gives a node its replica in a container.', package: 'haiccing/a' }],
    node: [{ howto: 'node/deploy', oneliner: 'Deploys a node in a swarm of this host and brings it into service.', package: 'haiccing/a' }, { howto: 'node/join', oneliner: 'Deploys a node in a swarm of this host and brings it into service.', package: 'haiccing/b' }]
  }, 'the index: the activities in order, each with its how-tos, their one-liners and their packages')
  const d = J(out['/node/deploy.json'])
  t.alike([d.howto, d.title, d.activity, d.package, d.help, d.steps.length, d.steps[2].why], ['node/deploy', 'deploy', 'node', 'haiccing/a', 'packages/haiccing/a/howto/deploy', 3, 'the check: the node answers'], 'a how-to: its address, its package, where its README is in the help layer, its steps')
  t.alike(J(out['/problems.json']), [
    { package: 'haiccing/b', howto: 'Bad', check: 'name', detail: 'not a name: Bad (lowercase letters, digits, hyphens)' },
    { package: 'haiccing/b', howto: 'broken', check: 'activity', detail: 'no Activity line (Activity: <word>)' },
    { package: 'haiccing/b', howto: 'deploy', check: 'name', detail: 'node/deploy is another package\'s too' }
  ], 'the problems: a name that is none, a how-to without its activity, one two packages bring; each left out')
  t.alike(Object.keys(extract([])).sort(), ['/index.json', '/problems.json'], 'no packages: an empty index, no problems')
  t.alike([FOLDER, LAYER], ['howto', 'howto'], 'the folder in a package, the layer in an mrepo')
})

// An execution as an action sees it: its files by path, its writes
// applied at once; the mrepo's folder, its packages' bundles in it.
function execution (files = {}, dir = null) {
  const abs = p => (p.startsWith('/') ? p : `/${p}`)
  const writes = []
  const exec = {
    runtime: { dir },
    read: async p => { if (!(abs(p) in files)) throw new Error(`nothing at ${p}`); return files[abs(p)] },
    find: async function (p) { try { return await this.read(p) } catch { return null } },
    log: function (level, event, data = {}) { (this.entries ??= []).push({ level, event, ...data }) },
    step: async function (event, data, fn, level = 'verbose') { const r = await fn(); (this.entries ??= []).push({ level, event, ...(typeof data === 'function' ? data(r) : data) }); return r },
    put: (p, bytes) => { writes.push(['put', abs(p)]); files[abs(p)] = Buffer.from(bytes) },
    remove: p => { writes.push(['remove', abs(p)]); delete files[abs(p)] }
  }
  return { exec, files, writes }
}
// A package's bundle in an mrepo's packages/: its files by path.
function bundle (dir, pkg, files) {
  const b = new Bundle()
  for (const [p, text] of Object.entries(files)) b.write(p, Buffer.from(text))
  mkdirSync(join(dir, 'packages', pkg.split('/')[0]), { recursive: true })
  writeFileSync(join(dir, 'packages', `${pkg}.bundle`), b.toBuffer())
}

test('extract: the layer written, changed only when the how-tos did; one that is gone removed', async (t) => {
  const dir = mkdtempSync(join(tmpdir(), 'howto-'))
  try {
    bundle(dir, 'haiccing/a', { '/README.md': '# a\n\nA.\n', '/howto/README.md': '# howto/\n\nThe how-tos.\n', '/howto/deploy/README.md': DEPLOY, '/howto/replica/README.md': REPLICA, '/howto/deploy/more/README.md': DEPLOY })
    bundle(dir, 'haiccing/b', { '/README.md': '# b\n\nB.\n' })
    const { exec, files, writes } = execution({ '/packages/manifest.json': B({ packages: { 'haiccing/a': {}, 'haiccing/b': {}, 'haiccing/not-placed': {} } }) }, dir)
    t.alike(await extractAction(exec, { uri: ['.'] }), { howtos: 2, activities: ['container', 'node'], changed: true, problems: 0 }, 'extract: what it found: the how-tos, their activities, no problem')
    t.alike(Object.keys(files).filter(p => p.startsWith('/howto/')).sort(), ['/howto/container/replica.json', '/howto/index.json', '/howto/layer.json', '/howto/node/deploy.json', '/howto/problems.json'], 'the layer: its config, the index, the problems, a document a how-to; a folder below a how-to is none')
    t.alike(exec.entries.filter(e => e.level === 'info').map(e => [e.event, e.howtos]), [['extracted', 2]], 'what it did, at info')
    const n = writes.length
    t.alike([await extractAction(exec, { uri: ['main', '.'] }), writes.length], [{ howtos: 2, activities: ['container', 'node'], changed: false, problems: 0 }, n], 'again: nothing changed, nothing written')
    // a how-to gone from its package, another against its form
    bundle(dir, 'haiccing/a', { '/howto/deploy/README.md': DEPLOY, '/howto/broken/README.md': DEPLOY.replace('Activity: node\n', '') })
    exec.entries = []
    t.alike(await extractAction(exec, { uri: ['.'] }), { howtos: 1, activities: ['node'], changed: true, problems: 1 }, 'the packages changed: one how-to gone, one against its form: counted, not thrown')
    t.alike([files['/howto/container/replica.json'], J(files['/howto/problems.json']).map(p => p.howto), exec.entries.at(-1).level], [undefined, ['broken'], 'warn'], 'the one that is gone removed from the layer; the problem kept, and a warning')
    await t.exception(extractAction(exec, { uri: ['main', 'swarms'] }), /howto extract: the whole mrepo only/)
    t.alike(await extractAction(execution({}, dir).exec, { uri: ['.'] }), { howtos: 0, activities: [], changed: false, problems: 0 }, 'an mrepo without a packages manifest: nothing')
  } finally { rmSync(dir, { recursive: true, force: true }) }
})

test('get: the activities, an activity, one how-to; not found said, not thrown', async (t) => {
  const layer = extract([{ pkg: 'haiccing/a', files: { '/howto/deploy/README.md': Buffer.from(DEPLOY), '/howto/replica/README.md': Buffer.from(REPLICA) } }])
  const { exec } = execution(Object.fromEntries(Object.entries(layer).map(([p, b]) => [`/howto${p}`, b])))
  const activities = [{ activity: 'container', howtos: [{ howto: 'container/replica', oneliner: 'Gives a node its replica in a container.' }] }, { activity: 'node', howtos: [{ howto: 'node/deploy', oneliner: 'Deploys a node in a swarm of this host and brings it into service.' }] }]
  t.alike(await get(exec, {}), { activities }, 'nothing asked: what can be done here: the activities, each with its how-tos\' one-liners')
  t.alike(await get(exec, { args: ['node'] }), { activity: 'node', howtos: [{ howto: 'node/deploy', oneliner: 'Deploys a node in a swarm of this host and brings it into service.', package: 'haiccing/a' }] }, 'an activity: its how-tos, each with its package')
  const one = await get(exec, { args: ['node/deploy'] })
  t.alike([one.howto, one.title, one.activity, one.package, one.help, one.steps.map(s => s.command)], ['node/deploy', 'deploy', 'node', 'haiccing/a', 'packages/haiccing/a/howto/deploy', ['haicc . crud/create swarms/swarm-1', 'haicc . boot/deploy swarms/swarm-1/node-1 base-component-haicc', 'haicc swarms/swarm-1/node-1 crud/read .']], 'one how-to: its steps as typed commands, where its README is in the help')
  exec.entries = []
  t.alike(await get(exec, { args: ['pipeline'] }), { asked: 'pipeline', found: false, why: 'no activity pipeline here', activities }, 'a word that is no activity here: said, with those that are')
  t.alike(exec.entries.map(e => [e.level, e.event]), [['warn', 'not found']], 'a warning in the log, no error')
  t.alike((await get(exec, { args: ['node/join'] })).why, 'no how-to node/join here (node/deploy)', 'a how-to that is not there: said, with those of its activity')
  t.alike((await get(exec, { args: ['node/deploy/more'] })).why, 'not an activity or a how-to: node/deploy/more (<activity>, or <activity>/<name>)')
  await t.exception(get(execution().exec, {}), /no how-tos extracted in this mrepo yet \(howto\/extract\)/, 'nothing extracted yet: said')
})

test('the config: get the default action, both at the mrepo itself', (t) => {
  t.alike([CONFIG.default, Object.keys(CONFIG.actions)], ['get', ['get', 'extract']], 'get and extract; howto alone is howto/get')
  for (const [name, a] of Object.entries(CONFIG.actions)) {
    t.alike(a.uris, ['.'], `${name}: at the mrepo itself`)
    t.ok(a.description, `${name}: described`)
  }
  t.alike([CONFIG.actions.get.args, 'args' in CONFIG.actions.extract], [['what?'], false], 'get: what is asked, optional; extract: no argument')
})
