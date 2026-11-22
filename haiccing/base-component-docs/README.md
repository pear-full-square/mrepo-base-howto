# base-component-docs

The docs component: the docs mrepo, the platform's documentation, deployed in the boot mrepo and read with info.

The docs mrepo holds the documentation packages and the `info` protocol,
and documents every other package the sources offer: the install's
manual. It is deployed in the boot mrepo, at `docs`, by one command
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

Beyond its list, `"documents": "sources"`: every package the sources
offer, placed as documentation only (its bundle; nothing laid in, nothing
run), each at its keyword below the top: `haicc docs info/get boot`.
What is installed is what is documented; later a solution's list may
name them.

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

The levels and the entries: `package mrepo request`.

## Howto

The how-tos are each package's, below its keyword: `<keyword> howto`,
then a how-to's name. `boot howto` (the boot, a deploy, the docs mrepo,
the registry), `haicc howto` (a hop, a script, a cluster), `splectral
howto`, and `package howto`: making a package of your own, a how-to a
pattern (written where packages are built: `package howto package`).

## Deploying

By the boot mrepo, or the workbench (`workbench/docs`), with a command:
it is not deployed with the boot, you deploy it. A service like every
mrepo: its boot hooks activate `help`, `info`, `runtime` and `service`;
its `commission`, run as its runtime starts, initialises it (its info
extracted, by its `initialise` hook) and starts it before the deploy
answers.

```
haicc . boot/deploy docs haiccing/base-component-docs
haicc docs info/get
haicc docs info/get hdlc
```

## Its files

- No protocol and no code of its own: `main.js` is the dispatcher, the
  bundle's main, generated; it offers the tests.
