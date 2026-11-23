# install

A fresh machine to the workbench: the local manager, its docs mrepo and Splectral in service, by one deploy.

Pattern: commission

The `haicc` command is installed and its sources linked
(`base-linux-haicc`, the how-to `install`). The boot mrepo is put in
place, then the workbench deployed at `workbench`, `local/workbench`. Its
runtime, as it starts, runs its `commission`, and the deploy waits for
it: the workbench's components deployed below it (`workbench/docs`,
`workbench/splectral`), each commissioned by its own, then the workbench
itself initialised and started.

## Steps

```sh
# the boot mrepo, the root of the install
haicc boot/deploy
# the workbench: deployed, commissioned: its components, then itself in service
haicc . boot/deploy workbench haiccing/base-solution-workbench
# what the workbench deployed: its links, docs and splectral
haicc workbench crud/read "*"
# Splectral in service: its server's address; its help view at /help/, the docs mrepo's pages
haicc workbench/splectral splectral/status
# where the docs mrepo is, from the registry
haicc . haicc/mrepos local/docs
# the documentation
haicc workbench/docs info/get
# the howtos namespace, in the workbench
haicc workbench crud/read howtos
# torn down: its decommission first, its components with it
haicc . boot/teardown workbench
```

## Notes

- **The host's role**: the workbench is the local manager, its list the
  haicc component's packages; swarms and their nodes are deployed in it
  as in a host.
- **Once on an install**: a second one's commission stops at its first
  component, `in the way`: their unique URIs (`local/docs`) are the
  install's; nothing of the second is left.
- **What runs it**: the commission is a hook, the mrepo's own lines; a
  line that fails fails the deploy, saying which.
