# base-package-runtime

The mrepo runtime: the engine every mrepo runs on. Its process holds the
mrepo's store, runs its protocols (`runtime` from this package's
`protocol.js`; the others from the packages linked in), and serves its
local connection.

```sh
bare <dir>/packages/haiccing/base-package-runtime.bundle <dir>
```

## Links

- [run](modules/pear-full-square/mrepo-base-runtime/external/run/)
- [start](modules/pear-full-square/mrepo-base-runtime/external/start/)
- [stop](modules/pear-full-square/mrepo-base-runtime/external/stop/)
- [lay](modules/pear-full-square/mrepo-base-runtime/external/lay/)
- [howto](howto/)
- [mrepo](mrepo/)
- [modules](modules/)
- [test](test/)
- [test-reports](test-reports/)

## Included packages

- [base-package-info](../base-package-info/)
- [base-package-help](../base-package-help/)
- [base-package-protocol](../base-package-protocol/)

## Usage

The mrepo at `<dir>` (on the filesystem storage), started from its own
`packages/` (its pinned runtime): by the boot for the boot mrepo, by a
parent's `boot deploy` for a child. It loads the protocols its linked
packages offer and fires its `boot` hooks; it names no protocol itself. Stopped over its local connection (`<dir>/runtime.sock`;
a short path in the temporary folder when that is too long), by SIGTERM or
SIGINT; it runs until then. (`--work=<folder>`: the
mrepo a work folder's setting names, as the p2p host.)

## Config

The `runtime` protocol's, in `protocol.js`; no state.

| action | offered at | arguments |
|---|---|---|
| `run` | `.`, the mrepo itself | a linked package's entry, `packages/<org>/<package><target>`; `dry-run`, optional |
| `start` | `.` | a package placed in the mrepo's folder, its path there: its program started as its own process |
| `stop` | `.` | the same: its program ended |
| `lay` | `.` | the same: its runtime config, its hooks, laid into the runtime layer |

## The package

- `main.js`: the dispatcher, the bundle's main (generated): every entry and
  test by path, `run(target, { dryRun })`.
- `run.js`: the entry, the runtime's process.
- `protocol.js`: its protocol, `runtime` (run, start, stop, lay), its actions and config
  passed to the runtime by `run.js`.
