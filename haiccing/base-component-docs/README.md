# base-component-docs

The docs component: the docs mrepo, the platform's documentation, deployed in the boot mrepo and read with info.

The docs mrepo holds the documentation packages and the `info` protocol,
and documents every package in the install's store: the install's
manual, split on package. It is deployed in the boot mrepo, at `docs`, by one command
(below, "Deploying"): not with the boot; its runtime extracts its pages
as it starts. Every other mrepo
answers about itself, what is deployed in it; the whole platform is read
here.

## Links

- [mrepo](mrepo/)
- [test](test/)
- [test-reports](test-reports/)
- [modules](modules/)

## Included packages

- [base-package-runtime](../base-package-runtime/)
- [base-package-protocol](../base-package-protocol/)
- [base-package-info](../base-package-info/)
- [base-package-help](../base-package-help/)
- [base-package-service](../base-package-service/)
- [base-docs-haicc](../base-docs-haicc/)
- [base-docs-hdlc](../base-docs-hdlc/)
- [base-docs-package](../base-docs-package/)
- [base-docs-uri](../base-docs-uri/)
- [base-docs-xpath](../base-docs-xpath/)
- [base-docs-vision](../base-docs-vision/)

## Documented

Beyond its list, `"documents": "store"`: every package in the install's
store, `<work>/packages/`, reached through its packages manifest's
mapping and read only: nothing of them placed in it, nothing run. What
is installed is what is documented.

- **Built at `initialise`** (`info/extract`), split on package: each
  package's pages and keywords its own, below its organisation.
- **`initialise` again** adds what is new in the store, changes nothing
  else.
- **`shutdown` removes the build** (`info/clear`); `initialise` builds
  it again, from scratch.

Read in a package's context, its name in front, or by a short keyword,
a choice of the packages that have it:

```
haicc docs info/get haiccing
haicc docs info/get haiccing/base-package-boot/deploy
haicc docs info/get deploy
```

## Log

What a request did is in its own record, `log`: its entries, each
`{ level, event, time, ... }`; `info` unasked (what it changed,
`request.changed`; its metrics, `request.metrics`), more with `--flags
log=verbose` or `log=debug`. The requests done are read at the request
layer:

```
haicc host crud/read . --flags log=verbose
haicc host crud/read "done/*" --flags layer=request
haicc host crud/read "done/*[value/value/protocol='crud']" --flags layer=request
```

The levels and the entries: `haiccing/base-docs-package/mrepo/request`.

## Howto

The how-tos are each package's, in its context: `<package>/howto`, then
a how-to's name, or `howto` alone, a choice of the packages that have
them. `base-component-boot/howto` (the boot, a deploy, the docs mrepo,
the registry, `mrepos/`), `base-package-haicc/howto` (a hop, a script, a
cluster), `base-package-splectral/howto`, and `base-docs-package/howto`:
making a package of your own, a how-to a pattern (written where
packages are built: `base-docs-package/howto/package`).

## Deploying

Its name is fixed in the base family: `docs`, its unique URI
`local/docs`, one an install; the help viewer finds it by it wherever
it is deployed (`haicc . haicc/mrepos local/docs`). By the boot mrepo,
or the workbench (`workbench/docs`), with a command:
it is not deployed with the boot, you deploy it. A service like every
mrepo: its boot hooks activate `help`, `info`, `runtime` and `service`;
its `commission`, run as its runtime starts, initialises it (its info
built, by its `initialise` hook) and starts it before the deploy
answers; its `shutdown` hook removes the build.

```
haicc . boot/deploy docs haiccing/base-component-docs
haicc docs info/get
haicc docs info/get haiccing
haicc docs info/get haiccing/base-docs-hdlc
```

## Its files

- No protocol and no code of its own: `main.js` is the dispatcher, the
  bundle's main, generated; it offers the tests.
