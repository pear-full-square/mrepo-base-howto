# howtos-node

A how-to's mrepo deployed below a howtos node: its unique URI the path below it.

A node whose document says `{"kind":"howtos"}` is the root of a
namespace: an mrepo below it has the path below it as its unique URI,
a how-to's key (`<org>/<package>/howto/<name>`) then its own name. It is
placed by that path under the work folder's `mrepos/`, and kept in the
registry by it. No unique URI is a prefix of another's: an mrepo inside
another's folder is refused.

## Steps

```sh
# the howtos node, then the nodes of a how-to's key below it
haicc . crud/create howtos '{"kind":"howtos"}'
haicc . crud/create howtos/haiccing/base-package-crud/howto/query
# the how-to's mrepo: haiccing/base-package-crud/howto/query/boot
haicc . boot/deploy howtos/haiccing/base-package-crud/howto/query/boot haiccing/base-package-runtime
# in the registry by its path
haicc . crud/read registry/haiccing/base-package-crud/howto/query/boot
# inside its folder, by another howtos node: refused (a unique URI is never a prefix of another's)
haicc . crud/create more '{"kind":"howtos"}'
haicc . crud/create more/haiccing/base-package-crud/howto/query/boot
haicc . boot/deploy more/haiccing/base-package-crud/howto/query/boot/inner haiccing/base-package-runtime
# a how-to's mrepos torn down through the registry, by its key
haicc . boot/teardown "registry/haiccing/base-package-crud/howto/query/*"
```

## Notes

- **One name below it** is no unique URI: a namespace and a name at
  least.
- **A swarm in a how-to's namespace**: what a how-to's mrepo deploys is
  in its namespace, a swarm's nodes too
  (`.../howto/query/swarm-1/node-1`).
