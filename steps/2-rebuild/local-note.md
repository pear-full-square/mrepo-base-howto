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
