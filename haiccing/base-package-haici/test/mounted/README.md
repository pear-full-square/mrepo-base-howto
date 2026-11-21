# test/mounted/

The package's own test: its protocol as it is mounted, without an mrepo.

The package's `protocol.js` is what a runtime loads. It is loaded here
and checked: what it provides, its config, and its action run on a
minimal execution.

## What it checks

- **What it provides**: one protocol, `haici`, with a function for every
  action configured and no other.
- **Its config, value by value**: the package that brings it;
  `feedback`, its default action, wherever the command would run, its
  arguments the text and the command's; no state, no target.
- **`feedback`**: feedback on a command recorded on a minimal execution:
  the command as understood, the request's id, the command to read it
  back, its answer in natural language; nothing written.
- **Nothing forgotten**: the last test fails when the config names an
  action that was not run here, or one that wrote nothing into the
  request's log as it ran.

## Not here

The feedback flag on a command in a running mrepo, through the inbox,
read back from the request layer: the `haicc` command's end to end test.
