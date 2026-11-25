# The local agent's runs

The prompt for the next local run (below), and the local agent's note on
its last run, a section above it, newest only: the notes of earlier runs,
and the release records, are in git's history. The local machine works
offline: every download kept in a local source (`~/haicc-mirror/`), so
`tools/install.sh` and `tools/release.js` run with no network.

## 2026-11-25: `c5d7e41` built and tested (record-offset); one failure, the boot's test, a race in its history check; the products pushed

"The next run" (below), build and test only: no products, no release,
no Codeberg.

1. **The clone:** `main` at `c5d7e41001960e8b64251d43537eefa4a1b6faeb`
   (2026-11-24, "Merge branch 'execute/main'"); `main` did not move
   during the run. No install running before (`~/.haicc/work` empty).
2. **The dependencies, the sources:** `install.sh` exit 0, 0.4 s ("0
   fetched, 208 kept, 1 linked"). `release.js` exit 0, 58 s:
   twenty-nine bundles (`sources/haiccing/` 27, `sources/splectral/`
   2), every entry's commit `c5d7e410`; `sources/holepunchto/` both Bare
   tarballs; `git status` no change.
3. **The checks:** `code-check.js` "34 modules, 30 packages: 0
   problems"; `info-extract.js --files` "616 READMEs, 0 problems".
   `release.js --strict` exit 1 (51 s), as expected: **26 reports
   `stale`**, 3 `current` (`base-package-boot`, `base-package-haicc`,
   `base-package-runtime`); stale: `base-app-haicc`, every
   `base-component-*` (boot, docs, haicc, node), every `base-docs-*`
   (haicc, hdlc, package, uri, vision, xpath), `base-package-`
   container, crud, dispatch, haici, help, info, log, protocol, rns,
   service, splectral, swarm, `base-solution-workbench`, and both
   splectral components. `package-test.js` not run.
4. **The full test:** nothing left after any (0 bare, 0 containers).
   The laptop stayed awake; nothing hung, no `runtime-stall.json`.

   | test | runs | result | time each |
   |---|---|---|---|
   | boot `/test/validate` | 3 | **run 1 fail**, run 2 `"ok":true`, **run 3 fail** (121/122 asserts each) | 163, 177, 161 s |
   | `run.sh` | 2 | 386/386 each | 629, 653 s |
   | `splectral.sh` | 2 | 85/85 each | 239, 240 s |
   | `swarm.sh` | 3 | 92/92 each | 473, 457, 454 s |
   | `container.sh` | 1 | 17/17 | 45 s |
   | `pair.sh` | 1 | 39/39 | 285 s |

   **The boot's failures** are one assertion, not the boot: `test/boot`
   test 23, "the history: the boot's deploy, the protocol protocol
   opened by the runtime, then its boot hook file …". Every one of the
   eleven requests is there and done without an error (24–26 pass); the
   **order** differs. The test sorts `request/done` by each record's
   envelope `timestamp` (when it was done, `new Date().toISOString()`
   in `mrepo-base-request/lib/record.js`), and that order is a race:
   - run 1: `boot deploy boot` done after the `boot`, `crud`, `haicc`
     activations (its envelope written after the first hook lines
     finished), expected first;
   - run 3: `info extract main/.` done before `protocol activate
     main/. runtime`, expected after.
   Proposed: the history in arrival order (the offsets, `request/done`'s
   natural order, which the comment above it names), or the assertion
   as a set plus the order only where it is causal. The cloud session's
   to decide; the same unit passed in the bundle's own `/test/full`
   (below), and 1 of 3 here.

   **Slower than the last run, every long test**, on the same machine:
   boot validate 161–177 s (105–111 last), `run.sh` 629–653 (414–506),
   `swarm.sh` 454–473 (353–355), `splectral.sh` 240 (203–205),
   `pair.sh` 285 (147–184), `container.sh` 45 (32); the bundle tests
   too (`base-component-boot` 320 s, 262 last; workbench 240, 215).
   About +20–50 %. Not found where: the XPath side's own work is
   milliseconds (step 6); the per-request hop is the same as before.
   Worth a look by the cloud session at the runtime's inbox loop (the
   logical read, its slices) under load; the xpath log does not show
   the runtime's own inbox reads, only commands'.

   `splectral.sh`'s page timings (ms; run 1, run 2): `/help/` 2444,
   2440 (1900–2170 last); `haiccing/base-docs-hdlc/validation` 3645,
   5440 (4210–4370); `?at=splectral` 1419, 1823; `/help/no/such/thing`
   5041, 5842 (4050–4270); the workbench's `/help/` 5075, 5066 and its
   validation page 5042, 5672 (6110 last). First visits, cold, as
   before; the same again 12–16 ms. On the whole a little worse on the
   host, a little better in the workbench: within the noise of two runs.
5. **Every bundle's own tests:** twenty-nine, exit 0, `"ok":true` each
   (`base-component-boot`'s `/test/boot` passed here); the longest
   `base-component-boot` 320 s, `base-solution-workbench` 240 s,
   `base-package-container` 204 s.
6. **By hand**, a host in a scratch install (`haicc-install.sh
   --home=<scratch>`, its sources linked here, torn down and removed
   after; the human's `~/.haicc` not touched). Times are the whole
   `haicc` command, Bare's start included (`haicc --help` alone ~0.2 s):
   - **A topic read both ways** (`host`, ~30–50 records in
     `request/done`):
     | read | time | records |
     |---|---|---|
     | `"done/*" --flags layer=request logical` | 1.66–2.33 s | all (32→49 as it grew) |
     | `"done/*" … physical` (and with no flag) | 1.46–1.67 s | **0**: `[]` |
     | `"done/*/*/*" … physical` | 1.59–2.73 s | all (35, 42) |
     | `"done/*[@offset=N]" … logical` | 1.41 s | 1 |
     | `"done/*[@offset=N]" … physical` | 1.43 s | 0 |
     | `"done/*[@offset>N]" … logical` | 1.62–4.96 s | the later ones (10, 14) |
     Physically `done/*` is the first level of folders (`17955`), which
     have no value: an empty answer, as designed but easy to trip on;
     the records are three levels down. The xpath log (`xpath/log`)
     says what the physical side cost: **0–7 ms** each, the logical
     `done/*` four slices (1, then all, then two empty) in ≤2 ms, the
     address `[@offset=N]` two in 1 ms. So the time is the hop and the
     record's size (a read of `done` holds the outputs of earlier
     reads of `done`: 116 KB at 34 records, growing fast), not XPath.
     The 4.96 s once was an outlier (1.62 s the other time).
   - **The hop**: `haicc --output . crud/read .` 0.6–0.8 s (1.08 the
     first), `host crud/read .` 1.40 s (five alike): ~0.6–0.65 s a hop,
     the same as last run. Inside the host: an activation 0.28–0.41 s
     from arrival to done (its action 55–118 ms); `info/extract` 3.3 s
     (2.7 s its own); `service/initialise`, `service/start` 4.0, 3.3 s
     from arrival (~0.1 s their action: the rest waiting their turn).
     Unchanged: reading the inbox through XPath has not changed the
     hop; the proposals of last run stand (one request a page; where
     the 0.65 s goes, hop by hop).
7. **The products** (the human, 2026-11-25, after this note: "push the
   product repositories"; asked, with the boot test's race and the 26
   stale reports put to them: "push all now"). From `main` at
   `01b33be` (this note on `c5d7e41`, no product folder changed).
   - **Modules** (`tools/products.sh`, one at a time): 34 of 35; 26
     merged, 8 "up to date" (`mrepo-base-help`, `-protocol`,
     `-service`, `mycelium-value-json`, `p2p-mrepo`, `p2p-replicate`,
     `p2p-store`, `pkgm-base-manager`). `mrepo-base-haicc` and
     `splectral-base-log-viewer` failed on a connection reset, pushed
     on a second try.
   - **Packages** (`tools/packages.sh`, `PACKAGES` a temporary folder,
     removed after): 29 of 30 committed, the message "record-offset: a
     request's identity its offset; streaming layers declare their
     structure; XPath logical over physical (c5d7e41)". **They carry the
     stale test reports** (step 3).
   - **The check after**: every one fetched and compared with its
     folder (the LICENSE aside): the 34 modules and
     `base-linux-haicc` the same as `main`'s tree; the 28 other packages
     the same as the folder on disk, their assembled `modules/` included,
     but for two folders in 15 of them,
     `modules/node_modules/p2p-git/__tests__/__fixtures__/test-status/{g,h}`:
     a third-party fixture that its own `.gitignore` keeps out of git.
     Harmless.
   - **Missing, for the human to create (2)**: `haiccing/base-package-log`,
     `pear-full-square/mrepo-base-log`. The other eleven missing last
     run are there now.
   - **Renamed on GitHub**: `pear-full-square/p2p-local` answers "moved
     to `p2p-process`", `p2p-topic` "moved to `p2p-hypercore`"; the
     pushes followed the redirect. The folders here keep the old names:
     for the cloud session to follow (or the human to say).
   - No Codeberg sync, no release (not asked).

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
