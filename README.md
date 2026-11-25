# mrepo-base-howto

The mrepo howto protocol: a how-to's steps run where it is installed, each line a request, its answer checked.

A how-to is a page and its script, `steps.haicc`, beside it, in its
package's `howto/<name>/`. The runner reads the script from the
package's bundle (the mrepo's own, the store's, or a sources folder's)
and sends each line through
that mrepo's own inbox, as if typed after `haicc` at it: `.` is the
mrepo, the scene; what the line reaches is below it. Offered by
`haiccing/base-package-howto`.

## Links

- [external](external/)
- [internal](internal/)
- [test](test/)

## Commands

```
haicc howtos howto/run . haiccing/base-package-crud/query
haicc howtos howto/step . haiccing/base-package-crud/query
haicc howtos howto/report . haiccing/base-package-crud/query md
haicc howtos howto/reset .
```

## The script

`steps.haicc`, a line a command (internal/script):

- `# step: <title>` opens a step; its lines follow, one at least.
- A line as typed after `haicc`: its position first (`.`, `host`,
  `host/node-1`), then the command: `. crud/read "swarms/*"`.
- `# expect: <fragment>` under a line: the fragment is in its answer,
  its output as `haicc --output` prints it (one line of JSON), or
  `error: <message>` when it failed. A line that fails fails its step,
  unless an expect says the failure is its answer (`# expect: error:
  ...`).
- `# scene: <title>`, once, before the first step: lines that prepare
  what the steps need, run and checked as steps are, not a step.
- `# needs: docker` (or `network`), first: what it needs beyond an
  install; said in its runs, for who runs it to skip it without.
- Other comments are the page's; blank lines nothing.

## Design

- **No tool, no outside runner** (the human, 2026-11-21): "the required
  functionality becomes internal"; a how-to runs where it is installed.
- **Every step an ordinary request** (ours, agreed): a line is sent as a
  terminal sends it, through the mrepo's own inbox, checked at the door
  as one from outside; its record in the request log is the run's
  record, and the report is read from it. A continuation a line answers
  with is sent on as the terminal does.
- **Forward only**: the scene is the mrepo the runner is in; a line
  reaches what is below it, nothing above.
- **The scene thrown away before a run** (and before a first step): what
  the steps deployed torn down from the inside out, by each mrepo's
  links, what they made in main removed; each an ordinary request.
- **Simple first** (the human: "we can start with simple howto runners
  and build them up"): run, step, report, reset; `explore` and `plan`
  later (`help-mvp`).

## Tests

- `brittle-bare test/*.test.js` (Bare installed): the script read, its errors; a line's parts, answer and checks; a run, a step, a report and a reset on an execution written for them; each test by its name in [test/](test/).
