# mrepo/

The component's part of the structure: the list of the packages the docs mrepo is made of, and its runtime config.

- **Its packages** (`packages/.layer.json`): the runtime, the protocol
  protocol, the info protocol, the help protocol, the crud and the haici
  protocols (feedback where the documentation is read, read back there),
  the service protocol,
  the documentation packages, and this
  component last; and `"documents": "store"`: every package in the
  install's store documented, read from the store, nothing placed.
- **Its runtime config**: its service state and its hooks, below.
- **Nothing else**: no data. `main` stays empty.

## Runtime config

- **`runtime/service.json`**: the service state, `booted`: the docs mrepo
  is service managed, as every mrepo.
- **At `boot`**: `crud`, `haici`, `help`, `info`, `runtime` and `service` activated: the
  activations only.
- **`commission`**, run by its runtime as it starts (again at a
  restart, idempotent), the deploy waiting for it: `service/initialise`,
  then `service/start`.
- **At `initialise`**: its info built (`info/extract`): every package's
  pages, those of its list and every one in the store, split on package.
  Its setup, in a visible state rather than at its runtime's start;
  again, what is new in the store added.
- **At `shutdown`**: the build removed (`info/clear`); `initialise`
  builds it again.
- **No door**: nothing sits behind it; started, it answers `info/get`.

Runtime config is laid in from the last package of a list only, the one
that defines the mrepo. So the component states its own in full.
