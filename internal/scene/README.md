# scene

Where a how-to runs: its script read, a line run as a request, the scene thrown away, the runner's records read back.

## Functions

- `bundleOf(exec, pkg)`, `scriptOf(exec, key)`: a package's bundle where
  the mrepo's packages manifest says it may be: among its own packages,
  in the install's store, in a folder of its sources (read there,
  nothing installed); the script from it. No package anywhere, or no
  such how-to (those it has named), an error.
- `senderOf(exec)`: the runtime's way into its own inbox, for a job the
  request waits for.
- `runLine(sender, line)`: the line sent (`mrepo-base-request`'s `send`,
  its request's offset back with its answer), its answer; a
  continuation it answers with sent on as `haicc/script`, as the
  terminal does, its answer after the line's. `{ n, line, offset,
  offsets, answer, ok, checks }`.
- `runBlock(sender, block)`: its lines in order, the first that fails
  ending it.
- `clear(sender)`: the scene thrown away: every mrepo the steps deployed
  torn down from the inside out, by each one's links layer (`crud/read
  "*" --flags layer=links` at it), what it linked first, then itself at
  the position that links to it; a container's node not looked into (its
  platform's); then main emptied. `{ torn: [position...], removed:
  [node...] }`.
- `recordsOf(exec)`, `formOf(exec, offset)`: the runner's own records in
  the request log, in the order they arrived (by offset); one request's
  form by its offset. `request/done` read through the request module's
  `layer`, a streaming layer as it stores it.

## Design

- **Through its own inbox**: a line is a request from outside, checked
  at the door; the request that runs it waits (`exec.wait`), the runtime
  free to execute the lines meanwhile.
- **The request log is the state**: where stepping is and what a report
  says are read from the records, nothing kept beside them.
