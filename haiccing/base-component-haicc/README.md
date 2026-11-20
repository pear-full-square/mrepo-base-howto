# base-component-haicc

The haicc component: the mrepo a host or a node is managed with, a set of packages and an empty main.

A component is several packages deployed together, with nothing in `main`.
This one makes the haicc mrepo: it can deploy other mrepos, it is service
managed, and it can be addressed at a position and pass commands on.
Applications and demos are deployed on top of it; they bring the
structures in `main`, such as the folders where swarms and their nodes are
created.

## Links

- [mrepo](mrepo/)
- [scripts](scripts/)
- [howto](howto/)
- [test](test/)
- [test-reports](test-reports/)
- [modules](modules/)

## Included packages

- [base-package-runtime](../base-package-runtime/)
- [base-package-info](../base-package-info/)
- [base-package-help](../base-package-help/)
- [base-package-protocol](../base-package-protocol/)
- [base-package-boot](../base-package-boot/)
- [base-package-service](../base-package-service/)
- [base-package-haicc](../base-package-haicc/)
- [base-package-crud](../base-package-crud/)
- [base-package-container](../base-package-container/)

## Deploying

By the boot mrepo, with a command at the root. The mrepo starts `booted`:
its boot protocol, its crud protocol and its container protocol are
behind the service's door, activated by hooks on `start`. Its info is extracted by a hook on `initialise`. Each service
command answers what was done and the state now.

```
haicc . boot/deploy host haiccing/base-component-haicc
haicc host service/initialise
haicc host service/start
```

## Package

- No protocol and no code of its own: `main.js` is the dispatcher, the
  bundle's main, generated; it offers the tests.
