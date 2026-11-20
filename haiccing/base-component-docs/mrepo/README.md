# mrepo/

The component's part of the structure: the list of the packages the docs mrepo is made of, and its runtime config.

- **Its packages** (`packages/layer.json`): the runtime, the protocol
  protocol, the info protocol, the help protocol, the documentation packages, and this
  component last; and `"documents": "sources"`: every other package the
  sources offer, placed as documentation only.
- **Its runtime config**: its hooks, below. No service state: the docs
  mrepo is not service managed.
- **Nothing else**: no data. `main` stays empty.

## Runtime config

With no service, everything hangs on `boot`, which its runtime fires
each time it starts:

- `help`, `info` and `runtime` activated: the docs mrepo answers `info/get`.
- Its info extracted: every package's pages, those of its list and
  those it documents, by keywords.

Runtime config is laid in from the last package of a list only, the one
that defines the mrepo. So the component states its own in full.
