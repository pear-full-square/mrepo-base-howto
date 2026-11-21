// status: log/status, the node's log: its topic, how far it is synced to
// the master; on the master the topics collected (README.md beside it).
import { existsSync } from 'bare-fs'
import { join } from 'bare-path'
import { socketOf } from 'p2p-local'
import { ask, SIDE, SOCKET } from '../../internal/client/index.js'

export async function status (exec, { args: [how] = [] } = {}) {
  const dir = exec.runtime.dir
  if (!dir) throw new Error('no directory in the context')
  if (how !== undefined && how !== 'sync') throw new Error(`not an argument of log/status: ${how} (sync: the log synced now, then its status)`)
  // (not started: answered, not refused: a status says what is there)
  if (!existsSync(socketOf(join(dir, SIDE), SOCKET))) { exec.log('verbose', 'not running', {}); return { running: false, length: 0, collected: [] } }
  const s = await ask(dir, { op: how === 'sync' ? 'sync' : 'status' }, { timeout: 30000 })
  exec.log('verbose', 'status', { length: s.length, collected: s.collected.length })
  return s
}
