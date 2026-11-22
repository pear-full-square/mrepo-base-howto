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

The state comes with `base-package-service`, in every mrepo's list (the
boot mrepo, the root, the one exception: nothing upstream manages it);
its actions and the states that allow each are that protocol's config.
A request its state does not allow is received and refused, answered
`not now`, not held; the mrepo's own lines (its hooks) are not asked
whether a protocol is active: the door is closed to the outside.
`service/stop` and `service/shutdown` leave the runtime running: only a
teardown stops it.

## Hooks

What the mrepo runs on a status transition: a file a transition, its
lines simple commands, standing at `main`.

```
/runtime/hooks/boot.haicc           protocol/activate . info
                                    protocol/activate . service
/runtime/hooks/commission.haicc     service/initialise
                                    service/start
/runtime/hooks/initialise.haicc     info/extract
/runtime/hooks/start.haicc          protocol/activate . boot
/runtime/hooks/stop.haicc           protocol/deactivate . boot
/runtime/hooks/decommission.haicc   boot/teardown <what it deployed>
```

- `boot`: run by the runtime as it starts, every time, after it has
  opened the protocol protocol itself; nothing else is taken from the
  inbox until its lines are done. The activations only: an mrepo's
  setup is its `initialise`, a visible state.
- `commission`: run by the runtime after `boot`, at every start (a
  deploy; a restart, a replica's with its container, runs it again: its
  lines idempotent, nothing recorded); the deploy waits for it, a line that fails failing the deploy with nothing
  of the mrepo left. What the mrepo does once deployed: its components
  deployed first, each commissioned by its own (the cascade), then its
  service initialised and, as its package says, started.
- `decommission`: run when a teardown asks, before the runtime is
  stopped: what it deployed torn down, each teardown decommissioning that
  one. A line that fails stops the teardown, nothing removed.
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
writer, serves a local connection (`<dir>/runtime.sock`: `status` (its
commission's state in it), `stop`, `decommission`;
a short path in the temporary folder when that one is too long), loads
every protocol its linked packages offer, fires its `boot` hooks, then
its `commission`, and runs the requests in turn. It names no protocol
itself.

It runs until it is stopped: a parent's teardown stops its child's.
