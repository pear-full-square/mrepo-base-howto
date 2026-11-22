# base-package-boot

The boot protocol: it deploys, tears down and redeploys the mrepos linked in an mrepo.

An mrepo that links it can deploy others. A deployed mrepo is built from
a target package's list, placed by its unique URI beside the others
(`<work>/mrepos/local/host`), gets its own runtime, is linked at its
position by a shortcut, and its link is recorded in this mrepo's `links`
layer, which the package brings. The first mrepo of a host, the boot
mrepo, is put in place by `haiccing/base-component-boot`, which links
this package.

## Links

- [deploy](modules/pear-full-square/mrepo-base-boot/external/deploy/)
- [teardown](modules/pear-full-square/mrepo-base-boot/external/teardown/)
- [redeploy](modules/pear-full-square/mrepo-base-boot/external/redeploy/)
- [howto](howto/)
- [mrepo](mrepo/)
- [test](test/)
- [test-reports](test-reports/)
- [modules](modules/)

## Config

The `boot` protocol's, in `protocol.js`: where each action is offered,
what it takes. Each needs a target: `.`, the mrepo itself, cannot be
deployed or torn down.

| action | offered at | arguments |
|---|---|---|
| `deploy` | any position below `main` | the package, required |
| `teardown` | the same | none |
| `redeploy` | as `deploy` | the package, optional: the one it was deployed from |

`--flags container` on a deploy, a routing directive: the child deployed
into a Docker container, on the container's own haicc install, which runs
it; this mrepo links it and forwards to it. Its teardown and redeploy go
to the container's platform by its link's record.

What a position means its documents say, not this config: the nearest
node above it whose document names a namespace's kind makes the child's
unique URI the path from there down: `{"kind":"swarm"}`, that swarm's
node (`<swarm>/<name>`); `{"kind":"howtos"}`, the path below it
(`haiccing/base-package-crud/howto/query/boot`); none, it is in its
parent's namespace (`local/host`). No unique URI is a prefix of
another's: a deploy that would make one is refused. `kind` names the type of a node's data structure; a
schema's name, later. The node above it is there first; a position below a
shortcut is another mrepo's, refused. A child's own children
are not torn down with it: only the machine's `haicc boot/teardown`
stops every runtime of the install.

## Package

- `protocol.js`: the `boot` protocol, its config and its actions, from
  `mrepo-base-boot`.
- `main.js`: the dispatcher, the bundle's main, generated.
- `mrepo/`: its part of an mrepo's structure, the `links` layer.
