# test/configured/

The solution's own test: what defines the workbench mrepo, its list and its hooks, without an mrepo.

The solution brings no code of its own: a list of packages and the
hooks that say what its mrepo does. They are checked value by value,
then against the packages, read from the sources.

## What it checks

- **Its list**: the haicc component's packages (it fulfils the host's
  role), the solution last.
- **Its hooks, file by file, line by line**: its `commission` (its
  components deployed, the help viewer installed in its Splectral and in
  service, its service initialised and started), its `decommission` (the
  help viewer, then its components torn down), its `boot`
  (the activations only), its `initialise` (its info, its `howtos`
  node), its `start` and `stop` (the door); its service state, `booted`;
  no `scripts/`. A hook file not named in the test fails it.
- **The packages**: each listed, and each its commission deploys or
  installs (the help viewer's too), has its bundle in the sources; the eleven protocols the list provides.
- **Every hook names what exists**: a protocol and an action a listed
  package provides.
- **What its hooks do**: run with the listed packages' own actions, on a
  minimal execution in memory, its components' deploys and teardowns,
  and the commands it sends on to its Splectral, stood in for: the boot, the commission (the components before its
  own `initialise`, no registry of its own), stop, shutdown, the
  decommission. Every hook file must have run.
- **Nothing left closed by forgetting**: every protocol is opened by a
  hook but the protocol protocol; what `start` opens, `stop` closes.

## Sources

`SOURCES`: the sources folder, with the packages' bundles. Without it
the test fails: it cannot say anything about the packages.
