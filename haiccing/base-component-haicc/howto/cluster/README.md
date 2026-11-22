# cluster

A host with a swarm of two nodes, each with its replica in a container, made by one script.

The host is deployed, in service by its commission. The component's
script `cluster` is then sent to it (`haicc/script`, its lines from the
component's `scripts/cluster.haicc`): `swarms/swarm-1` made, `node-1`
and `node-2` deployed (each in service by its commission) and each given
its running replica (in service by its own), then the swarm's nodes
read. Docker is needed; the containers are left running.

## Steps

```sh
# the host, in service by its commission
haicc . boot/deploy host haiccing/base-component-haicc
# its cluster: every command of the script done in turn, at the host
haicc . haicc/script host < haiccing/base-component-haicc/scripts/cluster.haicc
# the swarm's nodes, and one node's container
haicc host crud/read "swarms/swarm-1/*"
haicc host haicc swarms/swarm-1/node-1 container/status
# taken down: each replica removed before its node, then the host
haicc host haicc swarms/swarm-1/node-1 container/remove
haicc host haicc swarms/swarm-1/node-2 container/remove
haicc . boot/teardown host
```

## Notes

- **Only the host, in service**: its deploy alone.
