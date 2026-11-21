# base-package-dispatch

The dispatch protocol: a command routed to the node of the swarm its unique URI names, resolved by rns.

Every node of a swarm lists it. At a node, `haicc swarm-1/node-2
<protocol>/<action>` names another node by its unique URI: no position
of this node's, so it is dispatched, `dispatch/send`: the other node
found in this node's own lookup db (`rns`), the command delivered to it
directly, its answer brought back. The swarm's master is not on the
path.

## Links

- [send](modules/pear-full-square/mrepo-base-dispatch/external/send/)
- [howto](howto/)
- [test](test/)
- [test-reports](test-reports/)
- [modules](modules/)

## Config

The `dispatch` protocol's, in `protocol.js`.

| action | at | arguments |
|---|---|---|
| `send` | a node's unique URI, `swarm-1/node-2`; what follows it a position there | the command, then its arguments |

## Routes

- **The same machine**: the folder drop: the command written into the
  other node's inbox folder, its answer read from its outbox folder.
- **Another machine**: not built; refused, naming the machine.
- **Beyond the swarm**: not built.

## Package

- `protocol.js`: the `dispatch` protocol, its config and its action,
  from `mrepo-base-dispatch`.
- `main.js`: the dispatcher, the bundle's main, generated.
