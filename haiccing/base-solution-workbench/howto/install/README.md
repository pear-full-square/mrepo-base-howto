# install

A fresh machine to the workbench: host, docs and Splectral in service, by one deploy.

The `haicc` command is installed and its sources linked
(`base-linux-haicc`, the how-to `install`). The boot mrepo is put in
place, then the workbench deployed at `workbench`: its mrepo,
`local/workbench`, and its script, run at the root after it, deploys the
docs mrepo, the host and Splectral beside it and brings the host and
Splectral into service.

## Steps

```sh
# the boot mrepo, the root of the install
haicc boot/deploy
# the workbench: its mrepo, then the install's mrepos beside it
haicc . boot/deploy workbench haiccing/base-solution-workbench
# what the install is made of: the registry
haicc . crud/read "registry/local/*"
# the host answers, in service (started again: not now, the service is started)
haicc host crud/read .
haicc host service/start
# Splectral in service: its server's address
haicc splectral splectral/status
# the documentation
haicc docs info/get
# the howtos namespace, in the workbench
haicc workbench crud/read howtos
```

## Notes

- **Once on an install**: a second deploy of it stops at the docs mrepo,
  `deployed already: docs`.
- **Torn down** one by one (`haicc . boot/teardown workbench`, then each
  of the others), or with the install, `haicc boot/teardown`.
