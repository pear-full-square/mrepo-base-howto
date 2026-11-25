# The local agent's runs

The prompt for the next local run (below), and the local agent's note on
its last run, a section above it, newest only: the notes of earlier runs,
and the release records, are in git's history. The local machine works
offline: every download kept in a local source (`~/haicc-mirror/`), so
`tools/install.sh` and `tools/release.js` run with no network.

## 2026-11-25: `execute/main` at `72ea7a9` tested whole; `splectral.sh` failed 82/85 (its expected text gone from the docs): not merged

The prompt on `execute/main` ("The next run (2026-11-25)": the larger
test mine, the merge to `main` with it). The earlier note of today
(`c5d7e41`, the products pushed) is in git's history (`5389bbb`).

1. **The clone:** `execute/main` at
   `72ea7a936102faf4ad29b474081e9109ffeb4dce` (2026-11-25 03:49 UTC,
   "Merge remote-tracking branch 'origin/main' into execute/main").
   **It moved while I tested**, to `e8a5022` (runnable-howtos, a new
   prompt): not tested here, stayed on `72ea7a9`. No install running.
2. **The dependencies, the sources:** `install.sh` exit 0 ("0 fetched,
   208 kept, 2 linked"), no complaint; dangling links left in
   `node_modules/`: `mrepo-base-log`, `mrepo-base-howto`, `p2p-topic`,
   `p2p-local` (harmless). `sources/haiccing/base-package-log.bundle`
   removed. `release.js` exit 0, 50 s: twenty-eight bundles (26 + 2),
   every entry's commit `72ea7a93`.
3. **Every package's pre-release:** the 25 `release.js --strict` named
   not `current` (all but `base-component-boot`, `base-component-node`,
   `base-package-rns`), `package-test.js` each: **all 25 `"ok":true`,
   report written**; the longest `base-solution-workbench` 183 s,
   `base-package-container` 178, `base-app-haicc` 168. Then `release.js
   --strict` **exit 0**, every report `current` (33 s).
4. **The checks:** `code-check.js` "33 modules, 29 packages: 0
   problems"; `info-extract.js --files` "593 READMEs, 0 problems".
5. **The full test:** nothing left after any (0 bare, 0 containers);
   nothing hung.

   | test | runs | result | time each |
   |---|---|---|---|
   | boot `/test/validate` | 5 | `"ok":true` each: **the race fixed** | 118, 123, 119, 120, 115 s |
   | `run.sh` | 2 | 387/387 each | 581, 609 s |
   | `splectral.sh` | 2 | **82/85 each** | 246, 242 s |
   | `swarm.sh` | 3 | 83/83 each | 405, 398, 395 s |
   | `container.sh` | 1 | 17/17 | 43 s |
   | `pair.sh` | 1 | 39/39 | 275 s |

   **`splectral.sh`'s three failures are the test's, not the code's**:
   checks 27 ("as haicc docs info/get haiccing/base-docs-hdlc/validation
   answers it, drawn"), 71 ("the docs mrepo answers, its info extracted
   at its initialise") and 77 ("a page by its keywords, from the
   workbench's docs mrepo") each look for **"Before every commit"** in
   `base-docs-hdlc`'s validation page (`test/splectral.sh` lines 90,
   159, 165). This batch's `cc0e80d9` ("Validation: change built up in
   a batch…") rewrote that section of `haiccing/base-docs-hdlc/README.md`
   and the sentence "Before every commit, scoped to the change…" is no
   more. The page is served and drawn; it says something else now.
   Fix: a phrase the section still has, in the three. The batch at
   `e8a5022` does not touch them.

   **The speed**, against the last two runs (`8a4a9ae` · `c5d7e41` ·
   now): boot validate 105–111 · 161–177 · **115–123 s**; `run.sh`
   414–506 · 629–653 · **581–609**; `swarm.sh` 353–355 · 454–473 ·
   **395–405**; `pair.sh` 147–184 · 285 · **275**. Back near the first
   for the boot, still 15–30 % slower for the haicc tests. What narrows
   it (a scratch host, torn down after): a whole `haicc` command at the
   root 0.63–0.84 s, at `host` 1.42–1.46 s (0.6–0.8, 1.40 last run:
   the hop unchanged, ~0.65 s). Inside, from a record's arrival to done:
   `crud/read .` at the root 0.25–0.32 s (its action 0.08–0.14 s), at
   the host 0.46–0.52 s; an activation at the root 0.32–0.48 s (action
   ~0.09), at the host 0.33–1.17 s (0.28–0.41 last run; the slow ones
   while the service started). So ~0.15–0.35 s of every request is
   waiting between arrival and its action: the inbox's turn, now read
   through XPath; worth the request records' timestamps hop by hop.

   `splectral.sh`'s page timings (ms; run 1, run 2): `/help/` 2436,
   2034; the validation page 4638, 7233; `?at=splectral` 1615, 1618;
   `/help/no/such/thing` 4825, 4829; the workbench's `/help/` 4841,
   5043, its validation page 8656, 6031. The same again 6–26 ms.
   `swarm.sh`'s log viewer pages 1221–5234.
6. **Every bundle's own tests:** twenty-eight, exit 0, `"ok":true`
   each; the longest `base-component-boot` 317 s,
   `base-solution-workbench` 234, `base-component-help-viewer` 184.
7. **Not merged**: `splectral.sh` failed. `execute/main` not changed by
   me; **the 25 test reports written in step 3 are not committed**:
   kept in a stash on this machine ("test reports of the larger test,
   72ea7a9"), valid for that commit only; the next run writes its own.
   `main` stays at what it was.
8. **Nothing else**: no products, no release, no Codeberg.

## The next run (2026-11-25, from the cloud session): read this first

The prompt for this run, here so it is read with the notes. Write your
own section above this one, as always; this one stays until the next
prompt replaces it.

**The larger test is yours from now on, and the merge to `main` with
it** (the human, 2026-11-25: "you do the quick checks here, but the
long test we run local"; `handover-local.md`, "Who does what", 2). The
cloud session builds a batch of change on `execute/main`, each change
on a small test; you test the batch whole; passed whole, you merge it.
`main` only ever holds a state your test passed. **No products, no
release, no Codeberg** in this run.

**The commit**: `execute/main`'s head when you pull, written down. Not
`main`: `main` is what you merge into at the end. If `execute/main`
moves while you test, stay on the commit you started with and say so.

**Your last run** (thank you: read, acted on):

- **The boot's history check, the race you found**: fixed by your
  second form. Arrival order alone did not do it: the test's first
  command comes from outside while the hook lines run, and arrives
  among them. Now the mrepo's own requests are asserted in arrival
  order (`request/done`'s offsets), the first command only as there
  once, after the deploy. Three runs here passed; yours are the proof.
- **The two repositories you list as missing** (`base-package-log`,
  `mrepo-base-log`): not to be created, both are removed in this batch.
  The renamed folders (`p2p-hypercore`, `p2p-process`) come with it.
- **Every long test 20-50 % slower**: not looked into yet. It is on
  the list; if this run shows the same, say so, and anything that
  narrows it (a request's time from arrival to done, at the root and
  at the host, against your earlier numbers).
- **`done/*` physically answering `[]`**: so it is; the physical mode
  is future work, its nature to be discussed with the human.

What is new since `c5d7e41`:

- **Logical is how a topic is read**: no `logical` flag any more, no
  mrepo setting (`/runtime/xpath.json`): `crud/read "done/*" --flags
  layer=request` answers the records, the latest first; `--flags
  physical` is the one flag, to look at the storage (`done/*/*/*`). A
  path of the storage with nothing said is refused, said.
- **Feedback's read-back** is the record's address: `crud/read
  "done/*[@offset=<id>]" --flags layer=request`.
- **The duplicated log removed** (the human: "the request done topic is
  the log"; "I want the duplication removed"): the `log` module and
  package are gone, with `log/read`, `log/status` and a node's log
  program; a node runs two processes (its runtime, its rns). The log
  viewer shows an mrepo's own request log, any mrepo of the install
  (`/log/`, `?at=<position>`, `?filter=[...]`).
- **Two modules renamed**: `p2p-topic` is `p2p-hypercore`, `p2p-local`
  is `p2p-process` (their repositories created by the human under the
  new names).
- **Validation**: a batch on `execute/main`, the larger test yours
  (`base-docs-hdlc`, "Validation").

> 1. **The clone.** `git fetch`, `git checkout execute/main`, `git
>    pull`. Write down `git log -1`. Tear down your own install first if
>    one runs (`haicc boot/teardown`), with the `haicc` it was made with.
> 2. **The dependencies, the sources.** `sh tools/install.sh` (a module
>    gone and two renamed: old links in `node_modules/` may dangle,
>    harmless; say if it complains), then `tools/bare tools/release.js`:
>    twenty-eight bundles (`sources/haiccing/` 26, `sources/splectral/`
>    2; `base-package-log.bundle` from an earlier run may still lie in
>    `sources/`: remove it), every entry's commit the one you wrote
>    down.
> 3. **Every package's pre-release**, new for you: for each package
>    `release.js --strict` names as not `current`, `tools/bare
>    tools/package-test.js <org>/<package>` (its last line `"ok":true`;
>    its report written into its `test-reports/`). Then `tools/bare
>    tools/release.js --strict`: exit 0, every report `current`. One
>    that fails: its report says which unit; say so and go on with the
>    tests, no merge at the end.
> 4. **The checks.** `tools/bare tools/code-check.js` ("33 modules, 29
>    packages: 0 problems") and `tools/bare tools/info-extract.js
>    --files` ("593 READMEs, 0 problems").
> 5. **The full test** (`base-docs-hdlc`, "Validation"): every check
>    passing; each one's count and time; nothing left after each
>    (`pgrep -fa "bin/bare"`, `docker ps -a --filter label=haicc.folder`).
>    Keep the laptop awake.
>
>    | test | runs | the cloud session's count |
>    |---|---|---|
>    | boot `/test/validate` | 5 (the race: one run in a few showed it) | `"ok":true` |
>    | `sh haiccing/base-linux-haicc/test/run.sh` | 2 | 387, the whole batch not run here |
>    | `test/splectral.sh` | 2 | 85 at `9db93cc`, not run since |
>    | `test/swarm.sh` | 3 | 83 |
>    | `test/container.sh` | 1 | 17 at `9db93cc` |
>    | `test/pair.sh` | 1 | not run here (39 at your last run) |
>
>    A count that differs from the table is not a failure by itself:
>    every check passing is what counts; say the count. A run that
>    hangs: look for `runtime-stall.json` under its temporary folder and
>    copy what it says into your note.
> 6. **Every bundle's own tests**: `SOURCES=$PWD/sources tools/bare
>    sources/<org>/<package>.bundle /test/full` for each of the
>    twenty-eight (exit 0, last line `"ok":true`).
> 7. **Passed whole (3 to 6, nothing failing): the merge.**
>    - `git status`: only `test-reports/` changed. Commit them on
>      `execute/main`: "Test reports of the larger test, <commit>",
>      push.
>    - `git checkout main`, `git pull`, `git merge --no-ff execute/main
>      -m "Merge branch 'execute/main'"`, push. If `execute/main` moved
>      since you started, merge the commit you tested with your reports
>      on it, not its head.
>    - **Anything failed: no merge.** Say what, with what you found;
>      the cloud session fixes forward and asks again.
> 8. **Your note**: a section at the top of this file, as always: the
>    commit, each step's result and timings, what was merged or why
>    not, anything that looked wrong or slow. Committed alone to `main`
>    and pushed.
