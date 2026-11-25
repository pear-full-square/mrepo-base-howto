# run

A how-to run through: its scene thrown away and prepared, every step and check, the first failing line ending it.

## Signature

`run(exec, { args })`: requested as `howto/run . <org>/<package>/<name>`,
at the mrepo the how-to runs in; `howto` alone is `howto/run`.

## Arguments

1. The how-to, by its key: `haiccing/base-package-crud/query`, its
   package placed in the mrepo.

## Returns

`{ howto, passed, steps, ran, needs, cleared, scene, done, answer }`:
whether every line passed; how many steps it has and how many ran; what
it needs (`# needs:`); what was thrown away first; the scene's lines and
each step's, `{ title, ok, lines: [{ n, line, offset, offsets, answer, ok,
checks, failed? }] }`, each answer cut to its start (whole in its
line's record, read by `report`); `answer`, the outcome in natural
language, the line that did not pass with what was expected of it and
what it answered.

## Errors

- No key, or not one: `not a how-to: ...`.
- Its package not in the mrepo, or no such how-to: said, with the
  how-tos it has.
- Its script not in the form: the line, and why (`internal/script`).

A line that does not pass is no error: the run answers, `passed: false`.

## Design

- **The request waits** (`exec.wait`): the lines are requests of their
  own in the same mrepo, each recorded; its offset in the run's answer.
- **The scene thrown away first**: a run starts from what a deploy
  gives, whatever ran before it.
