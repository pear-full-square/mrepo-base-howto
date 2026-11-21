# mrepo/

The workbench's part of the structure: the list of the packages the workbench mrepo is made of, and its runtime config.

- **Its packages** (`packages/layer.json`): the boot mrepo's protocols
  (runtime, info, help, haici, protocol, boot, haicc, crud), this
  solution last: it deploys and keeps mrepos as the boot mrepo does.
- **Its runtime config**: its hooks, below. No service state: the
  workbench is not service managed.
- **Nothing deployed by itself**: the install's other mrepos (the docs
  mrepo, the host, Splectral) are its script's, deployed beside it by
  the deployer (`scripts/`).

## Runtime config

With no service, everything hangs on `boot`, which its runtime fires
each time it starts, in name order:

- `boot`, `crud`, `haicc`, `haici`, `help`, `info` and `runtime` activated: the
  workbench takes commands for them.
- Its info extracted.
- The node `registry` made in its `main`, where it is not there yet: its
  own mrepo registry, of what it deploys.
- The node `howtos` made in its `main`, its document
  `{"kind":"howtos"}`: a namespace, the root of the how-tos' unique
  URIs. An mrepo deployed below it, at
  `howtos/<org>/<package>/howto/<name>/<mrepo>`, is
  `<org>/<package>/howto/<name>/<mrepo>`: a how-to's key, then its name.
