# swarm

Makes a swarm on a host: its master and its lookup db, two nodes deployed into it and registered.

The host is deployed and in service (the boot component's how-to
`deploy`). Each command answers once all of its steps are done: a node
deployed is in service and registered. The steps beside this page,
`steps.haicc`, are the same commands with what each answers.

## Steps

```sh
# the swarm: its node in the host's main, its master, its lookup db
haicc host swarm/create swarms/swarm-1
# two nodes, each deployed, brought into service and registered by the host
haicc host swarm/deploy swarms/swarm-1/node-1
haicc host swarm/deploy swarms/swarm-1/node-2
# the check: who is registered and active, as the master has it
haicc host swarm/status swarms/swarm-1
# the swarm's node: its kind, its master, where its lookup db is
haicc host crud/read swarms/swarm-1
# a node taken out again: out of the lookup db, then torn down
haicc host swarm/leave swarms/swarm-1/node-2
```

## Notes

- **A lease**: `swarm/create swarms/swarm-1 5` makes a node quiet five
  seconds after its last renewal; 15 when none is given.
- **A step that failed**: the command says which; asked again, it goes
  on from what is there.
- **Each node answers for the swarm**: the rns package's how-to
  `lookup`.
