# mrepo/

The boot component's part of the structure: the list of the packages the boot mrepo is made of, and its runtime config.

- **Its packages** (`packages/layer.json`): the runtime, the info
  protocol, the protocol protocol, the boot protocol, the haicc protocol,
  the crud protocol, and this component last.
- **Its runtime config**: its hooks, below. No service: the one mrepo
  without, the root, nothing upstream managing it; no `commission`: it
  is put in place, not deployed.
- **Nothing preloaded**: it deploys nothing by itself; its `main` holds
  the mrepo registry, made by a hook, and the shortcuts of what it
  deploys.

## Runtime config

With no service, everything hangs on `boot`, which its runtime fires
each time it starts, in name order:

- `boot`, `crud`, `haicc`, `haici`, `help`, `info` and `runtime` activated: the
  boot mrepo takes commands for them.
- Its info extracted.
- The node `registry` made in its `main`, where it is not there yet: the
  mrepo registry, which `boot/deploy` and `boot/teardown` keep.
