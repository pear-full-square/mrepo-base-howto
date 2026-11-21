# test/mounted/

The package's own test: its protocol as it is mounted, its actions against the rns served in the test's process.

The package's `protocol.js` is what a runtime loads. It is loaded here
and checked: what it provides, its config, and each action run on a
minimal execution, for two folders: a master's and a node's, each with
its rns served in this process.

## What it checks

- **What it provides**: one protocol, `rns`, with a function for every
  action configured and no other.
- **Its config, value by value**: the package that brings it; `status`
  its default; each action at the mrepo itself, its arguments; no state,
  no target.
- **Its actions**: `master` makes the lookup db; `join` answers what the
  node is registered with; `register` at the master; `status` at both,
  the node active once its own rns renewed its lease; `resolve` at the
  node; `leave`; what is the master's refused by a node; `status` with
  no program running.
- **Nothing forgotten**: the last test fails when the config names an
  action that was not run here, or one that wrote nothing into the
  request's log as it ran.

## Not here

Leases running out and the master started again: the module's own test
(`modules`). The package's program as a process beside a running node:
the `haicc` command's swarm test.
