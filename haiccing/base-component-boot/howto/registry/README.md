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
# every mrepo of the install: a folder with .git, by its unique URI
find "$WORK/mrepos" -name .git -prune | sed "s|^$WORK/mrepos/||; s|/.git$||"
# what the boot mrepo deployed: its links, at main
haicc . crud/read "*"
# one of them, as its link's record says (where, from which package, its runtime)
haicc . haicc/goto host
```

## Notes

- **No mrepo inside another's folder**: a unique URI is never a prefix
  of another's, so each `.git` under `mrepos/` is one mrepo, its path
  its unique URI.
- **A teardown** removes its folder and its link; a teardown of what is
  not deployed is a warning (idempotent).
