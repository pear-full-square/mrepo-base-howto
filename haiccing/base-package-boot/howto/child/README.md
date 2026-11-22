# child

A child mrepo deployed, read through its parent, redeployed and torn down.

From the boot mrepo (`.`), the host is a child; from the host, a node.
Each is built from a package's list, placed by its unique URI
(`local/host`, `local/node-1`), runs its own runtime and is reached
through its parent by its shortcut.

## Steps

```sh
# the host, from the boot mrepo: built from the haicc component, its runtime started
haicc . boot/deploy host haiccing/base-component-haicc
# a node, from the host: its package fully qualified, <org>/<package>
haicc host boot/deploy node-1 haiccing/base-package-runtime
# read through the host: the request hops at its shortcut
haicc host/node-1 crud/read .
# redeployed from the package it came from (or another, named)
haicc host boot/redeploy node-1
# torn down: its runtime stopped, it and its shortcut removed
haicc host boot/teardown node-1
haicc . boot/teardown host
```

## Notes

- **Tear down from the inside out**: a child's own children are not
  torn down with it.
- **What the install's mrepos are**: the work folder's `mrepos/`, the
  boot component's how-to `registry`.
- **Again**: a deploy of what is there, a teardown of what is not: a
  warning, nothing done (idempotent).
