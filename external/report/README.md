# report

The last run of a how-to, from the request log: each line, its answer whole, its checks, what it changed, its time.

## Signature

`report(exec, { args })`: requested as `howto/report . <org>/<package>/<name> [json|md]`.

## Arguments

1. The how-to, by its key.
2. The format: `json`, the default, or `md`, Markdown to read.

## Returns

- `json`: `{ howto, kind, at, passed, steps, ran, scene, done, answer }`,
  `kind` `run` or `stepped` (its steps since its first), `at` when it
  began; each line `{ line, n, key, answer, ok, checks, failed?, ms,
  changed }`, its answer whole and its metrics and changes from its own
  record (`request.metrics`, `request.changed`); `answer`, a line a
  block, in natural language.
- `md`: `{ howto, passed, markdown, answer }`, the same as a page, a
  section a block; `answer` its lines.

## Errors

- As `run`'s, for the key.
- No format of those: `no format: ...`.
- Never run here: `no run of <key> here yet`.

## Design

- **From its own request log**: the run's record names each line's
  request; the report reads them, nothing written for it. The traces of
  Track B come with it.
