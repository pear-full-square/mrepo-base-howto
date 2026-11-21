// base-package-log's protocol: log, a node's log as a topic of its own,
// synced lazily to its swarm's master and read there across nodes.
// Linked into an mrepo, its config is loaded by the runtime and its
// actions run. The config is the package's; the work is mrepo-base-log's.
import { read, status } from './modules/pear-full-square/mrepo-base-log/index.js'

// Each action at the mrepo itself (`.`): the node whose log it is.
const here = (description, rest = {}) => ({ uris: ['.'], ...rest, description })

export const protocols = {
  log: {
    package: 'haiccing/base-package-log',
    description: 'A node\'s log: every completed request a record of a topic the node alone writes, synced lazily to its swarm\'s master; read there across nodes, in one view.',
    default: 'read',
    actions: {
      read: here('The log\'s records held here, the newest last: the node\'s own; on a swarm\'s master every node\'s in one view, one node\'s when its unique URI is given; the last 100, or the limit given.', { args: ['node?', 'limit?'] }),
      status: here('The node\'s log: its topic and its length, how far it is synced to the master; on the master the topics collected. With sync: the log synced now.', { args: ['sync?'] })
    }
  }
}

export const actions = {
  log: { read, status }
}
