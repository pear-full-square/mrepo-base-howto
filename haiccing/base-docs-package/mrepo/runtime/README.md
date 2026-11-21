# /runtime

The runtime's data: the mrepo's identity, its hooks, and the service state where it has a service.

The layer is atomic. Its identity is written when the mrepo is deployed.
Its hooks and its service state are its runtime config: dropped in by the
package that defines the mrepo, the last of its list.

## Identity

`mrepo.json` holds the mrepo's unique URI, `{ "uri": "local/host" }`:
a path, its namespace then its name (`<swarm>/<node>`), with `local` as
the namespace of what the boot mrepo creates.
It is written when the mrepo is deployed. The runtime addresses the mrepo
by it: its inbox is `/<uri>/inbox`. Without one, the mrepo's name is used.

## Service states

The service states and what each allows:

| state | allowed |
|---|---|
| booted | `initialise` |
| initialised | `start`, `shutdown` |
| started | `stop`, and the protocols behind the service's door |

The state comes with `base-package-service`; its actions and the states
that allow each are that protocol's config.

## Hooks

What the mrepo runs on a status transition: a file a transition, its
lines simple commands, standing at `main`.

```
/runtime/hooks/boot.haicc         protocol/activate . info
                                  info/extract
/runtime/hooks/initialise.haicc   info/extract
/runtime/hooks/start.haicc        protocol/activate . boot
/runtime/hooks/stop.haicc         protocol/deactivate . boot
```

- `boot`: run by the runtime as it starts, every time, after it has
  opened the protocol protocol itself; nothing else is taken from the
  inbox until its lines are done.
- `initialise`, `start`, `stop`, `shutdown`: run by the service; the
  transition waits for its lines, then moves the state. A line that
  fails fails the transition: the state stays.
- Each line a request of the mrepo's own, internal, recorded; the first
  that fails ends the file. Only the package that defines the mrepo
  drops them in.

## Process

The runtime is a process, one an mrepo, started from the mrepo's own
`packages/` by its folder (`bare <dir>/packages/haiccing/
base-package-runtime.bundle <dir>`): it holds the store as its single
writer, serves a local connection (`<dir>/runtime.sock`: `status`, `stop`;
a short path in the temporary folder when that one is too long), loads
every protocol its linked packages offer, fires its `boot` hooks, and runs
the requests in turn. It names no protocol itself.

It runs until it is stopped: a parent's teardown stops its child's.
