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
