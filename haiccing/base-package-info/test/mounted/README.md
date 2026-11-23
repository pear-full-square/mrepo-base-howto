# test/mounted/

The package's own test: its protocol as it is mounted, without an mrepo.

The package's `protocol.js` is what a runtime loads. It is loaded here
and checked: what it provides, its config, the layer it brings, and each
action run on a minimal execution.

## What it checks

- **What it provides**: one protocol, `info`, with a function for every
  action configured and no other.
- **Its config, value by value**: the package that brings it; `get`,
  its default action, its keywords where the URI is, and `extract` and
  `clear`, at the mrepo itself; no argument, no state, no target.
- **Its structure**: the info layer it brings, atomic.
- **`extract`**: from bundles written for the test, a component that
  includes a protocol package: the layer, its index, its problems; run
  again, nothing written; a URI other than the mrepo itself, refused.
- **`get`**: nothing extracted yet, said; then the top, its
  organisation, its packages by their names fully qualified, an action
  reached by a jump in its package's context; a short keyword, its
  package's context said; a keyword that is not there, said.
- **`clear`**: the build removed, nothing to read after it.
- **Nothing forgotten**: the last test fails when the config names an
  action that was not run here, or one that wrote nothing into the
  request's log as it ran.

## Not here

The pages in a running mrepo: extracted by a hook as the mrepo is made ready,
and read with commands through the inbox. That is the `haicc` command's
end to end test.
