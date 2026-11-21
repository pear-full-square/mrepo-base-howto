# test/configured/

The solution's own test: what defines the workbench mrepo, its list, its hooks and its script, without an mrepo.

The solution brings no code of its own: a list of packages, the hooks
that say what its mrepo offers, and its script. They are checked value
by value, then against the packages, read from the sources.

## What it checks

- **Its list**: the packages in deploy order, the solution last.
- **Its hooks, file by file**: each with its transition and its command;
  no service state. A hook file not named in the test fails it.
- **Its script, line by line**: the docs mrepo, the host and Splectral
  deployed, the host and Splectral brought into service; every line a
  command of the boot mrepo's protocols, every hop to an mrepo deployed
  before it.
- **The packages**: each listed, and each its script deploys, has its
  bundle in the sources; the eight protocols the list provides, one a
  package; every line of the script an action one of them provides.
- **Every hook names what exists**: a protocol and an action a listed
  package provides; the protocol it opens is provided too.
- **What its hooks do**: run with the listed packages' own actions, on a
  minimal execution in memory: after the boot `boot`, `crud`, `haicc`,
  `haici`, `help`, `info` and `runtime` are open, the info extracted, the nodes
  `registry` and `howtos` (`{"kind":"howtos"}`) made. Every hook file
  must have run.
- **Nothing left closed by forgetting**: every protocol the listed
  packages provide is opened by a hook, except the protocol protocol, on
  purpose.

## Sources

`SOURCES`: the sources folder, with the packages' bundles. Without it
the test fails: it cannot say anything about the packages.
