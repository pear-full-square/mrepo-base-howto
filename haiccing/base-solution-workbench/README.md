# base-solution-workbench

The workbench, a solution: the local manager, its docs mrepo and Splectral below it, in service by one deploy.

A development and testing environment; a solution, the mrepos an install
is made of. Deployed as any mrepo is, named by the segment it is
deployed at: `workbench`, `local/workbench`. Its `commission`, run by
its runtime as it starts, deploys its components below it, each
commissioned by its own, then brings it into service (below,
"Deploying"); its `decommission` tears them down with it. It fulfils the
host's role and holds the `howtos` namespace.

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
- [base-package-haici](../base-package-haici/)
- [base-package-protocol](../base-package-protocol/)
- [base-package-boot](../base-package-boot/)
- [base-package-service](../base-package-service/)
- [base-package-haicc](../base-package-haicc/)
- [base-package-crud](../base-package-crud/)
- [base-package-container](../base-package-container/)
- [base-package-swarm](../base-package-swarm/)

## Deploying

On a fresh install, after `haicc boot/deploy`, one command at the root:

```
haicc . boot/deploy workbench haiccing/base-solution-workbench
```

The deploy starts its runtime and waits for its `commission`: the docs
mrepo deployed at `workbench/docs` and Splectral
at `workbench/splectral` (their unique URIs `local/docs`,
`local/splectral`, placed in the install's registry, `<work>/mrepos/`,
and linked in the workbench: forward visibility), each in service by
its own commission; then the help viewer installed in its Splectral
(`workbench/splectral/help`), in service: the workbench's help view, the
docs mrepo found by its unique URI, `local/docs`; then the workbench
initialised and started. The deploy answers once all of it is
done (`commission: "done"`, `service: "started"`); a line that fails
fails it, nothing left. `haicc . boot/teardown workbench` runs its
`decommission` first: the help viewer, its components torn down, then
the workbench.

## The howtos namespace

The workbench's `main` has the node `howtos`, its document
`{"kind":"howtos"}`, made by its boot hook: the root of a namespace. An
mrepo the workbench deploys below it has the path below it as its unique
URI: `howtos/haiccing/base-package-crud/howto/query/boot` is
`haiccing/base-package-crud/howto/query/boot`, placed at
`<work>/mrepos/haiccing/base-package-crud/howto/query/boot/`, the
install's registry, and linked at its position in the workbench. A
how-to installed there sees forward only: its own mrepos, nothing of
the workbench.

## Its files

- No protocol and no code of its own: `main.js` is the dispatcher, the
  bundle's main, generated; it offers the tests.
- `mrepo/runtime/hooks/commission.haicc`, `decommission.haicc`: what it
  does once deployed, and before it goes.
