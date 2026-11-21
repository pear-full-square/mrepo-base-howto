# lookup

Asks a node of a swarm who is in the swarm, who is active and where a node lives.

A swarm is there with its master and two nodes (the swarm package's
how-to `swarm`). Any node answers from its own replica of the lookup
db; the master is asked only to change it. The steps beside this page,
`steps.haicc`, are the same commands with what each answers.

## Steps

```sh
# who is registered and active, asked of a node
haicc host/swarms/swarm-1/node-1 rns/status
# the same, asked of the master: the lookup db itself
haicc host/swarms/swarm-1/master rns/status
# where a node lives: its machine, its folder there, its key
haicc host/swarms/swarm-1/node-1 rns/resolve . swarm-1/node-2
# a node stopped renews no lease: quiet once its lease ran out
haicc host/swarms/swarm-1/node-2 service/stop
haicc host/swarms/swarm-1/node-1 rns/status
# started again: active again
haicc host/swarms/swarm-1/node-2 service/start
```

## Notes

- **As of its last turn**: a node's answer is its replica's, brought up
  to date each time it renews its lease, a third of the lease apart;
  `synced` says when.
- **Quiet takes a lease**: 15 seconds unless the swarm was made with
  another (`swarm/create <position> <seconds>`).
