# scene

Where a how-to runs: its script read, a line run as a request, the scene thrown away, the runner's records read back.

## Functions

- `scriptOf(dir, key)`: the script, from its package's bundle in the
  mrepo's `packages/`; no such package, or no such how-to (those it
  has named), an error.
- `senderOf(exec)`: the runtime's way into its own inbox, for a job the
  request waits for.
- `runLine(sender, line)`: the line sent (`mrepo-base-request`'s `send`,
  its key given), its answer; a continuation it answers with sent on as
  `haicc/script`, as the terminal does, its answer after the line's.
  `{ n, line, key, keys, answer, ok, checks }`.
- `runBlock(sender, block)`: its lines in order, the first that fails
  ending it.
- `clear(sender)`: the scene thrown away: every mrepo the steps deployed
  torn down from the inside out, by each one's links layer (`crud/read
  "*" --flags layer=links` at it), what it linked first, then itself at
  the position that links to it; a container's node not looked into (its
  platform's); then main emptied but `registry`, the registry's swarm
  nodes too. `{ torn: [position...], removed: [node...] }`.
- `recordsOf(exec)`, `formOf(exec, key)`: the runner's own records in
  the request log, oldest first; one request's form by its key.

## Design

- **Through its own inbox**: a line is a request from outside, checked
  at the door; the request that runs it waits (`exec.wait`), the runtime
  free to execute the lines meanwhile.
- **The request log is the state**: where stepping is and what a report
  says are read from the records, nothing kept beside them.
