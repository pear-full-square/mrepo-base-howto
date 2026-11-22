# test/workbench/

The solution's own test: the workbench on a fresh install, commissioned, its howtos used, decommissioned.

## What it checks

- **A fresh install**: the boot mrepo put in place from the sources, by
  the boot component.
- **One command at the root**: `boot/deploy workbench
  haiccing/base-solution-workbench`: the workbench at `workbench`,
  `local/workbench`, answered once its commission is done, in service;
  no continuation.
- **Its commission**: its components deployed below it, `workbench/docs`
  and `workbench/splectral` (`local/docs`, `local/splectral`), placed in
  the install's registry, `mrepos/`, linked in the workbench only (not in
  the boot mrepo), each in service by its own commission; then itself
  initialised (its `howtos` node, `{"kind":"howtos"}`) and started.
- **The howtos namespace**: an mrepo deployed by the workbench below it,
  at `howtos/haiccing/base-solution-workbench/howto/install/boot`: its
  unique URI the path below it, placed at `<work>/mrepos/<that path>`,
  its runtime knowing it, linked at its position; torn down there.
- **Its decommission**: the workbench torn down, its decommission first,
  its components torn down with it.
- **Nothing left**: the boot mrepo stopped, every process ended.

## Sources

`SOURCES`: the sources folder; skipped without the boot component's and
this package's bundles in it.

## Not here

Splectral's pages served, the docs read through the command line: the
`haicc` command's end to end, `base-linux-haicc`'s `test/splectral.sh`.
