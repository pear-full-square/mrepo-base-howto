# mrepo/

The component's part of the structure: the list of the packages the haicc mrepo is made of, and its runtime config.

- **Its packages** (`packages/layer.json`): the runtime, the info
  protocol, the protocol protocol, the boot protocol, the service
  protocol, the haicc protocol, the crud protocol, the container
  protocol, the swarm protocol, and this component last.
- **Its runtime config**: the service state and the hooks, below.
- **Nothing else**: no protocol, no data. `main` stays empty.

## Runtime config

- **`runtime/service.json`**: the service state, `booted`: the haicc
  mrepo is service managed.
- **At `boot`**: `haicc`, `haici`, `help`, `info`, `runtime` and `service` activated. A
  closed haicc mrepo can be addressed, inspected and tested.
- **`commission`**, run once by its runtime as it starts after its
  deploy, the deploy waiting for it: `service/initialise`, then
  `service/start`: deployed, it is in service.
- **At `initialise`**: its info extracted.
- **At `start`**: `boot`, `crud`, `container` and `swarm` activated.
  Deploying mrepos, making structure in `main`, making its replica in a
  container and making swarms are what sits behind its door.
- **At `stop`**: the four deactivated again.

Runtime config is laid in from the last package of a list only, the one
that defines the mrepo. So the component states its own in full.
