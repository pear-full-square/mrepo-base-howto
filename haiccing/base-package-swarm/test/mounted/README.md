# test/mounted/

The package's own test: its protocol as it is mounted, without an mrepo.

The package's `protocol.js` is what a runtime loads. It is loaded here
and checked: what it provides, its config, and each action run on a
minimal execution: an mrepo's `main` written for the test, the commands
an action sends answered in its place.

## What it checks

- **What it provides**: one protocol, `swarm`, with a function for every
  action configured and no other.
- **Its config, value by value**: the package that brings it; each
  action at a position below `main`, a target needed; `create` takes a
  lease; no state.
- **`create`**: it waits for its commands, in order: the swarm's node,
  its master deployed, brought into service and made the master;
  resumed, the swarm's document with where the lookup db is.
- **`deploy`, `leave`, `status`**: a node deployed, in service, joined
  and registered at the master by this mrepo; below no swarm: refused; a
  node taken out, then torn down; the swarm asked of its master.
- **Its core type**, `types/swarm.avsc`: named as the package registers
  it, a `doc` on it and every field, its fields those of the document
  `create` writes.
- **Nothing forgotten**: the last test fails when the config names an
  action that was not run here, or one that wrote nothing into the
  request's log as it ran.

## Not here

A swarm made on a running host, its nodes real: the `haicc` command's
swarm test.
