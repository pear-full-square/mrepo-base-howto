# base-package-haici

The haici protocol: human ai continuous improvement; feedback on a command, recorded in the request log.

`--flags feedback <text>` on any command makes it `haici/feedback` at
the same URI: the mrepo the command would have run in records it,
nothing of the command executed, and answers with its request's id; the
request log is the store, read back with `layer=request`. Linked and
activated in the boot mrepo and the haicc mrepo (the host, a node).

## Links

- [feedback](modules/pear-full-square/mrepo-base-haici/external/feedback/)
- [howto](howto/)
- [test](test/)
- [test-reports](test-reports/)
- [modules](modules/)

## Config

The `haici` protocol's, in `protocol.js`; no state.

| action | offered at | arguments |
|---|---|---|
| `feedback`, the default | the command's URI (`**`) | the text, then the command's `<protocol>/<action>` and its arguments |

## Package

- `protocol.js`: the `haici` protocol, its config and its actions, from
  `mrepo-base-haici`.
- `main.js`: the dispatcher, the bundle's main, generated.
