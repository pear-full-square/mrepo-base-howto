# The local agent's runs

The prompt for the next local run (below), and the local agent's note on
its last run, a section above it, newest only: the notes of earlier runs,
and the release records, are in git's history. The local machine works
offline: every download kept in a local source (`~/haicc-mirror/`), so
`tools/install.sh` and `tools/release.js` run with no network.

## 2026-11-25: `c5d7e41` built and tested (record-offset); one failure, the boot's test, a race in its history check

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

## The next run (2026-11-24, from the cloud session): read this first

The prompt for this run, here so it is read with the notes. Write your
own section above this one, as always; this one stays until the next
prompt replaces it.

What it needs on the local machine: as before (Linux x86-64; git, curl,
tar; Docker, its daemon running). **Build and test only** (the human,
2026-11-24: "leave a note for local to build and test"): **no products
pushed, no release, no Codeberg sync** in this run; the products follow
at a milestone, asked for in a later prompt.

**Why this run**: the record-offset work, the logical reading of a
topic over its storage, is merged to `main`: tested whole in the cloud
session at `c317ed6c` (its content; `main`'s head is the merge that
brings it in, with your notes). A second machine's full test of it,
before the default reading is turned to logical on top of it.

**The commit**: `main`'s head when you pull, written down. If `main`
moves while you test, stay on the commit you started with and say so.

What is new since your last run (`8a4a9ae`), in short:

- **A request's identity is its offset**: milliseconds since the epoch,
  thirteen digits, the name of its record's file; the inbox, the outbox
  and `request/done` are streaming layers, a record a file in folders by
  its offset's digits (`done/17954/179540/1795400000002.json`); the
  inbox read after a pointer. `layer.json` is `.layer.json`, hidden by
  its name.
- **A streaming layer declares its structure** (the human, 2026-11-24:
  "explicit declaration: yes. Otherwise it is just a folder"): in its
  `.layer.json`, `"structure": { "type": "offset-files", "levels": [5, 6],
  "batch": 50 }`; a box the runtime makes is made with it; the package
  check fails an `inbox`, `outbox` or `request/done` that declares none.
- **XPath, logical over physical** (`haiccing/base-docs-xpath`):
  XPath 2.0's forward part; a query answers an `XPathResult`, read
  through an `XPathIterator`, more fetched behind the scenes a slice at
  a time by a physical query the storage's structure type generates
  (`pear-full-square/mycelium-xpath-physical`, new: `tree`,
  `offset-files`); one way to query an mrepo, `query` handing back the
  result. A topic read logically: `done/*`, `done/*[@offset=N]`,
  `done/*[@offset>N]`; a position in a topic's query is refused.
- **Logical or physical**: `--flags logical`, `--flags physical`; with
  neither the mrepo's setting, `/runtime/xpath.json`; with no setting
  physical, as everywhere today. The runtime's own inbox read is
  logical, ascending.
- **The `xpath` layer and its log** (`xpath/log`): what the physical
  side did for each request, under the request's offset.
- An install from before this run does not read these layers: torn
  down with the old `haicc` first, as always.

> 1. **The clone.** `git checkout main`, `git pull`. Write down `git log
>    -1`. Tear down your own install first if one runs (`haicc
>    boot/teardown`), with the `haicc` it was made with.
> 2. **The dependencies, the sources.** `sh tools/install.sh`, then
>    `tools/bare tools/release.js`: twenty-nine bundles
>    (`sources/haiccing/` 27, `sources/splectral/` 2), each with its
>    manifest, every entry's commit the one you wrote down;
>    `sources/holepunchto/` both Bare tarballs. `git status` no change
>    after it; if it changes, say so and stop.
> 3. **The checks.** `tools/bare tools/code-check.js` ("34 modules, 30
>    packages: 0 problems") and `tools/bare tools/info-extract.js
>    --files` ("616 READMEs, 0 problems"). `tools/bare tools/release.js
>    --strict`: run it and **list the reports it says are not
>    `current`, then go on**: the committed reports were not all
>    refreshed for this merge (the cloud session's to do, at the
>    milestone); do not run `tools/package-test.js`.
> 4. **The full test** (`base-docs-hdlc`, "Validation"): every check
>    passing; each one's count and time; nothing left after each
>    (`pgrep -fa "bin/bare"`, `docker ps -a --filter label=haicc.folder`).
>    Keep the laptop awake.
>
>    | test | runs | the cloud session's count |
>    |---|---|---|
>    | boot `/test/validate` | 3 | `"ok":true` |
>    | `sh haiccing/base-linux-haicc/test/run.sh` | 2 | 386 |
>    | `test/splectral.sh` | 2 | 85 |
>    | `test/swarm.sh` | 3 (a race shows one run in a few) | 92 |
>    | `test/container.sh` | 1 | 17 |
>    | `test/pair.sh` | 1 | not run here (39 at your last run) |
>
>    A run that hangs: look for `runtime-stall.json` under its temporary
>    folder and copy what it says into your note. A run lost to a sleep:
>    run it again, and say so.
> 5. **Every bundle's own tests**: `SOURCES=$PWD/sources tools/bare
>    sources/<org>/<package>.bundle /test/full` for each of the
>    twenty-nine (exit 0, last line `"ok":true`).
> 6. **Two things to look at, by hand** (a workbench or a host of your
>    own, torn down after):
>    - a topic read both ways, and what each costs: `haicc --output host
>      crud/read "done/*" --flags layer=request logical` and the same
>      with `physical`; the time of each, and of one record by its
>      address (`"done/*[@offset=<one of them>]"`);
>    - the timings you measured last run (the ~0.65 s a hop, the help
>      pages' first visits): the same, better or worse, now that the
>      inbox is read through XPath.
> 7. **Your note**: a section at the top of this file, as always: the
>    commit, each step's result and timings, the reports not `current`,
>    anything that looked wrong or slow. Commit it alone to `main` and
>    push. No products, no release, no Codeberg.
