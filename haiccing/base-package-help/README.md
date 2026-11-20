# base-package-help

The help protocol: a command explained where it would run, not executed.

`--flags help` on any command makes it `help/annotate` at the same URI:
the mrepo the command would have run in answers what it does, whether
it is taken there and now, its arguments, the command to run it and
where to read more; nothing of the command is executed. Linked wherever
`info` is: its pages are what it reads.

## Links

- [annotate](modules/pear-full-square/mrepo-base-help/external/annotate/)
- [howto](howto/)
- [test](test/)
- [test-reports](test-reports/)
- [modules](modules/)

## Config

The `help` protocol's, in `protocol.js`; no state.

| action | offered at | arguments |
|---|---|---|
| `annotate`, the default | the command's URI (`**`) | the command's `<protocol>/<action>`, then its arguments |

## Package

- `protocol.js`: the `help` protocol, its config and its actions, from
  `mrepo-base-help`.
- `main.js`: the dispatcher, the bundle's main, generated.
