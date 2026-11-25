# feedback

Feedback on a command, recorded where the command would run, not executing it: the request's own record is the store.

## Signature

`feedback(exec, { uri, args, flags })`: requested as `haici/feedback
<URI> <text> <protocol>/<action> [<argument>...]`, or made by `--flags
feedback <text>` on the command itself.

## Arguments

- `uri`: the command's URI, where it would run.
- `args`: the text, then the command's `<protocol>/<action>` (the
  protocol alone: its default action), then its own arguments.
- `flags`: the command's other flags, kept in the command as understood.

## Returns

`{ feedback, on, id, read, answer }`: `recorded`; the command as
understood; the request's id (`exec.id`), what is acted on, in a fixed
place; the command that reads it back here (`crud/read "done/*[@offset=<id>]"
--flags layer=request`: its record's address); `answer`, the same in natural language, a line
each, what the `haicc` command prints (the record with `--raw`).

## Errors

- No text: `missing argument: text`.
- No command after it: `missing argument: command`.

## Design

- **The request log is the store** (the team, 2026-11-20): it writes
  nothing; its request's record holds the text and the command (its
  arguments) and its answer, in `request/done` once done, under its
  offset: its address `done/*[@offset=<id>]`, read with
  `layer=request`.
- **Nothing of the command executed**, nor checked: feedback can be
  given on anything that exists as a command, one the door would refuse
  too.
- **Where it stands**: the command it answers is written here, at the
  mrepo it runs in; from the terminal, after the position typed
  (`haicc host ...`).
