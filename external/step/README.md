# step

A how-to a step at a time: the next step run, each answer whole; the first throws the scene away and prepares it.

## Signature

`step(exec, { args })`: requested as `howto/step . <org>/<package>/<name>`.

## Arguments

1. The how-to, by its key.

## Returns

`{ howto, step, of, title, ok, lines, next, cleared?, scene?, answer }`:
the step run (1 the first) and how many there are, its lines with their
answers whole and their checks, the step after it (`null`: the last,
or it did not pass); with the first, what was thrown away and the
scene's lines; `answer`, each line and its answer, or what did not pass.

## Errors

- As `run`'s, for the key and the script.
- Its last step did not pass: `step <n> failed (howto/reset . to start
  again)`.
- Every step done: `all <n> steps done (howto/reset . to step through
  again)`.

## Design

- **Where it is, from the request log**: the runner's own records,
  newest first: after a reset or a run, or another how-to's first step
  (each throws the scene away), the first; else the one after its last.
  Nothing kept beside them.
