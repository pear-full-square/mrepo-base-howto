# dispatch

Sends a command from one node of a swarm to another by its unique URI.

A swarm is there with its master and two nodes (the swarm package's
how-to `swarm`). A node names another by its unique URI,
`swarm-1/node-2`, not by a position: its rns says where that node
lives, and the command is delivered to it directly. The steps beside
this page, `steps.haicc`, are the same commands with what each answers.

## Steps

```sh
# from node-1, a command at node-2, by its unique URI
haicc host/swarms/swarm-1/node-1 haicc swarm-1/node-2 crud/create notes/sent
# the check: it is in node-2's main, and not in node-1's
haicc host/swarms/swarm-1/node-2 crud/read notes/sent
haicc host/swarms/swarm-1/node-1 crud/read notes/sent
# the same, asked of dispatch by name
haicc host/swarms/swarm-1/node-1 dispatch/send swarm-1/node-2 crud/read notes/sent
# a position below the node: what follows its unique URI
haicc host/swarms/swarm-1/node-1 haicc swarm-1/node-2/notes crud/read sent
# the master is a node as any other
haicc host/swarms/swarm-1/node-2 haicc swarm-1/master rns/status
# the path it took: resolved, then dispatched by the folder
haicc --raw host/swarms/swarm-1/node-1 haicc swarm-1/node-2 crud/read notes/sent --flags log=verbose
```

## Notes

- **Not through the host**: `host/swarms/swarm-1/node-2` is a position,
  reached through the host's shortcuts; `swarm-1/node-2` is the node
  itself, wherever it lives.
- **Another machine**: refused for now, with the machine it lives on.
