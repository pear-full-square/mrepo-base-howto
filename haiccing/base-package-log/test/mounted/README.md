# test/mounted/

The package's own test: its protocol as it is mounted, its actions against the log served in the test's process.

The package's `protocol.js` is what a runtime loads. It is loaded here
and checked: what it provides, its config, and each action run on a
minimal execution, for two folders: a master's and a node's, each with
its log served in this process and told its swarm as its rns would
tell it.

## What it checks

- **What it provides**: one protocol, `log`, with a function for every
  action configured and no other.
- **Its config, value by value**: the package that brings it; `read` its
  default; each action at the mrepo itself, its arguments optional; no
  state, no target.
- **Its actions**: `status` at the node, synced: its topic and how far
  it is synced; at the master, the node's topic collected; `read` at
  the master, every node's records in one view and one node's; at a
  node, its own; `status` with no program running.
- **Its core type**, `types/log-entry.avsc`: named as the package
  registers it, a `doc` on it and every field, its fields those of a
  record as the log writes it.
- **Nothing forgotten**: the last test fails when the config names an
  action that was not run here, or one that wrote nothing into the
  request's log as it ran.

## Not here

What the master refuses and a log over restarts: the module's own test
(`modules`). The package's program beside a running node, its master
found through rns: the `haicc` command's swarm test.
