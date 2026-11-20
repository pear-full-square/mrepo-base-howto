# test/mounted/

The package's own test: its protocol as it is mounted, without an mrepo.

The package's `protocol.js` is what a runtime loads. It is loaded here
and checked: what it provides, its config, and its action run on a
minimal execution.

## What it checks

- **What it provides**: one protocol, `help`, with a function for every
  action configured and no other.
- **Its config, value by value**: the package that brings it;
  `annotate`, its default action, wherever the command would run, its
  arguments the command's; no state, no target.
- **`annotate`**: a command explained on an mrepo's runtime view written
  for the test: what it does, the door here and now, its arguments;
  refused, said why; nothing written.
- **Nothing forgotten**: the last test fails when the config names an
  action that was not run here, or one that wrote nothing into the
  request's log as it ran.

## Not here

The help flag on a command in a running mrepo, through the inbox: the
`haicc` command's end to end test.
