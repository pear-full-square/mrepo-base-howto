# base-solution-workbench

The workbench, a solution: one deploy installs the docs mrepo, the host and Splectral beside it.

A development and testing environment; a solution, a kind beside the
package and the component: the mrepos an install is made of, deployed
and started by a script. Deployed as any mrepo is, named by the segment
it is deployed at: `workbench`, `local/workbench`. Its script, run at
the deployer, puts the docs mrepo, the host and Splectral beside it, in
service (below, "Deploying"). Its own mrepo deploys and keeps mrepos as
the boot mrepo does, and holds the `howtos` namespace.

## Links

- [mrepo](mrepo/)
- [scripts](scripts/)
- [howto](howto/)
- [test](test/)
- [test-reports](test-reports/)
- [modules](modules/)

## Included packages

- [base-package-runtime](../base-package-runtime/)
- [base-package-info](../base-package-info/)
- [base-package-help](../base-package-help/)
- [base-package-haici](../base-package-haici/)
- [base-package-protocol](../base-package-protocol/)
- [base-package-boot](../base-package-boot/)
- [base-package-haicc](../base-package-haicc/)
- [base-package-crud](../base-package-crud/)

## Deploying

On a fresh install, after `haicc boot/deploy`, one command at the root:

```
haicc . boot/deploy workbench haiccing/base-solution-workbench
```

The deploy answers with its script, `scripts/solution.haicc`, as its
continuation for the root's own position, and the `haicc` command sends
it on (`haicc . haicc/script . ...`): its lines deploy the docs mrepo,
the host and Splectral at the root, each as `haicc . boot/deploy` would,
and bring the host and Splectral into service. The first line that
fails stops it, saying which: on an install that has them already,
`deployed already: docs`.

## The howtos namespace

The workbench's `main` has the node `howtos`, its document
`{"kind":"howtos"}`, made by its boot hook: the root of a namespace. An
mrepo the workbench deploys below it has the path below it as its unique
URI: `howtos/haiccing/base-package-crud/howto/query/boot` is
`haiccing/base-package-crud/howto/query/boot`, placed at
`<work>/mrepos/haiccing/base-package-crud/howto/query/boot/` and kept
in the workbench's own registry by that path. A how-to installed there
sees forward only: its own mrepos, nothing of the workbench.

## Its files

- No protocol and no code of its own: `main.js` is the dispatcher, the
  bundle's main, generated; it offers the tests.
- `scripts/solution.haicc`: what makes it a solution.
