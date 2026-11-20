# mrepo-base-help

The mrepo help protocol: a command explained where it would run, not executed.

`--flags help` on a command makes it `help/annotate` at the same URI
(`mrepo-base-request`, the flag `help`): answered by the mrepo the
command would have run in, here and now, nothing of it executed. Offered
by `haiccing/base-package-help`.

## Links

- [external](external/)
- [test](test/)

## Commands

```
haicc host crud/read swarms --flags help
haicc host help/annotate swarms crud/read
haicc docs info/get hdlc --flags help
```

## Design

- **Help is a rewrite** (the team, 2026-11-15): the command a help flag
  is on is not executed; it becomes `help/annotate` before the door,
  which checks that one; the command's own check is what `annotate`
  answers, as the door would say it as the command executes.
- **What it reads is what is there**: the protocols the runtime loaded,
  the active ones and the service's state; the action's page from the
  mrepo's own info (`mrepo-base-info`'s `get`, at `<protocol>/<action>`).
- **Short, natural language, a fixed place each**: what it does, the
  door's answer, the arguments, the command to run it, where to read
  more; the record as it is with `haicc --raw`.

## Tests

- `brittle-bare test/*.test.js` (Bare installed): a command annotated on an execution written for it: taken, refused (not loaded, not offered there, not active, not now, missing an argument), its page or none; each test by its name in [test/](test/).
