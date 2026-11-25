# base-component-node

A swarm's node, the cell: the haicc mrepo with its swarm's lookup and dispatch on it.

A component is several packages deployed together, with nothing in
`main`. This one makes a node of a swarm: everything the haicc mrepo is,
the `rns` protocol with its program, the swarm's lookup db on the
node, and the
`dispatch` protocol, commands sent to the swarm's other nodes. A host deploys it with `swarm/create` and `swarm/deploy`, which
also bring it into service and register it.

## Links

- [mrepo](mrepo/)
- [test](test/)
- [test-reports](test-reports/)
- [modules](modules/)

## Included packages

- [base-package-runtime](../base-package-runtime/)
- [base-package-info](../base-package-info/)
- [base-package-help](../base-package-help/)
- [base-package-haici](../base-package-haici/)
- [base-package-protocol](../base-package-protocol/)
- [base-package-boot](../base-package-boot/)
- [base-package-service](../base-package-service/)
- [base-package-haicc](../base-package-haicc/)
- [base-package-crud](../base-package-crud/)
- [base-package-container](../base-package-container/)
- [base-package-rns](../base-package-rns/)
- [base-package-dispatch](../base-package-dispatch/)

## Deploying

By a host, into a swarm it made: the node deployed, brought into
service, told where the lookup db is and registered.

```
haicc host swarm/create swarms/swarm-1
haicc host swarm/deploy swarms/swarm-1/node-1
haicc host/swarms/swarm-1/node-1 rns/status
haicc host/swarms/swarm-1/node-1 crud/read "done/*" --flags layer=request
```

## The cell

Every node carries what it needs to stand on its own: its haicc, its
`rns`, its `dispatch`; each node has its own identity, a keypair of its rns'
store. Its log is its request log, as every mrepo's (`request/done`). A node in no swarm yet
runs the same: its rns answers that it is in none.

## Package

- No protocol and no code of its own: `main.js` is the dispatcher, the
  bundle's main, generated; it offers the tests.
