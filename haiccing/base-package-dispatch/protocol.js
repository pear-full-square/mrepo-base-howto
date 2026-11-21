// base-package-dispatch's protocol: dispatch, a command routed to the node
// of the swarm its unique URI names, resolved by rns. Linked into an
// mrepo, its config is loaded by the runtime and its actions run. The
// config is the package's; the work is mrepo-base-dispatch's.
import { send } from './modules/pear-full-square/mrepo-base-dispatch/index.js'

export const protocols = {
  dispatch: {
    package: 'haiccing/base-package-dispatch',
    description: 'Commands routed between the nodes of a swarm: to the node a unique URI names, resolved by the node\'s rns, delivered to it directly.',
    actions: {
      send: { uris: ['**'], target: true, args: ['command', 'arguments?'], description: 'A command sent to the node of the swarm its unique URI names (<swarm>/<node>; what follows it, a position in that node): resolved in this node\'s lookup db, delivered into its inbox folder on this machine, its answer this request\'s. haicc <unique URI> <command> at a node is it.' }
    }
  }
}

export const actions = {
  dispatch: { send }
}
