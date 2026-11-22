# test/mounted/

The package's own test: its protocol as it is mounted, without an mrepo and without a runtime.

The package's `protocol.js` is what a runtime loads. It is loaded here
and checked; each action is run on a minimal execution, a temporary folder
standing for the parent's.

## What it checks

- **What it provides**: one protocol, `boot`, with a function for every
  action configured and no other.
- **Its config, value by value**: the three actions at any position
  below `main`, a target needed; `deploy` with its package required,
  `redeploy` with it optional, `teardown` with none; no state of its own.
- **Its config in effect**: a request checked: no target, no package,
  not activated, each refused as it should be; a deeper position
  allowed.
- **`deploy`**: each refusal, before anything is built: the mrepo itself,
  not a name, a position whose node above is not there, the swarm
  `local`, a position below a shortcut, deployed already from another
  package, data in `main` at that position, a folder in the way, no
  package, no store, a package in no source. From the same package: a
  repeat, nothing written. A refusal after its link was written (linked
  first) removes it again: nothing left, no folder.
- **`teardown`**: a child without a runtime: its folder, its node, its
  shortcut and what was local about it removed; again, not deployed: a
  repeat, a warning; data in `main` there, the mrepo itself, refused.
- **`redeploy`**: torn down first and that committed, then the deploy,
  from the package it was deployed from when none is given; nothing
  deployed and no package: refused.
- **Nothing forgotten**: the last test fails when the config names an
  action that was not run here, or one that wrote nothing into the
  request's log as it ran.

## Not here

A child really built, its packages placed and its runtime started and
stopped: that takes the sources and a runtime. The module's own tests do
it, in this package's `modules` test; between running mrepos, by
commands, the boot component's test.
