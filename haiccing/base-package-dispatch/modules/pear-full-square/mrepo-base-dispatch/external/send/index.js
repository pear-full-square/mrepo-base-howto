// send: dispatch/send <unique URI> <command>, a command routed to the node
// of the swarm its unique URI names, resolved by rns; delivered into its
// inbox folder where it lives on this machine (README.md beside it).
import os from 'bare-os'
import { relative } from 'bare-path'
import { segmented, joined, within } from 'mycelium-uri'
import { lookup } from 'mrepo-base-rns'

const NAME = /^[a-z][a-z0-9-]*$/

// (swarm: the swarm as this node's lookup db has it, { resolve(uri) }: the
// node's rns; a test's in its place. machine: this machine's name)
export async function send (exec, { uri, args = [] }, { swarm = null, machine = os.hostname() } = {}) {
  const dir = exec.runtime.dir
  if (!dir) throw new Error('no directory in the context')
  const written = within('main', joined(segmented(uri ?? [])))
  if (!written || written === '.') throw new Error('missing argument: target (a node\'s unique URI: <swarm>/<node>)')
  if (!args.length) throw new Error('missing argument: command')
  const names = written.split('/')
  if (names.length < 2 || !names.every(n => NAME.test(n))) throw new Error(`not a unique URI: ${written} (<swarm>/<node>)`)
  const rns = swarm ?? lookup(dir)
  // The node it names: the shortest path there that is registered (no
  // unique URI is a prefix of another's); what follows it, a position in
  // that node, the command goes on to.
  let node = null
  let rest = ''
  for (let i = 2; i <= names.length && !node; i++) {
    // catch: not registered by that path: the next longer one; anything else thrown on
    try { node = await rns.resolve(names.slice(0, i).join('/')); rest = names.slice(i).join('/') } catch (err) { if (!/^not registered/.test(err.message)) throw err }
  }
  if (!node) throw new Error(`no node of the swarm by that unique URI: ${written} (rns/status says who is registered)`)
  const command = rest ? ['haicc', rest, ...args] : args
  exec.log('verbose', 'resolved', { uri: node.uri, machine: node.machine, state: node.state, rest: rest || null })
  // this node itself: executed here
  if (node.uri === exec.runtime.uri) {
    exec.log('info', 'dispatched', { to: node.uri, how: 'here' })
    return exec.run(command)
  }
  // The route: on this machine the folder drop, into its inbox, its answer
  // from its outbox; the master is not on it. Another machine: not built.
  if (node.machine !== machine) throw new Error(`not reachable yet: ${node.uri} lives on ${node.machine} (the route to another machine is not built)`)
  exec.log('info', 'dispatched', { to: node.uri, how: 'folder', state: node.state })
  return exec.forward({ at: written, mrepo: node.uri, folder: relative(dir, node.folder), dir: node.folder }, command)
}
