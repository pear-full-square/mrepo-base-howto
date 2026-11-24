# mrepo/

The component's part of the structure: the list of the packages a swarm's node is made of, and its runtime config.

- **Its packages** (`packages/.layer.json`): the haicc mrepo's (the
  runtime, info, help, haici, the protocol protocol, boot, service,
  haicc, crud, container), then the rns protocol, the log protocol and
  the dispatch protocol, and this component last.
- **Its runtime config**: the service state and the hooks, below.
- **Nothing else**: no protocol, no data. `main` stays empty.

## Runtime config

- **`runtime/service.json`**: the service state, `booted`: a node is
  service managed.
- **At `boot`**: `haicc`, `haici`, `help`, `info`, `runtime` and
  `service` activated. A closed node can be addressed, inspected and
  tested.
- **`commission`**, run once by its runtime as it starts after its
  deploy, the deploy waiting for it: `service/initialise`, then
  `service/start`: deployed, it is in service.
- **At `initialise`**: its info extracted.
- **At `start`**: `boot`, `container`, `crud`, `rns`, `log` and
  `dispatch` activated, then the two programs started beside the mrepo: the rns',
  `runtime/start . packages/haiccing/base-package-rns`, from then on the
  node renews its lease and answers from its lookup db; the log's,
  `runtime/start . packages/haiccing/base-package-log`, from then on its
  requests are logged and synced to the master.
- **At `stop`**: the programs ended, `runtime/stop` of each, then the
  six deactivated again. A node stopped goes quiet in its swarm.

Runtime config is laid in from the last package of a list only, the one
that defines the mrepo. So the component states its own in full.
