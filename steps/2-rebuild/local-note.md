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

## The next run (2026-11-21, from the cloud session): read this first

The prompt for this run, here so it is read with the notes. Write your
own section above this one, as always; this one stays until the next
prompt replaces it.

What it needs on the local machine: as before (Linux x86-64; git, curl,
tar; Docker, its daemon running). **Test only**: no release, no product
repository, no `gh`.

**Why this run** (`splectrum/roadmap-2`, `tasks/review/`, items 1 and
2): the human (2026-11-21), "arm64 and feedback complete": the two
built today are completed by a local build and test. Everything else
merged into `main` today is under review, so this run is **not on
`main`'s head**: it is on the commit that has these two and nothing
after them,

    8661d0343a2d34e8308fe907c555776a204d392e   (8661d03, "arm64 merged with haici-feedback")

What is new in it since your last run (`004dbc7`):

- **`haici-feedback`**: `--flags feedback <text>` on any command records
  the text where the command would run, nothing of the command executed
  (`haici/feedback` at the same URI, its arguments the text then the
  command); answered in natural language with its request's id, read
  back from the request layer (`--flags layer=request`). A new package
  and module, `haiccing/base-package-haici`, `mrepo-base-haici`.
- **`arm64`**: the sources for `linux-arm64` too: every bundle carries
  both platforms' native addons, both Bare runtimes are in the sources
  (`sources/holepunchto/`), the pins a build a platform
  (`haiccing/base-linux-haicc/pins`), and the installer and `haicc
  prereq` choose by machine (`uname`: `aarch64` → `linux-arm64`). The
  development tools stay `linux-x64`. Proven in the cloud under
  emulation up to the boot's runtime, which did not answer under
  qemu-user (Bare's JIT, most likely); a real Pi is the proof, at home.

> Build the sources from `8661d03` and test them; then try arm64 in a
> container if this machine can emulate it.
>
> 1. **The clone.** `git fetch origin`, then `git checkout --detach
>    8661d0343a2d34e8308fe907c555776a204d392e`. Write down `git log -1`.
>    Tear down your own install first if one runs (`haicc boot/teardown`):
>    its sources are this clone's `sources/`, rebuilt next.
> 2. **The dependencies, the sources.** `sh tools/install.sh` (one
>    module new, `mrepo-base-haici`), then `tools/bare tools/release.js`:
>    `sources/haiccing/` twenty-one bundles (`base-package-haici` new),
>    `sources/splectral/` one, each with its manifest, every entry's
>    commit `8661d034`; `sources/holepunchto/` both Bare tarballs,
>    `linux-x64` and `linux-arm64`. `git status` must show no change
>    after it; if it does, say so and stop.
> 3. **The checks and the reports.** `tools/bare tools/release.js
>    --strict` (exit 0, every report `current`, `"platforms":
>    ["linux-x64","linux-arm64"]`); `tools/bare tools/code-check.js` and
>    `tools/bare tools/info-extract.js --files` (0 problems each). Do not
>    run `tools/package-test.js`: the reports are the cloud session's.
> 4. **The tests**: the boot's test three times (`SOURCES=$PWD/sources
>    tools/bare sources/haiccing/base-component-boot.bundle
>    /test/validate`, `"ok":true`); `sh haiccing/base-linux-haicc/test/run.sh`
>    three times (it has new checks: every pinned platform's Bare in the
>    sources, an `aarch64` machine choosing `linux-arm64`, the feedback
>    flag; say its count), `sh haiccing/base-linux-haicc/test/splectral.sh`
>    three times, `test/container.sh` and `test/pair.sh` once. Every
>    check passing; each one's count and time. Nothing left after each:
>    `pgrep -fa "bin/bare"`, `docker ps -a --filter label=haicc.folder`.
>    A run that hangs: look for `runtime-stall.json` under its temporary
>    folder and copy what it says into your note.
> 5. **Every bundle's own tests**, both organisations:
>    `SOURCES=$PWD/sources tools/bare sources/<org>/<package>.bundle
>    /test/full` (exit 0, last line `"ok":true`; twenty-two),
>    `base-package-haici`'s and the help viewer's three times. Keep the
>    laptop awake: last run's one failure was a sleep.
> 6. **The feedback flag, by hand** (your install, `~/.haicc`, its
>    sources this clone's `sources/`):
>    ```sh
>    haicc boot/deploy
>    haicc . boot/deploy docs haiccing/base-component-docs
>    haicc . boot/deploy host haiccing/base-component-haicc --flags continuation=start
>    haicc host crud/read swarms --flags feedback the list is empty, a swarm was expected
>    ```
>    It answers "Feedback on crud/read swarms recorded: request
>    `<id>`." and the command to read it back, as typed after the
>    position: run it as `haicc host <that command>`. Then, each
>    with its exit code and what it said:
>    ```sh
>    haicc --output host crud/read "done/*[value/value/protocol='haici']" --flags layer=request
>    haicc . boot/teardown host --flags feedback do not, it is in use
>    haicc host crud/read swarms
>    haicc host haici/feedback swarms "asked directly" crud/read
>    haicc host crud/read swarms --flags feedback
>    ```
>    (every feedback there, read by protocol; the teardown not run, the
>    host still answering after it; asked directly, the same answer; no
>    text, not run, exit 1, said why). Then
>    `haicc boot/teardown`, nothing left running.
> 7. **arm64 in a container, if this machine can** (optional; no more
>    than an hour on it). First `docker run --rm --platform linux/arm64
>    debian:bookworm-slim uname -m`. If it does not answer `aarch64`,
>    say what it said and stop this step: do not install binfmt or
>    change Docker's settings. If it does: an arm64 container as
>    `test/container.sh` makes one (read it: the sources read only at
>    the same path, the installer mounted, `HAICC_TIMEOUT=120`), with
>    `--platform linux/arm64`; in it the installer, `haicc sources link
>    <the sources>`, `haicc prereq` (it says `platform: linux-arm64`),
>    `haicc boot/deploy`, `haicc . crud/read .`. Each step's exit code,
>    what it said and how long it took. Under emulation the boot's
>    runtime may not answer (as in the cloud): say so, with
>    `top`'s CPU for its `bare` while it waits, and leave it there.
>    Remove the container after.
> 8. **Your note**: a section at the top of this file, as always: the
>    commit, each step's result and timings, anything that looked wrong
>    or slow. Then `git checkout main`, `git pull`, write the note there,
>    commit it alone to `main` and push.
