// client: the node's log asked: its program, over its socket in the
// mrepo's folder (README.md beside it).
import { join } from 'bare-path'
import { socketOf, request } from 'p2p-local'

// The log's side of an mrepo's folder: its store, its socket.
export const SIDE = 'log'
export const SOCKET = 'log'

// The node's own program asked: { op, ... } -> its answer. Not running:
// said, with how it is started.
export async function ask (dir, body, { timeout = 10000 } = {}) {
  // catch: no program behind the socket: said as not running, the cause kept
  try { return await request(socketOf(join(dir, SIDE), SOCKET), body, { timeout }) } catch (err) {
    if (/^not reachable/.test(err.message)) throw new Error('the log is not running here (its program starts with the service: service/start)', { cause: err })
    throw err
  }
}
