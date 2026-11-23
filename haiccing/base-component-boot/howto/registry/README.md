# registry

The install's mrepos listed: from the registry, the work folder's `mrepos/`, and from the managing mrepo's links.

The registry is the install's, for its system administration: every
mrepo is placed in the work folder's `mrepos/`, by its unique URI
(`<work>/mrepos/local/host`, `<work>/mrepos/swarm-1/node-1`), made by the
boot program, kept by `boot/deploy` and `boot/teardown`. Nothing in an
mrepo copies it. What an mrepo manages, it sees through its links, in
forward visibility only: its shortcuts and its links layer.

## Steps

```sh
# every mrepo of the install, from the registry: its unique URI, where
# it is from the root, its package, running or not
haicc . haicc/mrepos
# one by its unique URI; a namespace's; by what its record says
haicc . haicc/mrepos local/docs
haicc . haicc/mrepos "local/*"
haicc . haicc/mrepos "*/*[package='haiccing/base-component-docs']"
# what the boot mrepo deployed itself: its links, at main
haicc . crud/read "*"
```

## Notes

- **Consulted, never written**: `haicc/mrepos` reads it; a position it
  gives is used like any other (`haicc workbench/docs info/get`).
- **No mrepo inside another's folder**: a unique URI is never a prefix
  of another's, so each `.git` under `mrepos/` is one mrepo; its unique
  URI its identity's (the boot mrepo's folder `mrepos/boot`, its unique
  URI `local/boot`), every other's its path.
- **A teardown** removes its folder and its link; a teardown of what is
  not deployed is a warning (idempotent).
