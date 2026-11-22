# lifecycle

An mrepo brought into service and back: made ready, its door opened, closed, shut down.

A service-managed mrepo starts `booted`. Each action is allowed in one
state and moves it on; its hooks do the work of the transition.

## Steps

```sh
# deployed: its commission brought it into service (its initialise hooks, its info extracted; its start hooks, its door opened)
haicc . boot/deploy host haiccing/base-component-haicc
# what is behind the door allowed
haicc host boot/deploy node-1 haiccing/base-package-runtime
haicc host boot/teardown node-1
# its door closed again: boot refused (not now) until the next start; its runtime runs on
haicc host service/stop
# back to booted
haicc host service/shutdown
# made ready and opened again
haicc host service/initialise
haicc host service/start
```

## Notes

- **An action in the wrong state** is refused, `not now`, with the
  state the service is in: `not now: service start (the service is
  started)`.
- **Behind the door**: `boot` and `crud` in a host, refused while it is
  not started.
- **Received, not held**: a request its state does not allow is taken
  in and answered refused at once; it does not wait for the state.
- **The mrepo's own lines pass**: a hook's lines, its commission's, are
  not asked whether a protocol is active: the door is closed to the
  outside.
