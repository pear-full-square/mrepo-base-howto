# base-package-service

The service protocol: it manages the service state of an mrepo's external API.

An mrepo that links it is service managed. Its state starts at `booted`;
`service/initialise` and `service/start` open its external API,
`service/stop` and `service/shutdown` close it again. Each action first
runs the hooks of its transition, then moves the state. The door is two
hooks: one on `start` that activates what sits behind it, one on `stop`
that deactivates it again.

## Links

- [initialise](modules/pear-full-square/mrepo-base-service/external/initialise/)
- [start](modules/pear-full-square/mrepo-base-service/external/start/)
- [stop](modules/pear-full-square/mrepo-base-service/external/stop/)
- [shutdown](modules/pear-full-square/mrepo-base-service/external/shutdown/)
- [howto](howto/)
- [mrepo](mrepo/)
- [test](test/)
- [test-reports](test-reports/)
- [modules](modules/)

## Included packages

- [base-package-runtime](../base-package-runtime/)
- [base-package-info](../base-package-info/)
- [base-package-help](../base-package-help/)
- [base-package-protocol](../base-package-protocol/)

## Config

The `service` protocol's, in `protocol.js`: each action at the mrepo
itself, `.`, with the states that allow it. The runtime's check reads
it: the state machine is configuration, not code.

| action | from | to | its hooks |
|---|---|---|---|
| `initialise` | `booted` | `initialised` | made ready: its info extracted |
| `start` | `initialised` | `started` | its door opened: what is behind it activated |
| `stop` | `started` | `initialised` | its door closed again |
| `shutdown` | `initialised` | `booted` | |

In `started`, what its `start` hooks activated is allowed too. Each
action answers what was done and the state the service is in now:
`service/stop` answers `{ "service": "stopped", "state": "initialised" }`.

## Package

- `protocol.js`: the `service` protocol, its config and its actions, from
  `mrepo-base-service`.
- `main.js`: the dispatcher, the bundle's main, generated.
