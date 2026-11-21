# program

Serves a node's log as its own process: its topic written from the outbox, synced to the master, collected there.

## Signature

- `serve({ dir, every, sync, swarm, now })`: the log of the mrepo in
  `dir`, served until closed; `every` its tick and `sync` the least time
  between two syncs, in milliseconds; `swarm` the swarm as the node's
  rns says it, `{ status(), resolve(uri) }`.
- `program(argv)`: the same as a program, what `runtime/start` starts:
  `--dir=<the mrepo's folder> --runtime=<pid> --state=<file>`.

## Returns

`serve`: `{ socket, key, status(), tick(), close() }`. `program` writes
its state, `{ pid, socket, key, started }`, once it is up.

## Design

- **Each tick**, and when its outbox folder changes: the completed
  records not logged yet appended, the oldest first; then a sync when
  one is due.
- **A sync**: the master asked what it has of this node's topic; less
  than its length: a connection opened, the topic replicated over it,
  ended by the master; asked again, to know it arrived.
- **What it answers on its socket**: `status`, `sync`, `read`; a master
  also `have`, a node's topic taken up once its own rns says the node is
  registered. A stream opened on it replicates its store.
