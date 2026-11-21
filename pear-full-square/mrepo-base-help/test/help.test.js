import test from 'brittle'
import { annotate } from '../index.js'

// An mrepo as an execution reads it: its files by path; its runtime's
// view: the protocols loaded, read access.
function execution ({ protocols, active = Object.keys(protocols), service = { state: 'started' }, info = true }) {
  const files = new Map()
  for (const p of active) files.set(`/protocols/${p}.json`, '{}')
  if (service) files.set('/runtime/service.json', JSON.stringify(service))
  if (info) {
    files.set('/info/index.json', JSON.stringify({ 'crud/read': [{ page: 'packages/haiccing/base-package-crud/read/README.md', oneliner: 'Reads the nodes at a URI.', below: [] }] }))
    files.set('/info/packages/haiccing/base-package-crud/read/README.md', '# read\n\nReads the nodes at a URI.\n')
  }
  const find = async p => (files.has(p) ? Buffer.from(files.get(p)) : null)
  const read = async p => { if (!files.has(p)) throw new Error(`not found: ${p}`); return Buffer.from(files.get(p)) }
  const select = async pattern => [...files.keys()].filter(p => p.startsWith(pattern.replace(/\*$/, ''))).map(p => [p])
  const logged = []
  return { logged, runtime: { protocols, find, read, select }, find, read, select, log: (level, event, data) => logged.push([level, event, data]) }
}
const PROTOCOLS = {
  crud: { default: 'read', actions: { read: { uris: ['**'], description: 'The nodes at a URI, read.' }, create: { uris: ['**'], args: ['value', 'kind?'], description: 'A node made.' } } },
  service: { actions: { start: { uris: ['.'], states: ['initialised'], description: 'The service started.' } } },
  help: { default: 'annotate', actions: { annotate: { uris: ['**'], args: ['command', 'arguments?'] } } }
}

test('annotate: a command explained on an execution written for it: what it does, the door here and now, its arguments, the commands to run it and read more', async (t) => {
  const exec = execution({ protocols: PROTOCOLS })
  const a = await annotate(exec, { uri: ['main', 'swarms'], args: ['crud/read'] })
  t.alike(a, { help: 'crud/read swarms', does: 'The nodes at a URI, read.', door: 'taken here, now', arguments: 'none', run: 'crud/read swarms', more: 'info/get crud/read', answer: ['crud/read swarms: The nodes at a URI, read.', 'Taken here, now.', 'Arguments: none.', 'To run it: crud/read swarms', 'To read more: info/get crud/read'] }, 'each a short line in a fixed place: the command, what it does, the door, its arguments, to run it, to read more; the same in natural language')
  t.is((await annotate(exec, { uri: ['main', 'swarms'], args: ['crud'] })).help, 'crud/read swarms', 'the protocol alone: its default action')
  t.is((await annotate(exec, { uri: ['main', 'x'], args: ['crud/create', '{}'] })).arguments, 'value [kind]', 'the arguments its action names, an optional one in brackets')
  t.is((await annotate(exec, { uri: ['main', 'x'], args: ['crud/read'], flags: { log: 'debug' } })).run, 'crud/read x --flags log=debug', 'its other flags kept in the command to run it')
  t.is((await annotate(exec, { uri: ['main', 'x'], args: ['crud/create', 'a b'] })).run, 'crud/create x "a b"', 'an argument with a space quoted, as typed')
  t.ok(exec.logged.some(([level, event]) => level === 'verbose' && event === 'annotated'), 'what it did, logged')
})

test('annotate: refused at the door, each reason; no page here; no command given', async (t) => {
  const exec = execution({ protocols: PROTOCOLS, active: ['crud', 'help'] })
  const nope = await annotate(exec, { uri: ['main', 'x'], args: ['nope/read'] })
  t.alike([nope.door, nope.more], ['refused here: no protocol: nope (crud, help)', 'info/get'], 'a protocol not loaded here; to read more, the top')
  const update = await annotate(exec, { uri: ['main', 'x'], args: ['crud/update'] })
  t.alike([update.door, update.does, update.more], ['refused here: no action: crud update (create, read)', null, 'info/get crud'], 'an action it does not offer: nothing it does; to read more, its protocol\'s page')
  t.is((await annotate(exec, { uri: ['main', 'x'], args: ['service/start'] })).door, 'refused here: not offered: service start at x', 'not offered at that URI')
  t.is((await annotate(exec, { uri: ['main', '.'], args: ['service/start'] })).door, 'refused here: not now: service start (service is not active; the service is started)', 'not active here')
  const later = execution({ protocols: PROTOCOLS })
  t.is((await annotate(later, { uri: ['main', '.'], args: ['service/start'] })).door, 'refused here: not now: service start (the service is started)', 'not in this state')
  const lacking = await annotate(later, { uri: ['main', 'x'], args: ['crud/create'] })
  t.alike([lacking.door, lacking.arguments], ['refused here: missing argument: value', 'value [kind]; missing: value'], 'an argument missing: refused, and said with its arguments')
  const bare = execution({ protocols: PROTOCOLS, info: false })
  const none = await annotate(bare, { uri: ['main', 'x'], args: ['service/start'] })
  t.is(none.does, 'The service started.', 'no info here: its description still')
  t.ok(bare.logged.some(([level, event, d]) => event === 'no page' && /no info extracted/.test(d.why)), 'no page: said in its log, not thrown')
  await t.exception(annotate(later, { uri: ['main', 'x'], args: [] }), /missing argument: command/)
  await t.exception(annotate(later, { uri: ['main', 'x'], args: ['--flags'] }), /missing argument: command/, 'no command, a word that is none')
})
