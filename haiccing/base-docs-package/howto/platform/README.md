# platform

An application platform: an mrepo that deploys its components and lays its own packages on top of them.

Pattern: platform

The platform links the boot protocol and offers a protocol of its own.
A component is an mrepo it deploys in two halves, a dual install:
haicc's, a plain service-managed mrepo; then the platform's, the
component's own list laid on top. Splectral is the first.

## The two halves

- **haicc's**: `boot/deploy <position> base-package-service`.
- **The platform's**: the component's list (its organisation's packages
  only) placed in that mrepo's folder on the platform's side; the mrepo
  lays the component's runtime config itself (`runtime/lay`, one
  writer).
- **The pipelines stay apart**: the mrepo's own inbox and outbox for the
  commands that manage it; a second pair on the platform's side for the
  platform's own exchange.

## Steps

```sh
# the platform's list: the boot protocol in it (and haicc, commands sent
# on to its components), activated by its boot hook
$EDITOR haiccing/<platform>/mrepo/packages/.layer.json
# its install action: the component's list placed in the mrepo's folder,
# <folder>/<side>/packages/, its second inbox and outbox made, then
#   haicc <position> runtime/lay . <side>/packages/<component>
# sent through its own inbox (haicc/script's way), the request waiting
$EDITOR pear-full-square/<module>/external/install/index.js
# a component, both halves
haicc <platform> boot/deploy <position> base-package-service
haicc <platform> <platform>/install <position> <org>/<component>
haicc <platform>/<position> service/initialise
haicc <platform>/<position> service/start
```

## Notes

- **The same commands**: a component is deployed, started, asked about
  itself and torn down as any mrepo; only `install` is the platform's.
- **Organisations kept pure**: the first half reads haiccing's sources,
  the second the component's organisation's; no list names another's.
- **Deploy and teardown**: no upgrade in place; a change is a teardown,
  then both halves again.
