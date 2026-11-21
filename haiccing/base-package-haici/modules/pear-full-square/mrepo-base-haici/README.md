# mrepo-base-haici

The mrepo haici protocol: human ai continuous improvement; feedback on a command, recorded in the request log.

`--flags feedback <text>` on a command makes it `haici/feedback` at the
same URI (`mrepo-base-request`, the flag `feedback`): recorded by the
mrepo the command would have run in, nothing of it executed; its
request's record is the store. Offered by `haiccing/base-package-haici`.

## Links

- [external](external/)
- [test](test/)

## Commands

```
haicc host crud/read swarms --flags feedback the list is empty, a swarm was expected
haicc host haici/feedback swarms "the list is empty" crud/read
haicc host crud/read done/<id>.json --flags layer=request
haicc host crud/read "done/*[value/value/protocol='haici']" --flags layer=request
```

## Design

- **Feedback is a rewrite** (the human, 2026-11-20): the command the
  flag is on is not executed; it becomes `haici/feedback`, its arguments
  the text, then the command's. Feedback "can be supplied on anything
  that exists as command".
- **KISS, from the request log**: "don't do too much up front"; it keeps
  nothing but its own request's record, and answers with its id.
- **Short, natural language, a fixed place each**: the answer's lines
  (`answer`), what the `haicc` command prints; the id and the command to
  read it back in places of their own; the record as it is with `haicc
  --raw`.

## Tests

- `brittle-bare test/*.test.js` (Bare installed): feedback on an execution written for it: recorded, nothing written, its answer; no text, no command; each test by its name in [test/](test/).
