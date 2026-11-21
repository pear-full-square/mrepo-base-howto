# client

Asks the node's log, its program, over its socket in the mrepo's folder.

## Signature

`ask(dir, body, { timeout })`: the program of the mrepo in `dir` asked,
`{ op, ... }`.

## Returns

The program's answer.

## Errors

- No program behind the socket: `the log is not running here`, with how
  it is started.

## Also exported

- `SIDE`: `log`, its side of the mrepo's folder; `SOCKET`: its socket's
  name there.
