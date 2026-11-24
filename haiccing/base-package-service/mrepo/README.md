# mrepo/

The service protocol's part of an mrepo's structure: the service state, booted, and its hooks.

- **`runtime/service.json`**: `{ "state": "booted" }`. Every mrepo has
  it (the boot mrepo, the root, the one exception).
- **No commission**: deployed alone, this package is a plain mrepo for a
  platform to lay a component on (Splectral's `install`); the platform
  brings it into service after.
- **Its hooks** (`runtime/hooks/`): at `boot`, `service`, `help`,
  `info` and `runtime` activated; at `initialise`, its info extracted.
- **Its packages** (`packages/.layer.json`): the runtime, the info
  protocol, the help protocol, the protocol protocol, and this
  package last.

## Runtime config

The state and the hooks are runtime config: laid in only when this
package is the one deployed, the last of its own list. Linked into
another package's list, such as a component's, they are not laid in, and
that package states its own.
