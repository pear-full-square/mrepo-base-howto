// base-package-rns's protocol: rns, a swarm's lookup db on every node: who
// is registered, where each lives, who is active. Linked into an mrepo,
// its config is loaded by the runtime and its actions run. The config is
// the package's; the work is mrepo-base-rns's.
import { master, join, register, leave, resolve, status } from './modules/pear-full-square/mrepo-base-rns/index.js'

// Each action at the mrepo itself (`.`): the node whose rns it is.
const here = (description, rest = {}) => ({ uris: ['.'], ...rest, description })

export const protocols = {
  rns: {
    package: 'haiccing/base-package-rns',
    description: 'A swarm\'s lookup db on every node: its nodes by unique URI, where each lives, who is active by its lease; kept at the master, a replica on each node.',
    default: 'status',
    actions: {
      status: here('The swarm as this node\'s lookup db has it: the nodes registered, each active, quiet or not yet seen; when this node\'s replica was brought up to date.'),
      resolve: here('Where a node of the swarm lives, by its unique URI: its machine, its folder there, its key, its state.', { args: ['node'] }),
      master: here('The node made its swarm\'s master: the lookup db made here, itself registered in it; answers what a node needs to find it. Its arguments the swarm\'s name and a lease in seconds, 15 when none.', { args: ['swarm', 'lease?'] }),
      join: here('The node made a node of a swarm: told where its lookup db is, the master\'s lookup as rns/master answered it; answers what its creator registers it with.', { args: ['swarm', 'lookup'] }),
      register: here('A node registered in the lookup db by its creator, asked of the master: its unique URI, its key, where it lives, as its rns/join answered it.', { args: ['node'] }),
      leave: here('A node taken out of the lookup db, asked of the master: its unique URI.', { args: ['node'] })
    }
  }
}

export const actions = {
  rns: { master, join, register, leave, resolve, status }
}
