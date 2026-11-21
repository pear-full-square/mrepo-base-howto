# mrepo-base-container

The mrepo container protocol: an mrepo's replica made in a container, started, stopped and removed.

A swarm node is two mrepos: the bridgehead on the host, a standard
mrepo, and its replica in a container. The actions are executed by the
bridgehead and are about its own replica: an mrepo built from the
bridgehead's own package, run by Bare inside a Docker container. Its
unique URI is the bridgehead's with `container` behind it:
`swarm-1/node-1/container`. The bridgehead links it at the position `container`
and reaches it as any linked mrepo, through its inbox and outbox
folders. Offered by `haiccing/base-package-container`.

## Links

- [external](external/)
- [internal](internal/)
- [test](test/)

## Commands

```
haicc swarms/swarm-1/node-1 container/create
haicc swarms/swarm-1/node-1 container/start
haicc swarms/swarm-1/node-1 container/status
haicc swarms/swarm-1/node-1 haicc container service/initialise
haicc swarms/swarm-1/node-1 container/stop
haicc swarms/swarm-1/node-1 container/remove
```

## Placement

A replica's folder is placed by its bridgehead's unique URI under the
work folder's `containers/`, `<work>/containers/<unique URI>`, beside `mrepos/`,
where its bridgehead is. It is the one folder its container can write:
seen inside it as `/mrepo`. The bridgehead holds a node for it in its
`main`, a shortcut at `container`, and the link's record in its `links`
layer: how it came about (`container`), where it is, its package, and
its container's name and image. It is not in the mrepo registry, which
is for the mrepos on the host.

## The container

- **The image** is Bare on a plain base, `haicc-node:<hash>`, named by
  the Bare binary it holds: the one that runs the bridgehead. It is
  built once, when no image of that name is there; the base,
  `debian:bookworm-slim`, is pulled by Docker then.
- **Its name** is `haicc-<unique URI, its slashes hyphens>-<hash>`, the hash of the
  replica's folder: two installs on one machine do not meet.
- **What it runs**: the replica's runtime, from the replica's own
  packages, as the user who owns the folder. Its root is read only, its
  capabilities dropped; `/tmp` is in memory.
- **Its network** is Docker's default bridge. The nodes finding each
  other is not built.

## Rules

- **At the mrepo itself**: every action is requested at `.`, the mrepo
  whose replica it is about. One replica an mrepo.
- **Docker is asked each time**: the container's state is Docker's, not
  recorded here. No daemon answering fails the action: `no Docker`.
- **Linux**: the bridgehead knows the replica's runtime is up by its
  socket in the mapped folder, which needs the host and the container on
  one kernel.

## Tests

- `brittle-bare test/*.test.js` (Bare installed): the actions on an execution written for them, with Docker:
  a real container made, started, reached, stopped and removed. It fails
  where no Docker daemon answers.
