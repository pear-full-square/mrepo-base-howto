// mrepo-base-log: its documented methods, a directory each (README.md beside each).
//   external/   the log protocol's actions: read, status
//   internal/   entry: a completed request as a log record
//               program: the node's log as its own process: its topic
//               written from its outbox, synced to the master; the
//               master's replicas of the other nodes'
//               client: the node's log asked (ask, SIDE)
export { read } from './external/read/index.js'
export { status } from './external/status/index.js'
export { recordOf } from './internal/entry/index.js'
export { serve, program } from './internal/program/index.js'
export { ask, SIDE, SOCKET } from './internal/client/index.js'
