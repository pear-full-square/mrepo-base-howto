# annotate

Explains a command where it would run, not executing it: what it does, the door here and now, its arguments.

## Signature

`annotate(exec, { uri, args, flags })`: requested as `help/annotate
<URI> <protocol>/<action> [<argument>...]`, or made by `--flags help` on
the command itself.

## Arguments

- `uri`: the command's URI, where it would run.
- `args`: the command's `<protocol>/<action>` (the protocol alone: its
  default action), then its own arguments.
- `flags`: the command's other flags, checked with it.

## Returns

`{ help, does, door, arguments, run, more, answer }`, each a short line: the
command as understood; what its action does (its config's description);
the door's answer here and now (`taken here, now`, or `refused here:`
and why); the arguments its action names against those given; the
command to run it here; the command that reads its page here (an action
not there: its protocol's; a protocol not here: the top); `answer`, the
same in natural language, a line each, what the `haicc` command prints
(the record with `--raw`).

## Errors

- No command given: `missing argument: command`.

## Design

- **The door as the command would meet it**: the request check
  (`mrepo-base-request`'s `check`) on the command, from outside, as it
  executes: the protocol loaded and active, the action configured, its
  URI one the action offers, the service's state, what its config asks
  for given.
- **Nothing executed**: it reads, it writes nothing.
- **Where it stands**: the commands it answers are written here, at
  the mrepo it runs in; from the terminal, after the position typed
  (`haicc host ...`).
