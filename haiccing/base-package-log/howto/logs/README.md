# logs

Reads a swarm's logs at its master: every node's records in one view, or one node's.

A swarm is there with its master and two nodes (the swarm package's
how-to `swarm`). Every command a node completes is a record of its log;
the master holds every node's. The steps beside this page,
`steps.haicc`, are the same commands with what each answers.

## Steps

```sh
# something for a node to log
haicc host/swarms/swarm-1/node-1 crud/create notes/a
# its log synced to the master now (it would be within some seconds)
haicc host/swarms/swarm-1/node-1 log/status . sync
# every node's log, in one view, the newest last
haicc host/swarms/swarm-1/master log/read
# one node's, its last five records
haicc host/swarms/swarm-1/master log/read . swarm-1/node-1 5
# a node's own log, at the node
haicc host/swarms/swarm-1/node-1 log/read
# what the master collected
haicc host/swarms/swarm-1/master log/status
```

## Notes

- **In a browser**: the log viewer, a Splectral component
  (`splectral/base-component-log-viewer`).
- **What a record says**: its node, when it was completed, the command,
  whether it failed and why, how long it took; the request itself stays
  in the node.
