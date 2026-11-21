# status

Answers the node's log: its topic, how far it is synced to the master, and on the master the topics collected.

## Signature

`status(exec, { args })`: requested as `log/status`, or `log/status .
sync`.

## Arguments

1. `sync`: the outbox taken and the log synced to the master now, then
   its status. Optional.

## Returns

`{ running, key, length, uri, role, master, synced: { length, at },
error, collected }`: its topic's key and length; in a swarm, its unique
URI and role; a node also its master, how far its log was synced and
when, and why its last sync failed; `collected` the topics a master
holds, each `{ uri, key, length }`.

Its program not running: `{ running: false, length: 0, collected: [] }`.

## Errors

- An argument that is not `sync`: `not an argument of log/status`.
