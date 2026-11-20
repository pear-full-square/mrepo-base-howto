# base-component-boot

The boot component: the initial boot mrepo, the root of a host, and the program that puts it in place.

Run with Bare from its bundle, it builds the boot mrepo, places its
packages and starts its runtime. It deploys nothing by itself: the boot
mrepo then takes commands, and deploys the mrepos linked in it. Bare and
the sources are there before it runs: `haicc boot/deploy`, of
`haiccing/base-app-haicc`, runs it from the sources.

```sh
bare base-component-boot.bundle --work=<folder> --sources=folder:<sources>
```

## Links

- [mrepo](mrepo/)
- [howto](howto/)
- [test](test/)
- [test-reports](test-reports/)
- [modules](modules/)

## Included packages

- [base-package-runtime](../base-package-runtime/)
- [base-package-info](../base-package-info/)
- [base-package-help](../base-package-help/)
- [base-package-protocol](../base-package-protocol/)
- [base-package-boot](../base-package-boot/)
- [base-package-haicc](../base-package-haicc/)
- [base-package-crud](../base-package-crud/)

## Steps

The invocation is a request from the start, `boot deploy boot`, with the
command as typed and a GUID. Each step's outcome is logged in it.

1. **The boot mrepo built** the first time into `<work>/mrepos/boot/`, as
   any mrepo is: this component's list fetched into the work folder's
   store, `<work>/packages/`, and laid in, each package's part of the
   structure in order; its identity written, `local/boot`.
2. **Its packages put in place**: checked against their manifest, each
   hard linked individually into `<work>/mrepos/boot/packages/`; the list,
   hashes, sources and store committed.
3. **Its request**, completed, into its `request/execute`, and printed.
4. **Its runtime started**, from its own `packages/`, by its directory, on
   the Bare that ran the boot, as its own process; its status printed
   last. It runs until stopped.
5. **Followed** with `--until-done[=<seconds>]` until every request is
   done, or on a terminal, or with `--follow`: every record as it moves
   through the request layers, one compact line a record, until Ctrl-C.
   The runtime keeps running.

## Options

- `--work=<folder>`: the work folder; the current one by default.
- `--sources=folder:<path>` or `--sources=github:<org>`, repeated: where
  packages come from, in order; `github:haiccing` when none is given.
- `--level=<level>`: how much its log holds, `info` (the default),
  `verbose` or `debug`; an error and a warning are always in it.

## The boot mrepo

- Its unique URI is `local/boot`. It is the root: commands are addressed
  to it, and it passes on those for the mrepos linked in it.
- No `service`: it is not service managed. Its `boot` hooks, fired by its
  runtime each time it starts, activate its protocols, extract its
  info, and make sure the node `registry` is in its `main`.
- **It keeps the mrepo registry**: the mrepos of the install, a node
  each by its unique URI under `registry` in its `main`
  (`registry/local/host`), written by `boot/deploy` and `boot/teardown`:
  `haicc registry/local crud/read "*"`.

## Package

- `run.js`: the entry, the program above.
- `main.js`: the dispatcher, the bundle's main, generated.
- No protocol of its own.
