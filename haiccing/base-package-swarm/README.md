# base-package-swarm

The swarm protocol: a host's node management, a swarm made with its master, nodes deployed into it and registered.

Listed by the haicc mrepo, used on a host: `swarm/create` makes a swarm
at a position with its master and its lookup db; `swarm/deploy` deploys
a node below it, brings it into service and registers it; `swarm/status`
says who is registered and active; `swarm/leave` takes a node out. The
nodes are the cell, `haiccing/base-component-node`; what they run is
theirs (`base-package-rns`).

## Links

- [create](modules/pear-full-square/mrepo-base-swarm/external/create/)
- [deploy](modules/pear-full-square/mrepo-base-swarm/external/deploy/)
- [status](modules/pear-full-square/mrepo-base-swarm/external/status/)
- [leave](modules/pear-full-square/mrepo-base-swarm/external/leave/)
- [types](types/)
- [howto](howto/)
- [test](test/)
- [test-reports](test-reports/)
- [modules](modules/)

## Config

The `swarm` protocol's, in `protocol.js`; each action at a position
below `main`.

| action | at | arguments |
|---|---|---|
| `create` | the swarm's position, `swarms/swarm-1` | a lease in seconds, 15 when none |
| `deploy` | a node's position below a swarm, `swarms/swarm-1/node-1` | none |
| `status` | the swarm's position | none |
| `leave` | a node's position | none |

## Authority

The host is the active authority over the swarms it creates: it deploys
their nodes and registers them, each level registering what it created.
One host, one master a swarm.

## Not built

- A swarm removed as a whole: its nodes leave one by one, then its
  master is torn down (`boot/teardown`) and its node deleted
  (`crud/delete`).
- A node on another machine, or in a container; a second master; a node
  joining a swarm another host created.

## Package

- `protocol.js`: the `swarm` protocol, its config and its actions, from
  `mrepo-base-swarm`.
- `main.js`: the dispatcher, the bundle's main, generated.
