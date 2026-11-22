# howtos-node

A how-to's mrepo deployed below a howtos node: its unique URI the path below it.

A node whose document says `{"kind":"howtos"}` is the root of a
namespace: an mrepo below it has the path below it as its unique URI,
a how-to's key (`<org>/<package>/howto/<name>`) then its own name. It is
placed by that path under the work folder's `mrepos/`, the install's
registry, and linked at its position. No unique URI is a prefix of
another's: an mrepo inside another's folder is refused.

## Steps

```sh
# the howtos node, then the nodes of a how-to's key below it
haicc . crud/create howtos '{"kind":"howtos"}'
haicc . crud/create howtos/haiccing/base-package-crud/howto/query
# the how-to's mrepo: haiccing/base-package-crud/howto/query/boot
haicc . boot/deploy howtos/haiccing/base-package-crud/howto/query/boot haiccing/base-package-runtime
# linked at its position
haicc . crud/read howtos/haiccing/base-package-crud/howto/query/boot
# inside its folder, by another howtos node: refused (a unique URI is never a prefix of another's)
haicc . crud/create more '{"kind":"howtos"}'
haicc . crud/create more/haiccing/base-package-crud/howto/query/boot
haicc . boot/deploy more/haiccing/base-package-crud/howto/query/boot/inner haiccing/base-package-runtime
# torn down at its position
haicc . boot/teardown howtos/haiccing/base-package-crud/howto/query/boot
```

## Notes

- **One name below it** is no unique URI: a namespace and a name at
  least.
- **A swarm in a how-to's namespace**: what a how-to's mrepo deploys is
  in its namespace, a swarm's nodes too
  (`.../howto/query/swarm-1/node-1`).
