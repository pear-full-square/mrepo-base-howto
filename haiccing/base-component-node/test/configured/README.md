# test/configured/

The component's own test: what defines a swarm's node, its list and its hooks, without an mrepo.

The component brings no code of its own: it is a list of packages and
the hooks that say what the mrepo offers. They are checked value by
value, then against the packages listed, read from the sources.

## What it checks

- **Its list**: the packages in deploy order, the component last.
- **Its hooks, file by file**: each with its transition and its command;
  the state the mrepo starts in. A hook file not named in the test fails
  it.
- **The packages it lists**: each has its bundle in the sources; the
  twelve protocols they provide, one a package.
- **Every hook names what exists**: a protocol and an action a listed
  package provides; the protocol it opens or closes is provided too.
- **What its hooks do**: run with the listed packages' own actions, on a
  minimal execution in memory. After the boot `haicc`, `help`, `info`,
  `runtime` and `service` are open; `initialise` extracts the info; `start` opens
  `boot`, `container`, `crud`, `rns` and `dispatch` and starts the rns'
  program (its line seen, not started: there is no mrepo's
  folder here), `stop` ends it and closes them again, `shutdown` returns to booted. Every
  hook file must have run in that walk.
- **Nothing left closed by forgetting**: every protocol the listed
  packages provide is opened by a hook, except the protocol protocol, on
  purpose; and what `start` opens, `stop` closes.

## Sources

`SOURCES`: the sources folder, with the listed packages' bundles. Without
it the test fails: it cannot say anything about the packages.

## Not here

The component deployed as a running mrepo, its program started, a node
registered in its swarm: the `haicc` command's swarm test.
