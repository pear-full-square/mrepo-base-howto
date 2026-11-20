# test/configured/

The component's own test: what defines the docs mrepo, its list and its hooks, without an mrepo.

The component brings no code of its own: it is a list of packages and
the hooks that say what the mrepo offers. They are checked value by
value, then against the packages listed, read from the sources.

## What it checks

- **Its list**: the packages in deploy order, the component last.
- **Its hooks, file by file**: each with its transition and its command;
  no service state. A hook file not named in the test fails it.
- **The packages it lists**: each has its bundle in the sources; the
  four protocols they provide, one a package.
- **Every hook names what exists**: a protocol and an action a listed
  package provides; the protocol it opens is provided too.
- **What its hooks do**: run with the listed packages' own actions, on a
  minimal execution in memory: after the boot `help`, `info` and
  `runtime` are open, the info extracted. Every hook file must have run.
- **Nothing left closed by forgetting**: every protocol the listed
  packages provide is opened by a hook, except the protocol protocol, on
  purpose.

## Sources

`SOURCES`: the sources folder, with the listed packages' bundles. Without
it the test fails: it cannot say anything about the packages.

## Not here

The component deployed as a running mrepo, its pages read: the `haicc`
command's end to end test.
