// read: log/read [node] [limit], the log's records held here: the node's
// own; on the master every node's, in one view, one node's when asked
// (README.md beside it).
import { ask } from '../../internal/client/index.js'

export async function read (exec, { args: [node, limit] = [] }) {
  const dir = exec.runtime.dir
  if (!dir) throw new Error('no directory in the context')
  // (a number alone: the limit, every node)
  if (limit === undefined && /^\d+$/.test(node ?? '')) { limit = node; node = undefined }
  const n = limit === undefined ? 100 : Number(limit)
  if (!Number.isInteger(n) || n < 1) throw new Error(`not a limit: ${limit} (a number of records, 1 or more)`)
  const r = await ask(dir, { op: 'read', node: node === undefined || node === '*' ? null : node, limit: n })
  exec.log('verbose', 'read', { node: node ?? null, nodes: r.nodes.length, records: r.records.length })
  return r
}
