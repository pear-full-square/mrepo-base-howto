# mrepo/

The component's part of the structure: the list of the packages the docs mrepo is made of, and its runtime config.

- **Its packages** (`packages/layer.json`): the runtime, the protocol
  protocol, the info protocol, the help protocol, the service protocol,
  the documentation packages, and this
  component last; and `"documents": "sources"`: every other package the
  sources offer, placed as documentation only.
- **Its runtime config**: its service state and its hooks, below.
- **Nothing else**: no data. `main` stays empty.

## Runtime config

- **`runtime/service.json`**: the service state, `booted`: the docs mrepo
  is service managed, as every mrepo.
- **At `boot`**: `help`, `info`, `runtime` and `service` activated: the
  activations only.
- **`commission`**, run once by its runtime as it starts after its
  deploy, the deploy waiting for it: `service/initialise`, then
  `service/start`.
- **At `initialise`**: its info extracted: every package's pages, those
  of its list and those it documents, by keywords. Its setup, in a
  visible state rather than at its runtime's start.
- **No door**: nothing sits behind it; started, it answers `info/get`.

Runtime config is laid in from the last package of a list only, the one
that defines the mrepo. So the component states its own in full.
