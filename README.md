# mrepo-base-howto

The mrepo howto protocol: an mrepo's how-tos by activity, extracted from its packages, listed and read.

A how-to is where an activity on the platform starts: what do you want
to do here, and how. A package keeps its how-tos with what they are
about, a folder each, `howto/<name>/`. `extract` gathers those of an
mrepo's linked packages into its `howto` layer, by activity; `get`
answers what can be done here, an activity's how-tos, or one how-to's
steps. Offered by `haiccing/base-package-howto`.

| | |
|---|---|
| [external/](external/) | the howto protocol's actions |
| [internal/](internal/) | a how-to's form and its rules, the layer's extraction |
| [test/](test/) | its tests |

## Commands

```
haicc host howto
haicc host howto/get . node
haicc host howto/get . node/deploy
haicc host howto/extract
```

## A how-to

A folder in a package, `howto/<name>/`, its README:

- the title and a one-liner, as any README;
- one line `Activity: <word>`: the activity it belongs to;
- one `sh` block, its steps: each command as it is typed at the mrepo
  that holds the how-to (`.` is that mrepo), the `#` line above it
  saying why; the last step is the check that proves it worked, its why
  starting with `the check`.

It is addressed as `<activity>/<name>`. Its README is in the help
layer too, as every README is.

## Rules

- **An activity is a word a how-to declares**: there is no list of
  them. What `get` answers is what the mrepo's packages brought.
- **Not found is said, not thrown**: a word that is no activity here,
  or a how-to that is not there, is answered with what there is, and a
  warning in the request's log.
- **A how-to against its form** is left out of the layer where it
  cannot be placed (no activity, no name), and is among the problems
  `extract` counts.

## Config

`CONFIG`, in `internal/config.js`: `get`, the default action, and
`extract`, both at the mrepo itself.

## Tests

- `npm test`: a how-to read, the rules on its form, the layer
  extracted, the actions on an execution written for them.
