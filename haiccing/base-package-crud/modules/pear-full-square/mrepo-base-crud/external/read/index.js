// read: crud/read <URI>, the nodes a URI selects (README.md beside it).
import { modeOf } from 'mrepo-base-request'
import { readingOf } from 'mrepo-base-xpath'
import { place, select, slice } from '../../internal/node/index.js'

// A node set's data as it is given: an argument, JSON or the object itself.
const given = arg => {
  if (arg === undefined || arg === null || arg === '') return null
  if (typeof arg === 'object') return arg
  // catch: not JSON: said as what it is
  try { return JSON.parse(arg) } catch (cause) { throw new Error('not a node set: its data, JSON (what a read answered: its nodeset)', { cause }) }
}

// (how the URI is read: its flags say, logical, a topic as its records, or
// physical, as its layer is stored; none: the mrepo's setting)
// A topic read logically answers its node set and one slice of its nodes,
// { nodeset, nodes }: it may hold more than anyone wants. Given a node
// set's data (its argument: what an earlier read answered), its next
// slice. Anything else answers all it selects, an array.
// log: in select and slice (../../internal/node/index.js): each node; the query's steps in mrepo-base-xpath
export async function read (exec, { uri, args = [], flags = {} }) {
  const nodeset = given(args[0])
  const mode = modeOf(flags, await readingOf(exec))
  if (!nodeset && mode !== 'logical') return (await select(exec, place(uri), { mode })).map(s => s.node)
  const one = await slice(exec, place(uri), { mode, nodeset })
  // (what is no topic: one slice, all of it: answered as ever)
  if (!nodeset && one.nodeset?.logical?.mode !== 'logical') return one.nodes.map(s => s.node)
  return { nodeset: one.nodeset, nodes: one.nodes.map(s => s.node) }
}
