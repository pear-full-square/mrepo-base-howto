// base-package-swarm's protocol: swarm, a host's node management: a swarm
// made with its master, its nodes deployed into it and registered. Linked
// into an mrepo, its config is loaded by the runtime and its actions run.
// The config is the package's; the work is mrepo-base-swarm's.
import { create, deploy, leave, status } from './modules/pear-full-square/mrepo-base-swarm/index.js'

// A target is needed: a position below main, the swarm's or a node's.
const AT = { uris: ['**'], target: true }

export const protocols = {
  swarm: {
    package: 'haiccing/base-package-swarm',
    description: 'A host\'s node management for swarms: a swarm made with its master and its lookup db, nodes deployed into it, each registered by the host that created it.',
    actions: {
      create: { ...AT, args: ['lease?'], description: 'A swarm made at a position: its node, its kind swarm; its master deployed below it, brought into service and made the master; where its lookup db is written into the swarm\'s node. Its argument a lease in seconds, 15 when none.' },
      deploy: { ...AT, description: 'A node deployed at a position below a swarm made here, brought into service, told where the swarm\'s lookup db is, and registered in it by this mrepo, its creator.' },
      leave: { ...AT, description: 'A node of a swarm taken out of its lookup db and torn down.' },
      status: { ...AT, description: 'A swarm as its master\'s lookup db has it: the nodes registered, each active, quiet or not yet seen.' }
    }
  }
}

export const actions = {
  swarm: { create, deploy, leave, status }
}
