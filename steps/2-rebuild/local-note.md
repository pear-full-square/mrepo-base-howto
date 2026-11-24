# The local agent's runs

The prompt for the next local run (below), and the local agent's note on
its last run, a section above it, newest only: the notes of earlier runs,
and the release records, are in git's history. The local machine works
offline: every download kept in a local source (`~/haicc-mirror/`), so
`tools/install.sh` and `tools/release.js` run with no network.

## 2026-11-24: `8a4a9ae` built and tested (service-every-mrepo); the products pushed; Codeberg synced

"The next run" (below), step by step. No release.

1. **The clone:** `main` at `8a4a9aeb6974b928d72527358e237093b0f11dec`
   (2026-11-23, "Merge branch 'execute/main'"). Nothing running before.
2. **The dependencies, the sources:** `install.sh` exit 0, 9 s ("1
   fetched, 207 kept, 8 linked"). `release.js` exit 0, 55 s:
   twenty-nine bundles (`sources/haiccing/` 27, `sources/splectral/`
   2), every entry's commit `8a4a9aeb`; `sources/holepunchto/` both Bare
   tarballs; `git status` no change.
3. **The checks:** `release.js --strict` exit 0 (39 s), every report
   `current`, platforms `linux-x64`, `linux-arm64`; `code-check.js` "33
   modules, 30 packages: 0 problems"; `info-extract.js --files` "608
   READMEs, 0 problems".
4. **The full test:** nothing left after any (0 bare, 0 containers).

   | test | runs | result | time each |
   |---|---|---|---|
   | boot `/test/validate` | 3 | `"ok":true` each | 109, 111, 105 s |
   | `run.sh` | 2 | 370/370 each | 414, 506 s |
   | `splectral.sh` | 2 | 85/85 each | 205, 203 s |
   | `swarm.sh` | 3 | 92/92 each | 354, 355, 353 s |
   | `container.sh` | 2 | run 1 2/17, run 2 **17/17** | 2, 32 s |
   | `pair.sh` | 2 | run 1 27/39, run 2 **39/39** | 147, 184 s |

   **Runs 1 of `container.sh` and `pair.sh` failed by my doing, not
   the code's**: "exec sh failed: Exec format error". My arm64 check in
   the last run (`docker run --platform linux/arm64
   debian:bookworm-slim`) had replaced the local `debian:bookworm-slim`
   with its arm64 image, which this machine cannot run. Pulled the
   amd64 one back (`docker pull --platform linux/amd64`), before any
   bundle test that makes containers; both run again, whole. For a
   later arm64 check: a tag of its own, never the shared one.

   `splectral.sh`'s page timings (ms, the two runs alike): `/help/`
   1900–2170; `haiccing/base-docs-hdlc/validation` 4210–4370 (1890–2690
   last run, as `hdlc/validation`); `/help/no/such/thing` 4050–4270;
   the workbench's page 6110. **These are first visits, the worst
   case, not what browsing feels like.** Measured after (a workbench
   install, torn down after):
   - the lookup itself is fast: the docs mrepo's info is local
     (commission builds it); its own work under 0.1 s;
   - a request costs ~0.65 s a hop between mrepos, whatever it asks
     (root 0.5–0.65 s, `workbench` 1.2 s, `workbench/docs` 1.9–2.0 s;
     `info/get` there the same as `crud/read`): the boxes, not the data;
   - an mrepo answers one request at a time: four at once at the root
     done at 1.0, 1.6, 2.1, 2.5 s;
   - a page asks itself and each level above it (its drop-downs), sent
     at once, answered in turn: cold, `/help/` 2.4 s, a page two levels
     deep 6.3 s, three 8.0 s (the workbench); the split on package
     made keywords a level deeper, one request more;
   - the viewer keeps every answer until the install changes: the same
     page again 3 ms; a new page whose levels are known one request
     (~1.8 s in the workbench, ~1 s with the docs mrepo one hop away);
     the command box asked each time (0.5–1 s).
   Proposed, best first: one request a page (the levels above with
   the answer, or the whole path asked once): a cold deep page ~2 s,
   not 8; then where the 0.65 s a hop goes (the request records'
   timestamps, hop by hop); read-only requests in parallel in an mrepo
   is a design question, raised, not pushed.
5. **Every bundle's own tests:** twenty-nine, exit 0, `"ok":true`
   each; the longest `base-component-boot` 262 s,
   `base-solution-workbench` 215 s, `base-package-container` 187 s.
6. **The products**, from `main` at `8a4a9ae`. While the tests ran,
   `origin/main` moved to `2953eaf`: one commit, a note
   (`steps/2-rebuild/handback.md`, `handover-next.md`, a line of
   `CLAUDE.md`), no product folder touched; the local `main` stayed the
   commit tested, the scripts push from it, so pushed (pulled after).
   - **Modules** (`tools/products.sh`, one at a time): 22 merged;
     `mrepo-base-crud` and `mycelium-value-avro` "up to date"; 7
     repositories missing.
   - **Packages** (`tools/packages.sh`, `PACKAGES` a temporary folder,
     removed after): 23 committed, `base-solution-workbench` among
     them; 6 repositories missing.
   - **The check after**: 50 the same as their folders here, one not:
     `mrepo-base-crud`. "Up to date" was wrong: the split was in its
     history from the push by mistake of 2026-11-21, its content the
     reset's. Merged by content (`501d52a8`), the same after. All 51
     repositories that exist: their content this commit's.
   - **Missing, for the human to create (13)**: packages
     `haiccing/base-component-node`, `base-package-dispatch`,
     `base-package-log`, `base-package-rns`, `base-package-swarm`,
     `splectral/base-component-log-viewer`; modules
     `pear-full-square/mrepo-base-dispatch`, `mrepo-base-log`,
     `mrepo-base-rns`, `mrepo-base-swarm`, `p2p-local`, `p2p-topic`,
     `splectral-base-log-viewer`.
   - **For a release**: `base-component-haicc` and
     `base-solution-workbench` list `haiccing/base-package-swarm`
     among their packages: no haiccing release that installs a host
     until its repository exists. Splectral has none yet either: its
     manifest's repository, `splectral/base-docs-splectral`, is not
     there.
7. **Codeberg** (`~/codeberg-sync.sh update`, the human's, 2026-11-24):
   the network poor all along (connections reset, TLS cut). The first
   try stopped at "Codeberg token rejected": a dropped connection, the
   token fine (200 three times after). The second: 7 failures, six of
   them the network; the third, for the owners that had them: one,
   `pear-full-square/mrepo-base-crud`, "create on Codeberg", twice.
   Created by hand through the API (201; its description set after,
   200), the cause not found (not its description's apostrophe: that
   one was taken). A last run for `pear-full-square`: "done". GitHub
   and Codeberg's `main` the same, checked for five of today's.
8. **The responsibilities** (the human, 2026-11-24): written into
   `handover-local.md` ("Who does what", "Codeberg") and a line of
   `CLAUDE.md`, pushed (`f49a6d6`).

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

