# base-package-service

The service protocol: it manages the service state of an mrepo's external API.

Every mrepo is service managed, its list including this package; the
boot mrepo, the root, is the one exception: nothing upstream manages
it. The state starts at `booted`; `initialise` and `start` open its
external API, `stop` and `shutdown` close it, the runtime running on.
Each action runs its transition's hooks, then moves the state.

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

## The service

- **Setup**: an mrepo's setup is its `initialise` hook, a visible state,
  not its runtime's start.
- **The door**: a `start` hook that activates what sits behind it, a
  `stop` hook that deactivates it.
- **Refused, not held**: a request its state does not allow is
  received and answered `not now`.
- **Into service**: a package's `commission` hook brings its mrepo into
  service after its deploy (typically `service/initialise`, then
  `service/start`).

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
