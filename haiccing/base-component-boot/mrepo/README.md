# mrepo/

The boot component's part of the structure: the list of the packages the boot mrepo is made of, and its runtime config.

- **Its packages** (`packages/layer.json`): the runtime, the info
  protocol, the protocol protocol, the boot protocol, the haicc protocol,
  the crud protocol, and this component last.
- **Its runtime config**: its hooks, below. No service, no
  `commission`: the root, put in place, not deployed.
- **Nothing preloaded**: it deploys nothing by itself; its `main` holds
  the shortcuts of what it deploys (the install's registry is the work
  folder's `mrepos/`, not in it).

## Runtime config

With no service, everything hangs on `boot`, which its runtime fires
each time it starts, in name order:

- `boot`, `crud`, `haicc`, `haici`, `help`, `info` and `runtime` activated: the
  boot mrepo takes commands for them.
- Its info extracted.
