import test from 'brittle'
import { send } from '../index.js'

// An execution as an action sees it: the mrepo's folder and unique URI;
// what it sent on, what it ran here, its log.
function execution (uri = 'swarm-1/node-1') {
  const e = { runtime: { dir: '/work/mrepos/swarm-1/node-1', uri }, entries: [], forwarded: null, ran: null, log (level, event, data = {}) { e.entries.push({ level, event, ...data }) }, forward (to, command) { e.forwarded = { to, command }; return null }, run: async command => { e.ran = command; return { ran: command } } }
  return e
}
// The swarm as the node's rns would say it.
const NODES = { 'swarm-1/master': { machine: 'here', folder: '/work/mrepos/swarm-1/master', state: 'active' }, 'swarm-1/node-1': { machine: 'here', folder: '/work/mrepos/swarm-1/node-1', state: 'active' }, 'swarm-1/node-2': { machine: 'here', folder: '/work/mrepos/swarm-1/node-2', state: 'quiet' }, 'swarm-1/far': { machine: 'elsewhere', folder: '/x', state: 'active' } }
const asked = []
const swarm = { resolve: async uri => { asked.push(uri); if (!NODES[uri]) throw new Error(`not registered: ${uri}`); return { uri, role: 'node', ...NODES[uri] } } }
const how = { swarm, machine: 'here' }

test('a command routed to a node of the swarm: resolved by rns, dropped into its inbox folder on this machine', async (t) => {
  const exec = execution()
  t.is(await send(exec, { uri: ['main', 'swarm-1/node-2'], args: ['crud/read', '.'] }, how), null, 'sent on: the request waits for its answer')
  t.alike(exec.forwarded, { to: { at: 'swarm-1/node-2', mrepo: 'swarm-1/node-2', folder: '../node-2', dir: '/work/mrepos/swarm-1/node-2' }, command: ['crud/read', '.'] }, 'to the node\'s own folder, as rns resolved it, from this mrepo\'s; the command as it is')
  t.ok(exec.entries.some(e => e.level === 'info' && e.event === 'dispatched' && e.to === 'swarm-1/node-2' && e.how === 'folder'), 'said in its log: dispatched, by the folder')
  t.absent(asked.includes('swarm-1/master'), 'the master not asked: it is not on the path')
})

test('what follows the unique URI goes on with the command; this node itself; another machine; none', async (t) => {
  const below = execution()
  await send(below, { uri: ['main', 'swarm-1/node-2/notes/a'], args: ['crud/read', '.'] }, how)
  t.alike(below.forwarded.command, ['haicc', 'notes/a', 'crud/read', '.'], 'a position below the node: the command goes on to it there')
  const self = execution()
  t.alike(await send(self, { uri: ['main', 'swarm-1/node-1'], args: ['info/get'] }, how), { ran: ['info/get'] }, 'this node itself: executed here')
  t.is(self.forwarded, null)
  await t.exception(send(execution(), { uri: ['main', 'swarm-1/far'], args: ['info/get'] }, how), /not reachable yet: swarm-1\/far lives on elsewhere \(the route to another machine is not built\)/)
  await t.exception(send(execution(), { uri: ['main', 'swarm-1/nope'], args: ['info/get'] }, how), /no node of the swarm by that unique URI: swarm-1\/nope/)
  await t.exception(send(execution(), { uri: ['main', 'node-2'], args: ['info/get'] }, how), /not a unique URI: node-2/)
  await t.exception(send(execution(), { uri: ['main', '.'], args: ['info/get'] }, how), /missing argument: target/)
  await t.exception(send(execution(), { uri: ['main', 'swarm-1/node-2'], args: [] }, how), /missing argument: command/)
  await t.exception(send(execution(), { uri: ['main', 'swarm-1/node-2'], args: ['x/y'] }, { swarm: { resolve: async () => { throw new Error('rns is not running here') } }, machine: 'here' }), /rns is not running here/, 'its rns not answering: said, not taken for not registered')
})
