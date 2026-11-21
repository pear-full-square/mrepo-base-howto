# scripts/

The workbench's script: the install's mrepos, deployed beside it.

`solution.haicc` makes the package a solution: every deploy of it
answers with the script as its continuation, unasked, for the
deployer's own position, and the `haicc` command sends it on,
`haicc/script .`: its lines, each a simple command, run at the deployer,
the first that fails ending it.

```
haicc . boot/deploy workbench haiccing/base-solution-workbench
```

| script | |
|---|---|
| `solution.haicc` | the docs mrepo deployed (`docs`), the host deployed and brought into service (`host`), Splectral deployed and brought into service, its server started (`splectral`): `local/docs`, `local/host`, `local/splectral` |
