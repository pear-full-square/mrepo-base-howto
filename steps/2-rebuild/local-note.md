# The local agent's runs

The prompt for the next local run (below), and the local agent's note on
its last run, a section above it, newest only: the notes of earlier runs,
and the release records, are in git's history. The local machine works
offline: every download kept in a local source (`~/haicc-mirror/`), so
`tools/install.sh` and `tools/release.js` run with no network.

## 2026-11-21: `004dbc7` built and tested; the help viewer set up for the human

"The next run" (below), step by step. Test only: no release, no
product repository.

1. **The clone:** `main` at `004dbc7a4b4a56610b27e3a565da57156147a548`.
   The human's install torn down first (4 runtimes): its sources are
   this clone's `sources/`, rebuilt next.
2. **The dependencies, the sources:** `tools/install.sh` exit 0, 1 s
   ("0 fetched, 207 kept, 0 linked": `mrepo-base-help`'s link was
   already there). `release.js` exit 0, 38 s: `sources/haiccing/`
   twenty bundles (`base-package-help` new), `sources/splectral/` one,
   each with its manifest, every entry's commit `004dbc7a`; `git status`
   no change.
3. **The checks:** `release.js --strict` exit 0 (24 s), every report
   `current`; `code-check.js` "24 modules, 22 packages: 0 problems";
   `info-extract.js --files` "445 READMEs, 0 problems".
4. **The tests:** nothing left after any (`pgrep`: 0 bare; `docker ps
   -a --filter label=haicc.folder`: 0).

   | test | runs | result | time each |
   |---|---|---|---|
   | boot `/test/validate` | 3 | `"ok":true` each | 110, 110, 109 s |
   | `run.sh` | 3 | 319/319 each | 399, 384, 376 s |
   | `splectral.sh` | 3 | 55/55 each | 82, 80, 83 s |
   | `container.sh` | 1 | 18/18 | 42 s |
   | `pair.sh` | 1 | **41/41** | 191 s |

   `splectral.sh`'s page timings (ms, the three runs alike): `/help/`
   1300–1400 the first time; `hdlc/validation` 2400–2600 first, 11
   kept; `?at=splectral` 1300–1500; `?at=.` 490–610; `?raw` 1400–1530;
   a command typed 1280–1390, the teardown one ~620; site pages 6–13.
   **Slowest: `/help/no/such/thing`, 4022, 4112, 4524**: a keyword that
   is not there takes three times a found page's time (each missing
   level asked?). Not wrong, but it is the page a human mistyping
   meets; worth a look.
5. **Every bundle's own tests:** twenty-one, exit 0, `"ok":true` each
   (`base-package-help`: 14 units, 248 tests, 19 s). The help viewer's
   (27 units, 364 tests, ~150 s) six times in all: **one failed**, run
   2: the unit `mrepo-base-execute`, "no test ran: no summary reported",
   the run 26151 s long. The laptop slept during it: the kernel log
   shows the clock "jumped backwards" twice (WSL resyncing after the
   host woke), then Bare aborted (signal 6) eight minutes later, inside
   the test "the flag unit: a folder a flag ... strict". Runs 1, 3, 4,
   5, 6 passed, and `mrepo-base-execute`'s own tests five times (10/10,
   98/98 each, 15–22 s). Read as the sleep, not the code. No
   `runtime-stall.json`: not a stall, an abort. Open: a test that
   aborts rather than fails when the clock jumps; harmless in the cloud,
   noted in case it shows again.
6. **By hand, for the human:** `~/.haicc`, sources this clone's
   `sources/` (`haicc sources`: `folder:` the clone's). The eight
   commands, exit 0 each: `boot/deploy` 1.6 s, `docs` 7.0 s, `host`
   12.4 s, `splectral` 12.5 s, `help` 2.2 s, `splectral/install` 3.3 s,
   `service/initialise` 2.3 s, `service/start` 3.1 s.

   The command line:

   | command | exit | what it said |
   |---|---|---|
   | `haicc host crud/read swarms --flags help` | 0 | help: does, "door: taken here, now", arguments none, `run`, `more: info/get crud/read` |
   | `haicc . boot/teardown docs --flags help` | 0 | help, "taken here, now"; the docs mrepo still there after (`haicc docs info/get` exit 0) |
   | `haicc host crud/update swarms --flags help` | 0 | help, "door: refused here: no action: crud update (create, delete, read)" |
   | `haicc host crud/read swarms --flags nope` | 1 | `{"run":false,...}`, "no flag: nope (container, continuation, help, layer, log)"; last line `haicc: not run: ...` |
   | `haicc host --flags help -- crud/read swarms` | 1 | `{"run":false,...}`, "help: on the last command only (it rewrites the command it is on)" |

   The help viewer, `http://127.0.0.1:4400/help/`, left running.
   Headless Chromium, light and dark, 1280 px and 390 px:

   - **The drop-downs:** the mrepo `. (the root)`, `docs`, `host`,
     `splectral`, `help` (indented under `splectral`), as the prompt
     says. A level's choices its parent's answer (`hdlc`'s: `test`,
     `autonomy`, ... `validation`, `tooling`); `haicc (4)` shows a count.
     `–` first in each level, to `./` and to `hdlc` from
     `hdlc/validation`: one level up, right. They navigate on change.
   - **`raw`:** the whole response as the terminal prints it, `page` to
     go back. Its `command` is `["haicc","docs","info/get","hdlc/validation"]`;
     it differs from the terminal's only where it must: topic
     `/splectral`, header `"by":"splectral"`, keys and times. One thing:
     **long lines are cut at the box's edge** (the `page` string), with
     no wrap; at 390 px that is most lines. A wrap, or a scroll that
     shows, would help.
   - **Another mrepo:** `?at=host` and `?at=.` answer, the drop-down on
     it. `/help/crud?at=host` 3 ms after `crud/read?at=host` (the level
     above asked with it, kept).
   - **The command box:** `host crud/read swarms` answered, "taken here,
     now" in green; `. boot/teardown docs` answered, the docs mrepo
     there after; `host crud/update x`: the door in red, "does: –";
     `host crud/read x --flags nope`: a red bar, "not run: no flag:
     nope ...". Below each, the command actually sent (`... --flags
     help`; for the last one `--flags help nope`). `read more` is a
     link to the page (`crud/read?at=host`), 200; `raw` on a command
     page works too.
   - **390 px:** no horizontal scroll; the drop-downs wrap to two lines,
     `raw` under them; the command box and `help` button fit.
   - **Times:** a page 0.4–1.9 s the first time, ~3 ms after (kept); a
     command typed 0.5–1.0 s every time (not kept, rightly: it is asked).

   The address is the mrepo (`?at=`) and the keywords, a command typed
   `?cmd=`: as agreed (roadmap-2, `tasks/splectral/design.md`, "Not taken up: the address as
   the command"). As the human uses it, the command box gives the
   like for like: what is typed after `haicc` is what is answered.
7. **This note**, committed alone to `main`.

## The next run (2026-11-20, from the cloud session): read this first

The prompt for this run, here so it is read with the notes. Write your
own section above this one, as always; this one stays until the next
prompt replaces it.

What it needs on the local machine: as before (Linux x86-64; git, curl,
tar; Docker, its daemon running; a browser for step 6, or Playwright).
**Test only** (the human, 2026-11-20: "write the next local run prompt
note in the repo to test it"): no release, no product repository, no
`gh`.

What is new since the last run (`splectrum/roadmap-2`: `tasks/splectral/design.md`, "Open, one at a time",
1; `tasks/help-mvp/`), the order agreed with the human after their
manual test of the help viewer:

- **The help viewer's navigation**: a drop-down the mrepo (the
  install's, from Splectral's server), one a level of keywords, each
  level's choices its parent's `info/get` answer; `?raw`, the response
  as the terminal prints it; answers kept until the install changes.
- **The flag unit** (`mrepo-base-request`, `flags/`): strict now, a
  flag that is none, or a value it does not take, and nothing of the
  command runs (`{"run":false,...}`, `haicc` exits 1).
- **Help**: `--flags help` on any command answers it where it would
  run, nothing executed (`help/annotate`, a new package,
  `haiccing/base-package-help`, in every mrepo that has `info`).
- **The command box** in the help viewer: a command typed as after
  `haicc` answered with its help, never run.
- The server's test that failed once in your last run: the test's own
  fault (two files given the same name one time in 16), fixed.

> Build the sources from `main`, test them, and set up the help viewer
> for the human to try.
>
> 1. **Update the clone.** Check out `main` and pull. Write down the
>    commit (`<commit>` below).
> 2. **Install the dependencies, build the sources.** `sh
>    tools/install.sh` (one module new, `mrepo-base-help`), then
>    `tools/bare tools/release.js`: `sources/haiccing/` (twenty
>    bundles, `base-package-help` new), `sources/splectral/` (one), each
>    with its manifest, the commit in every entry `<commit>`. `git
>    status` must show no change after it; if it does, say so and stop.
> 3. **The checks and the reports.** `tools/bare tools/release.js
>    --strict` (exit 0: every report `current`); `tools/bare
>    tools/code-check.js` and `tools/bare tools/info-extract.js --files`
>    (0 problems each). Do not run `tools/package-test.js`: the reports
>    are the cloud session's.
> 4. **The tests, three times each where said**: the boot's test three
>    times (`SOURCES=$PWD/sources tools/bare
>    sources/haiccing/base-component-boot.bundle /test/validate`,
>    `"ok":true`); `sh haiccing/base-linux-haicc/test/run.sh` three times
>    (319 checks), `sh haiccing/base-linux-haicc/test/splectral.sh` three
>    times (55 checks; its timings, a page's above all), `sh
>    haiccing/base-linux-haicc/test/container.sh` and `test/pair.sh` once
>    (18; `pair.sh` was not run in the cloud this time: its count, and
>    any failure in full). Nothing left after each: `pgrep -fa
>    "bin/bare"`, `docker ps -a --filter label=haicc.folder`. A run that
>    hangs: look for `runtime-stall.json` under its temporary folder and
>    copy what it says into your note.
> 5. **Every bundle's own tests**, both organisations:
>    `SOURCES=$PWD/sources tools/bare sources/<org>/<package>.bundle
>    /test/full` (exit 0, last line `"ok":true`; twenty-one), the help
>    viewer's three times.
> 6. **By hand, for the human** (their install, `~/.haicc`, its sources
>    this clone's `sources/`, `haicc sources link "$PWD/sources"` if not):
>    tear down what runs (`haicc boot/teardown`), then
>    ```sh
>    haicc boot/deploy
>    haicc . boot/deploy docs haiccing/base-component-docs
>    haicc . boot/deploy host haiccing/base-component-haicc --flags continuation=start
>    haicc . boot/deploy splectral haiccing/base-package-splectral --flags continuation=start
>    haicc splectral boot/deploy help haiccing/base-package-service
>    haicc splectral splectral/install help splectral/base-component-help-viewer
>    haicc splectral/help service/initialise
>    haicc splectral/help service/start
>    ```
>    Then, on the command line, each with its exit code:
>    ```sh
>    haicc host crud/read swarms --flags help
>    haicc . boot/teardown docs --flags help
>    haicc host crud/update swarms --flags help
>    haicc host crud/read swarms --flags nope
>    haicc host --flags help -- crud/read swarms
>    ```
>    (help answered, nothing run, exit 0; refused at the door, said; a
>    flag that is none, not run, exit 1; help not on the last command,
>    not run, exit 1). Left running for the human:
>    `http://127.0.0.1:4400/help/`. A look in a browser, light and dark,
>    and at a 390 px window: the drop-downs (the mrepo: `.`, `docs`,
>    `host`, `splectral`, `help`; a level chosen, one gone back up with
>    `–`); `raw` and back; a page at another mrepo (`host`, `.`); the
>    command box with `host crud/read swarms`, `. boot/teardown docs`
>    (answered, the docs mrepo still there after), `host crud/update x`
>    (refused, red), `host crud/read x --flags nope` (not run), a
>    `read more` link followed. How long a page takes the first time and
>    the second (answers kept).
> 7. **Your note**: a section at the top of this file, as always: the
>    commit, each step's result and timings, what you saw in step 6 and
>    anything that looked wrong or slow. Commit the note alone to `main`
>    and push.
