# read

Answers the log records held here: the node's own, and on a swarm's master every node's in one view.

## Signature

`read(exec, { args })`: requested as `log/read . [<node>] [<limit>]`, or
`log` alone.

## Arguments

1. A node's unique URI, to read that node's log only; `*` or none: every
   log held here. Optional.
2. The limit: how many records, the last ones; 100 when none. A number
   alone is the limit. Optional.

## Returns

`{ nodes, records }`: `nodes` the logs read, each `{ uri, length }`;
`records` by time, the newest last, each `{ node, offset, timestamp,
request, sent, ms, from, command, ok, error }`: its node, its place in
that node's log, when it was completed, its request's key, when it was
sent and how long it took, who asked, the command, whether it failed
and why.

## Errors

- A node no log is held for here: `no log held here for it`, with those
  that are.
- A limit that is no number above zero: `not a limit`.
- Its program not running: `the log is not running here`.
