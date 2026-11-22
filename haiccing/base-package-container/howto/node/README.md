# node

A swarm's node given its container, the mrepo in it reached, and removed again.

The node is the bridgehead: a standard mrepo on the host, in service, its
`container` protocol open. Its replica runs in a container; from then on
`haicc container` at the node sends a command on into it, as to any
linked mrepo. Docker, its daemon running, is needed.

## Steps

```sh
# the node, in the host, in service by its commission
haicc host boot/deploy swarms/swarm-1/node-1 haiccing/base-component-haicc
# its replica made and run in a container
haicc host haicc swarms/swarm-1/node-1 container/create
haicc host haicc swarms/swarm-1/node-1 container/start
haicc host haicc swarms/swarm-1/node-1 container/status
# the mrepo in the container, in service by its own commission as its container started, reached through the node
haicc host haicc swarms/swarm-1/node-1 haicc container crud/read .
# removed before the node is torn down: boot/teardown does not know of containers
haicc host haicc swarms/swarm-1/node-1 container/remove
haicc host boot/teardown swarms/swarm-1/node-1
```

## Notes

- **The haicc component's script `cluster`** does this for two nodes.
