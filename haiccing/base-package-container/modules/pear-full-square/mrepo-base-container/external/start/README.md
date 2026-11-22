# start

Starts the replica's container and waits until the replica's runtime runs in it, its commission done.

The runtime is up when its socket is there, in the replica's folder,
and the container is running: its inbox is then taken in, and the
bridgehead reaches it as any linked mrepo (`haicc container ...`). Then
its commission, which its runtime runs as it starts (the replica's
package's: typically its service initialised and started), is waited
for: started, the replica is in service. Once only: a container started
again does not run it again.

## Signature

`start(exec)`: requested as `container/start`, at the mrepo itself.

## Returns

`{ started, container, state, service }`: the position, `container`; the
container's name; its state, `running`; the replica's service state as
its commission left it (`started`; `null`: none). A container that runs already
is left as it is and answered the same.

## Errors

- No replica: `container/create` first.
- No Docker daemon answers: `no Docker`.
- Its container is gone: removed outside this protocol.
- The container does not start, or ends, or its runtime is not up
  within twenty seconds: with the last line the container said.
- Its commission fails: `its commission failed in its container`, the
  line said.
