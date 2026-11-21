# base-package-rns

The rns protocol: a swarm's lookup db on every node, who is registered, where each lives, who is active.

Every node of a swarm lists it. The swarm's master keeps the lookup db;
each node holds a replica and answers from it: `rns/status`, the nodes
registered and whether each is active; `rns/resolve`, where a node
lives. A node is registered by the mrepo that created it and stays
active while its own rns renews its lease. The package is also a
program: the node's rns as a process, started by the node's `start`
hook.

## Links

- [status](modules/pear-full-square/mrepo-base-rns/external/status/)
- [resolve](modules/pear-full-square/mrepo-base-rns/external/resolve/)
- [master](modules/pear-full-square/mrepo-base-rns/external/master/)
- [join](modules/pear-full-square/mrepo-base-rns/external/join/)
- [register](modules/pear-full-square/mrepo-base-rns/external/register/)
- [leave](modules/pear-full-square/mrepo-base-rns/external/leave/)
- [types](types/)
- [howto](howto/)
- [test](test/)
- [test-reports](test-reports/)
- [modules](modules/)

## Config

The `rns` protocol's, in `protocol.js`; each action at the mrepo itself
(`.`).

| action | arguments | asked of |
|---|---|---|
| `status`, the default | none | any node |
| `resolve` | a node's unique URI | any node |
| `master` | the swarm's name, a lease in seconds | the node made the master |
| `join` | the swarm's name, the master's lookup | a node, by its creator |
| `register` | the node, as its `join` answered it | the master, by the node's creator |
| `leave` | a node's unique URI | the master |

## Program

`run.js`: the node's rns served until its runtime ends. A node's `start`
hook starts it, `runtime/start . packages/haiccing/base-package-rns`,
its `stop` hook ends it: a node stopped renews no lease and goes quiet.

## Not built

- The route to a master on another machine: the lookup db names each
  node's machine; only this machine's are reached.
- More than one master; a node's key kept anywhere but in its store, in
  clear.
- Applications in the lookup db.

## Package

- `protocol.js`: the `rns` protocol, its config and its actions, from
  `mrepo-base-rns`.
- `run.js`: its program.
- `main.js`: the dispatcher, the bundle's main, generated.
