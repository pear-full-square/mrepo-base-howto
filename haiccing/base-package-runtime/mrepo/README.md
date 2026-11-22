# mrepo/

The runtime's part of every mrepo's structure, laid in when an mrepo is deployed: its layers.

- **The layers** every mrepo has: `main`, `runtime`, `packages`,
  `protocols`, the boxes and the request layers.
- **The `protocols` layer**: the active protocols, one file each.

## Deployed alone

Deployed as the target, the runtime package makes an mrepo with a runtime,
its info and its service, and no other protocol:

- **Its packages** (`packages/layer.json`): the info protocol, the help
  protocol, the protocol protocol, the service protocol, and itself
  last.
- **Its runtime config**, laid in only when this package is the one
  deployed: its service state, `booted` (`runtime/service.json`); its
  hooks (`runtime/hooks/`): at `boot`, `help`, `info`, `runtime` and
  `service` activated; its `commission`, `service/initialise` then
  `service/start`; at `initialise`, its info extracted.
