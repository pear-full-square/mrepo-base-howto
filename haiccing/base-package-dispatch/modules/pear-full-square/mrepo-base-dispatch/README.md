# mrepo-base-dispatch

The mrepo dispatch protocol: a command routed to the node of the swarm its unique URI names, resolved by rns.

Every node of a swarm runs it. `dispatch/send <unique URI> <command>`
resolves the node in the lookup db this node holds and delivers the
command to it directly; its answer comes back the same way. `haicc
<unique URI> <command>` at a node is sent the same way when the URI is
no position of the node's own. Offered by
`haiccing/base-package-dispatch`.

## Links

- [external](external/)
- [test](test/)

## Commands

```
haicc <node> dispatch/send swarm-1/node-2 crud/read .
haicc <node> haicc swarm-1/node-2 crud/read .
```

## Design

- **Resolved by rns**: the node's own replica of the lookup db says
  where the other lives; the master is not asked and is not on the
  message's path.
- **On one machine, the folder drop**: the command is written into the
  other node's inbox folder and its answer read from its outbox folder,
  as a command sent on to a linked mrepo is. The route to a node on
  another machine is not built: said, with the machine.
- **A request and its answer**: the request waits for the answer, which
  becomes its own; the entries of what the other node did come back
  with it.
- **What follows the unique URI** is a position in that node: the
  command goes on to it there.

## Tests

- `brittle-bare test/*.test.js` (Bare installed): each test by its name in [test/](test/).
