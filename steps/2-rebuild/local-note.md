# The local agent's runs

The prompt for the next local run (below), and the local agent's note on
its last run, a section above it, newest only: the notes of earlier runs,
and the release records, are in git's history. The local machine works
offline: every download kept in a local source (`~/haicc-mirror/`), so
`tools/install.sh` and `tools/release.js` run with no network.

## 2026-11-22: `8661d03` built and tested (arm64, haici-feedback); the products synced to it

"The next run" (below), step by step, then what the human asked after
it.

**Before the run, the products reset** (the human, 2026-11-22: "the
product repositories were wrongly updated with unfinished work"): every
product repository written back to this repository's state at
`973b5cb4` (the content tested at `004dbc7`), as a new commit on top,
never force-pushed: 22 packages by `tools/packages.sh`, 12 modules by
the merge `tools/products.sh` makes, without its "split already in the
head" shortcut (it would have skipped exactly the modules wrongly
updated: their history held that split already). The wrong commits stay
in each repository's history. Repositories that exist only for the
work under review (e.g. for `mycelium-value-avro`, if any) were not
touched, nor the release `r-62af3e4`.

1. **The clone:** detached at `8661d0343a2d34e8308fe907c555776a204d392e`
   (2026-11-21, "Merge branch 'execute/main'"). The human's install torn
   down first (5 runtimes).
2. **The dependencies, the sources:** `install.sh` exit 0 ("0 fetched,
   207 kept, 1 linked": `mrepo-base-haici`). `release.js` exit 0, 42 s:
   `sources/haiccing/` twenty-one bundles, `sources/splectral/` one,
   every entry's commit `8661d034`; `sources/holepunchto/` both Bare
   tarballs (`linux-x64`, `linux-arm64`, 1.36.0); `git status` no change.
3. **The checks:** `release.js --strict` exit 0 (24 s), every report
   `current`, `"platforms": ["linux-x64","linux-arm64"]`; `code-check.js`
   "25 modules, 23 packages: 0 problems"; `info-extract.js --files`
   "462 READMEs, 0 problems".
4. **The tests:** nothing left after any (0 bare, 0 containers).

   | test | runs | result | time each |
   |---|---|---|---|
   | boot `/test/validate` | 3 | `"ok":true` each | 82, 85, 84 s |
   | `run.sh` | 4 | **341/341** in runs 2, 3, 4; run 1 324/341 (a sleep, below) | 433, 434, 329 s |
   | `splectral.sh` | 3 | 55/55 each | 76, 77, 67 s |
   | `container.sh` | 1 | 18/18 | 41 s |
   | `pair.sh` | 1 | 41/41 | 205 s |

   `run.sh`'s new checks pass: Bare for `linux-arm64` pinned and in the
   sources; an `aarch64` machine choosing `linux-arm64`; a platform not
   pinned, exit 3, said; the feedback flag (recorded, its record, read
   by protocol, at the root, asked directly, no text not run).

   **Run 1 of `run.sh`: the laptop slept**, again, though Windows had a
   keep-awake request (`SetThreadExecutionState`, system required: it
   does not hold against a lid closed or a sleep asked for). The
   journal shows WSL's clock correction every ~30 s while awake; it
   stops at 18:23 on 11-21 and is back only at 21:00 on 11-22. The
   first failure, test 221 (`boot/deploy demo ... --flags
   continuation=start`, "no response in 180 s"), at 18:26: the sleep
   mid-request; 16 more after it, each a consequence (the demo mrepo's
   runtimes). The run took 96606 s. A fourth run, after, passed whole.

   `splectral.sh`'s page timings (ms): `/help/` 1030–1480 first;
   `hdlc/validation` 1890–2690; `?raw` 1040–1580; a command typed
   1080–1750; kept pages 5–15. `/help/no/such/thing` again the slowest:
   4878, 3948, 3401. One timing negative, -161 ms (`?raw`, run 1):
   WSL's clock stepped back during the request; the test times with
   the wall clock, harmless.
5. **Every bundle's own tests:** twenty-two, exit 0, `"ok":true` each.
   `base-package-haici` three times (14 units, 248 tests; 20, 13, 13 s),
   the help viewer three times (364 tests; 124, 109, 108 s).
6. **The feedback flag, by hand** (`~/.haicc`, sources this clone's):
   deploys exit 0 (boot 1.6 s, docs 7.2 s, host 18.3 s).
   - `haicc host crud/read swarms --flags feedback the list is empty, a
     swarm was expected`: exit 0, "Feedback on crud/read swarms
     recorded: request `0f2aedb2-…`." and "To read it back: crud/read
     done/0f2aedb2-….json --flags layer=request"; run as `haicc host
     <that>`: exit 0, the record (`haici/feedback`, args the text then
     `crud/read`, `rewritten: feedback`).
   - `haicc --output host crud/read "done/*[value/value/protocol='haici']"
     --flags layer=request`: exit 0, the one record.
   - `haicc . boot/teardown host --flags feedback do not, it is in use`:
     exit 0, recorded at the root; `haicc host crud/read swarms` after:
     exit 0, `[]`: the host still there.
   - `haicc host haici/feedback swarms "asked directly" crud/read`:
     exit 0, the same answer.
   - `haicc host crud/read swarms --flags feedback`: exit 1, "not run:
     feedback: its text follows it (--flags feedback <text>)".
   - Read by protocol after: the host 2 records (as expected); **the
     root 3**, where 1 (the teardown's) was expected: the two given at
     the host seem to be in the root's request layer too (the command
     goes through it). Worth a look: is that intended?
   - `haicc boot/teardown`: 3 runtimes, 0.7 s, nothing left.
7. **arm64 in a container:** `docker run --rm --platform linux/arm64
   debian:bookworm-slim uname -m` → "exec /usr/bin/uname: exec format
   error" (69 s, the image pulled): no emulator registered here
   (`binfmt_misc` has only WSL's). Stopped there, nothing installed.
8. **The products synced to `8661d03`** (the human: "build and test the
   arm stuff and the feedback stuff and update after each test
   passes"): from the detached checkout, the scripts' steps run inline,
   the commit named `8661d03` (the scripts name `main`'s, then
   `cbe8aa15`, not what was tested). 23 packages committed ("arm64 and
   haici-feedback, tested locally; written from …@8661d03"),
   `base-package-haici` among them; 6 modules merged (`haicc-base-app`,
   `mrepo-base-execute`, `-haici`, `-help`, `-request`, `-runtime`),
   20 already that state. Checked after: all 49 repositories' content
   the same as this folder at `8661d03` (LICENSE aside; two empty
   fixture files a third-party `.gitignore` keeps out of git, as
   always). No release.

**For the cloud session:** the products now hold `8661d03`. A push from
`main`'s head would put the work under review back out (avro, swarm-
cluster, path URIs, the workbench, commission): products from a commit
a local run has passed only. Proposed for `handover-local.md` and the
handover: the local agent pushes the products after its run, from the
commit it tested; the cloud session does not.

## The next run (2026-11-23, from the cloud session): read this first

The prompt for this run, here so it is read with the notes. Write your
own section above this one, as always; this one stays until the next
prompt replaces it.

What it needs on the local machine: as before (Linux x86-64; git, curl,
tar; Docker, its daemon running), and **push access to the product
repositories** (`github.com/pear-full-square/<module>`,
`github.com/<org>/<package>`). **Build, test, then push the products**
(the human, 2026-11-23: "local will push the product repositories";
your proposal of 2026-11-22, the local agent pushes them from the commit
it tested). **No release.**

**Why this run**: the service-every-mrepo work is finished (roadmap-2,
`tasks/service-every-mrepo/`), a milestone: `main`'s head, built and
tested here in full, then every product repository brought to it.

**The commit**: `main`'s head when you pull. The
scripts push from `main`, so `main` must still be the commit you
tested when you push: if it has moved, stop before step 6 and say so.

What is new since your last run (`8661d03`), in short:

- **Every mrepo a service** (the boot mrepo the one exception): the
  runtime fires `commission` after its `boot` hook; `boot/deploy`
  links first, installs at `<work>/mrepos/<uri>`, commissions;
  deploy and teardown idempotent (a repeat is a warning, `again:true`).
- **The registry**: `<work>/mrepos/`, the install's; `haicc/mrepos
  [xpath]` lists the mrepos (`uri`, `position`, `package`, `running`);
  the packages' scripts placed in `<work>/scripts`.
- **The docs mrepo** split on package (a keyword in its package's
  context, `haiccing/base-package-boot/deploy`), built from the store at
  `initialise`, removed at shutdown (`info/clear`); `crud` and `haici`
  in it: feedback recorded and read back where the documentation is
  read.
- **The workbench** (`haiccing/base-solution-workbench`): its
  commission deploys the docs mrepo and Splectral, installs the help
  viewer; the help viewer reads `local/docs` wherever it is.
- Also on `main` since: `mycelium-value-avro`, the swarm (`rns`,
  `log`, `dispatch`, `base-component-node`, the log viewer), relative
  path URIs.

> 1. **The clone.** `git checkout main`, `git pull`. Write down `git log
>    -1`. Tear down your own install first if one runs (`haicc
>    boot/teardown`): its sources are this clone's `sources/`. An
>    install from before this run is not migrated: torn down with the
>    old `haicc`.
> 2. **The dependencies, the sources.** `sh tools/install.sh`, then
>    `tools/bare tools/release.js`: twenty-nine bundles
>    (`sources/haiccing/`, `sources/splectral/`), each with its
>    manifest, every entry's commit the one you wrote down;
>    `sources/holepunchto/` both Bare tarballs. `git status` no change
>    after it; if it changes, say so and stop.
> 3. **The checks.** `tools/bare tools/release.js --strict` (exit 0,
>    every report `current`); `tools/bare tools/code-check.js` and
>    `tools/bare tools/info-extract.js --files` (0 problems each). Do not
>    run `tools/package-test.js`: the reports are the cloud session's.
>    A report not `current`: say which and stop.
> 4. **The full test** (`base-docs-hdlc`, "Validation"): every check
>    passing; each one's count and time; nothing left after each
>    (`pgrep -fa "bin/bare"`, `docker ps -a --filter label=haicc.folder`).
>    Keep the laptop awake: both last runs lost one to a sleep.
>
>    | test | runs | the cloud session's count |
>    |---|---|---|
>    | boot `/test/validate` | 3 | `"ok":true` |
>    | `sh haiccing/base-linux-haicc/test/run.sh` | 2 | 370 |
>    | `test/splectral.sh` | 2 | 85 |
>    | `test/swarm.sh` | 3 (a race shows one run in a few) | 92 |
>    | `test/container.sh` | 1 | 17 |
>    | `test/pair.sh` | 1 | 39 |
>
>    A run that hangs: look for `runtime-stall.json` under its temporary
>    folder and copy what it says into your note. A run lost to a sleep:
>    run it again, and say so.
> 5. **Every bundle's own tests**: `SOURCES=$PWD/sources tools/bare
>    sources/<org>/<package>.bundle /test/full` for each of the
>    twenty-nine (exit 0, last line `"ok":true`).
> 6. **The products, only when 2 to 5 passed whole.** From the clone's
>    root, `main` checked out and still the commit tested:
>    - the modules, one at a time so that one missing does not stop the
>      rest: `for m in $(ls pear-full-square); do sh tools/products.sh
>      "$m" || echo "$m: FAILED"; done`;
>    - the packages: `for p in $(ls -d haiccing/*/ splectral/*/ | sed
>      's:/$::'); do sh tools/packages.sh -m "service-every-mrepo: every
>      mrepo a service, the registry, the docs mrepo split on package,
>      the workbench; tested locally" "$p" || echo "$p: FAILED"; done`.
>
>    One line each ("up to date", or its new commit). A repository that
>    does not exist: do not create it (the human creates repositories);
>    list it in your note. A push refused: say which and why. Then check:
>    each repository's `main` the same content as its folder here
>    (LICENSE aside), as you did last time.
> 7. **Your note**: a section at the top of this file, as always: the
>    commit, each step's result and timings, each product's line, the
>    repositories missing, anything that looked wrong or slow. Commit it
>    alone to `main` and push.

