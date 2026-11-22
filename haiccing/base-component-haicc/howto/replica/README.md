# replica

Gives a swarm's node its replica in a container, and brings the replica into service.

The node is deployed and started (the how-to `deploy`). Docker is
needed: the replica is an mrepo built from the node's own package, run
in a container.

## Steps

```sh
# the replica made, and the container that will run it
haicc host haicc swarms/swarm-1/node-1 container/create
# the container started: the replica's runtime runs in it, its commission
# bringing it into service (once: a restart of its container does not again)
haicc host haicc swarms/swarm-1/node-1 container/start
# the replica answers, reached through its node
haicc host haicc swarms/swarm-1/node-1 haicc container crud/read .
# the check: the node says its container runs
haicc host haicc swarms/swarm-1/node-1 container/status
```

## After

Before the node is torn down its replica is removed: the host's
`boot/teardown <position>`, the boot protocol's at an mrepo, does not
know of a replica's container. The machine's `haicc boot/teardown`
removes every container of the install with the rest.

```sh
haicc host haicc swarms/swarm-1/node-1 container/remove
haicc host boot/teardown swarms/swarm-1/node-1
```
