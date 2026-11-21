# base-package-log

The log protocol: a node's log as a topic of its own, synced lazily to its swarm's master and read there across nodes.

Every node of a swarm lists it. Each completed request of a node is a
record of its log; the node's log reaches the swarm's master by
replication, lazily. `log/read` at the master answers every node's
records in one view, or one node's; at a node, its own. The package is
also a program: the node's log as a process, started by the node's
`start` hook. The log viewer, a Splectral component, draws the
master's.

## Links

- [read](modules/pear-full-square/mrepo-base-log/external/read/)
- [status](modules/pear-full-square/mrepo-base-log/external/status/)
- [howto](howto/)
- [test](test/)
- [test-reports](test-reports/)
- [modules](modules/)

## Config

The `log` protocol's, in `protocol.js`; each action at the mrepo itself
(`.`).

| action | arguments |
|---|---|
| `read`, the default | a node's unique URI, a limit; both optional |
| `status` | `sync`, optional: synced now |

## Program

`run.js`: the node's log served until its runtime ends. A node's `start`
hook starts it after its rns, `runtime/start .
packages/haiccing/base-package-log`; its `stop` hook ends it. It finds
its master through the node's rns.

## Not built

- A log's key bound to its node's identity; retention; a log synced to a
  master on another machine.

## Package

- `protocol.js`: the `log` protocol, its config and its actions, from
  `mrepo-base-log`.
- `run.js`: its program.
- `main.js`: the dispatcher, the bundle's main, generated.
