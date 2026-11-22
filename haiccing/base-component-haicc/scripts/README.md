# scripts/

The scripts of base-component-haicc: lines of simple commands, run where the haicc command points.

A script is run by name with `haicc/file`, its lines sent as one
`haicc/script` to where its URI points, each executed there, the first
that fails ending it. Nothing runs one with a deploy: what the mrepo does
once deployed is its `commission` hook (`mrepo/`).

| script | |
|---|---|
| `cluster.haicc` | a swarm of two nodes, each with its container: `swarms/swarm-1` created in the host's `main`, its document saying it is a swarm; `node-1` and `node-2` deployed below it from this component (`swarm-1/node-1`, `swarm-1/node-2`), each brought into service by its commission, its replica made in a container and started (brought into service by its own commission); then the swarm's nodes read |

## Cluster

`cluster.haicc` is where the swarm cluster we work towards is written
down as it grows: what runs today is in it; what a swarm still needs
(a node made a swarm node, the nodes finding each other) is added as it
is built. It needs Docker: the `container` protocol makes real
containers. It leaves them running: each is removed with
`container/remove` at its node, before the node is torn down.
