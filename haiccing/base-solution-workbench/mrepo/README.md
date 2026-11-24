# mrepo/

The workbench's part of the structure: the list of the packages the workbench mrepo is made of, and its runtime config.

- **Its packages** (`packages/.layer.json`): the haicc component's (the
  runtime, info, help, haici, protocol, boot, service, haicc, crud,
  container, swarm), this solution last: it fulfils the host's role, the
  local manager.
- **Its runtime config**: its service state and its hooks, below.
- **Its components**: the docs mrepo and Splectral, deployed by its
  commission, below it.

## Runtime config

- **`runtime/service.json`**: the service state, `booted`: the workbench
  is service managed, as every mrepo.
- **At `boot`**: `haicc`, `haici`, `help`, `info`, `runtime` and
  `service` activated: the activations only.
- **`commission`**, run by its runtime as it starts (a deploy; again at
  a restart, its lines idempotent), the deploy waiting for it: its
  components deployed, linked in it, `docs`
  (`haiccing/base-component-docs`) and `splectral`
  (`haiccing/base-package-splectral`), each commissioned by its own; then
  the help viewer in its Splectral, `help` (`haiccing/base-package-service`
  deployed by Splectral, `splectral/base-component-help-viewer` installed
  on it, initialised and started): its help view, reading the docs mrepo
  by its unique URI; then its service initialised and started.
- **`decommission`**, asked by its teardown: the help viewer torn down
  from its Splectral, then `splectral`, then `docs`.
- **At `initialise`**: its setup: its info extracted; the node `howtos`
  made in its `main`, its document `{"kind":"howtos"}`: a namespace, the
  root of the how-tos' unique URIs. An mrepo deployed below it, at
  `howtos/<org>/<package>/howto/<name>/<mrepo>`, is
  `<org>/<package>/howto/<name>/<mrepo>`: a how-to's key, then its name.
- **At `start`**: `boot`, `crud`, `container` and `swarm` activated, its
  door; **at `stop`**: deactivated again. Its own lines (its commission)
  are not held at the door.
- **`decommission`**, run when it is torn down, before its runtime is
  stopped: its components torn down, the last deployed first.
