# test/

The tests of mrepo-base-howto, a section per file, each test by its name.

## `howto.test.js`

- the script read: its needs, its scene, its steps, each line its position, its command and what it answers
- the script read: what it cannot hold, said with its line
- a how-to's key: <org>/<package>/<name>
- a line's answer and its checks: every fragment in it; a failure passes only when expected
- run: the scene thrown away, prepared, every step and its checks; each line a request, its key in the answer
- run: a line that does not pass ends it, what was expected and what it answered said
- step: one at a time, where it is read from the request log; the first prepares the scene; the end said
- where stepping is: after a run, a reset, or another how-to's first step, the first; after a failed step, said
- report: the last run, from the request log: each line's answer whole and its time; as Markdown; stepped
- the series a report reads: the last run, or the steps since the last first step
- reset: the scene thrown away; a key that is none refused
