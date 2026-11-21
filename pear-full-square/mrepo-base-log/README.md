# mrepo-base-log

The mrepo log protocol: a node's log, a topic of its own, synced lazily to its swarm's master and read there.

Every node of a swarm runs it. Each completed request of the node
becomes a record of its log, a topic the node alone writes. A node's
log reaches its swarm's master by replication, lazily; the master holds
every node's and answers them in one view, filtered by node. Offered by
`haiccing/base-package-log`, whose program is the node's log as a
process.

## Links

- [external](external/)
- [internal](internal/)
- [test](test/)

## Commands

```
haicc <master> log/read
haicc <master> log/read . swarm-1/node-2 50
haicc <node> log/status
haicc <node> log/status . sync
```

## Design

- **What goes in**: every completed request of the node, as its outbox
  folder holds it: its request's key, when it was sent and completed,
  how long it took, who asked, the command, whether it failed and why.
  Not its output, not its own log: those stay in the request.
- **One writer**: the node's program appends; a request is logged once,
  by its key, over restarts too.
- **Lazily**: a node syncs when its topic grew, no sooner than two
  seconds after the last time. It asks the master what it has, opens a
  connection only when that is less, and the master ends it once it
  holds the topic up to the length said.
- **Found through rns**: who the master is and where it lives is the
  node's lookup db's to say; the master takes a log only from a node its
  own lookup db has registered. The first topic offered for a node is
  the one kept.
- **Its side of the mrepo's folder**, `log/`: its store, its socket, and
  on the master the topics collected (`topics.json`): this machine's.

## Not built

- A log's key bound to the node's identity: the master checks that the
  node is registered, not that the topic is that node's.
- Retention: a topic only grows.
- The request layers themselves on a topic: the log is written beside
  them, from the outbox.

## Tests

- `brittle-bare test/*.test.js` (Bare installed): each test by its name in [test/](test/).
