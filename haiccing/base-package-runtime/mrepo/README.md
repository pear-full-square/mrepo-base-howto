# mrepo/

The runtime's part of every mrepo's structure, laid in when an mrepo is deployed: its layers.

- **The layers** every mrepo has: `main`, `runtime`, `packages`,
  `protocols`, the boxes and the request layers.
- **The `protocols` layer**: the active protocols, one file each.

## Deployed alone

Deployed as the target, the runtime package makes an mrepo with a runtime
and its info, and no other protocol:

- **Its packages** (`packages/layer.json`): the info protocol, the help
  protocol, the protocol protocol, and itself last.
- **Its hooks** (`runtime/hooks/boot/`): `help`, `info` and `runtime` activated,
  its info extracted. Runtime config: laid in only when this package is
  the one deployed.
