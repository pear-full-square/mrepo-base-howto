# deploy

Deploys a node of a swarm in the host and brings it into service.

The host is deployed and started (the boot component's how-to
`deploy`). A swarm is a node in the host's `main` whose document says
so, `{"kind":"swarm"}`; a node deployed below it is that swarm's, by the
swarm node's name: `swarm-1/node-1`.

## Steps

```sh
# the swarm: a node in the host's main, its document saying it is one
haicc host crud/create swarms/swarm-1 '{"kind":"swarm"}'
# the node: an mrepo of its own, built from the haicc component; its
# commission, run by its runtime as it starts, brings it into service
# (made ready, its info extracted; its door opened) before the deploy answers
haicc host boot/deploy swarms/swarm-1/node-1 haiccing/base-component-haicc
# the check: the node answers with its root
haicc host haicc swarms/swarm-1/node-1 crud/read .
```

## Then

The node can be given its replica in a container: the how-to `replica`.
