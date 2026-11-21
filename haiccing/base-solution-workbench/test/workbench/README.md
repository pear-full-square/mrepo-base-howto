# test/workbench/

The solution's own test: the workbench deployed on a fresh install, its howtos namespace used.

## What it checks

- **A fresh install**: the boot mrepo put in place from the sources, by
  the boot component.
- **One command at the root**: `boot/deploy workbench
  haiccing/base-solution-workbench`: the workbench at `workbench`,
  `local/workbench`, said a solution; answered with its script,
  `scripts/solution.haicc`, unasked, for the root's own position.
- **Its mrepo**: its runtime running by its unique URI; its boot hooks
  made its `registry` and its `howtos` node, `{"kind":"howtos"}`.
- **The howtos namespace**: an mrepo deployed by the workbench below
  it, at `howtos/haiccing/base-solution-workbench/howto/install/boot`:
  its unique URI the path below it, placed at `<work>/mrepos/<that
  path>`, its runtime knowing it, in the workbench's registry by it;
  torn down through the registry by the how-to's key.
- **Nothing left**: the workbench torn down, the boot mrepo stopped,
  every process ended.

## Sources

`SOURCES`: the sources folder; skipped without the boot component's and
this package's bundles in it.

## Not here

The script run, the docs mrepo, the host and Splectral in service: the
`haicc` command's end to end, `base-linux-haicc`'s `test/splectral.sh`.
