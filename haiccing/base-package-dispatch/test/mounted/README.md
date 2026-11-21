# test/mounted/

The package's own test: its protocol as it is mounted, without an mrepo.

The package's `protocol.js` is what a runtime loads. It is loaded here
and checked: what it provides, its config, and its action run on a
minimal execution, the swarm said to it as the node's rns would say it.

## What it checks

- **What it provides**: one protocol, `dispatch`, with a function for
  its one action and no other.
- **Its config, value by value**: the package that brings it; `send` at
  a unique URI, a target needed, the command its arguments; no state.
- **`send`**: a node on this machine: sent on to its own folder, the
  command as it is; a position below the node goes on with the command;
  this node itself: executed here; a node on another machine and one not
  registered: refused, said why.
- **Nothing forgotten**: the last test fails when the config names an
  action that was not run here, or one that wrote nothing into the
  request's log as it ran.

## Not here

A command dispatched between two running nodes, its answer back: the
`haicc` command's swarm test.
