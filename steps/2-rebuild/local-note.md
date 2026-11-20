# The local agent's runs

The prompt for the next local run (below), and the local agent's note on
its last run, a section above it, newest only: the notes of earlier runs,
and the release records, are in git's history. The local machine works
offline: every download kept in a local source (`~/haicc-mirror/`), so
`tools/install.sh` and `tools/release.js` run with no network.

## 2026-11-19: `62af3e4` built, tested, released as `r-62af3e4`

"The next run" (below), step by step.

1. **The clone:** `main` at `62af3e479025ce93714bcc2188f21020a66ed183`.
2. **The dependencies, the sources:** `tools/install.sh` exit 0 ("0
   fetched, 207 kept, 1 linked": `splectral-base-help-viewer`); the
   three gone modules' links removed. `release.js` exit 0:
   `sources/haiccing/` nineteen bundles, `sources/splectral/` one
   (`base-component-help-viewer`), each with its manifest, every entry's
   commit `62af3e4`; `git status` no change.
3. **The checks:** `release.js --strict` exit 0, every report `current`
   (20); `code-check.js` "23 modules, 21 packages: 0 problems";
   `info-extract.js --files` "423 READMEs, 0 problems".
4. **The tests**, nothing left after any (no `bin/bare`, no container):
   - the boot's test: `"ok":true` three times (100, 86, 98 s);
   - `run.sh`: 308/308 three times (362, 363, 362 s);
   - `splectral.sh`: 43/43 three times (70, 70, 69 s). Timings (ms),
     runs 1/2/3: boot 1728/1789/1770, docs 7763/7567/7688, splectral
     14913/14682/14851, base 2531/2506/2412, install 4369/4513/4259,
     initialise 4577/4694/4675, start 3655/3714/3517, stop
     3352/3267/3298, teardown 2300/1781/1860, machine 1037/980/859. A
     page 1162–1360 ms; the answers that need no component (not running,
     not deployed, a 404) 6–9 ms;
   - `container.sh` 18/18 (37 s); `pair.sh` 41/41 (172 s).
5. **Every bundle's own tests:** nineteen haiccing exit 0, `"ok":true`.
   **`splectral/base-component-help-viewer`: failed once**, then passed
   three times out of three (128, 99, 102 s). The failure, in its
   module `splectral-server` (`test/server.test.js:332`, "a component: a
   page asked through its Splectral inbox …"): `actual: 504, expected:
   200` for `/viewer/hdlc/validation?x=1`, so the two asserts after it
   failed too. A margin, not a defect, as I read it: the test serves
   with `wait: 1500`, and the page's round trip passes four folders
   each followed `every: 200` (the component's inbox, its outbox, the
   root's inbox and outbox), so under load it passes 1.5 s; the server's
   own default is 20 s. **Proposal:** the test's `wait` raised (5000)
   with its "not answering" case kept short in a test of its own. The
   same module's tests passed in `haiccing/base-package-splectral`'s
   bundle. Released, as only haiccing's packages are, and the reruns
   passed.
6. **The release `r-62af3e4`**, twenty repositories in `haiccing`, 41
   assets, tag `r-62af3e4` targeting `main`, notes "Built from
   62af3e4…", none a pre-release, each asset's size and digest checked
   on GitHub against what was staged (0 mismatches; `base-docs-xpath`
   needed a second try). The repositories' `main` is as last pushed
   (2026-11-17): their content was not written, as the prompt says.
   The record below.
7. **The release checked**, a fresh temporary install, the prompt's
   commands: the installer from `releases/latest` (sha256 `fbae3513…`);
   the download 272 s, the manifest from `base-docs-haicc`'s latest
   release, all nineteen `fetched (r-62af3e4)`, "downloaded, as its
   manifest says"; `prereq` ok; `boot/deploy`, the docs mrepo,
   `docs info/get hdlc/validation`, `boot/teardown` exit 0; nothing
   left; the folder removed.
8. **For the human:** `haicc` reinstalled from the release's installer
   (`~/.haicc/bin` now as this commit's `base-linux-haicc/bin`; it was
   `r-6b4d346`'s); the sources still this clone's `sources/`. Torn down,
   then the prompt's seven commands, every one exit 0 (docs 5.5 s,
   Splectral 11.4 s, the rest 1.2–3.5 s). **Left running:
   `http://127.0.0.1:4400/`.** In a browser (headless Chromium): the
   `install` and `help` tabs; `/help/` the docs top; `/help/hdlc/validation`
   (0.9 s), light and dark; a keyword below (`/help/hdlc`, `/help/mrepo`);
   the `mrepo` form (`docs`, `read`) and `?at=splectral` answering
   Splectral's own pages; a keyword not there (`/help/no/such/thing`):
   the error, and the nearest keywords now links; a 390 px window.
   The `install` tab in dark: the tree (boot, docs, splectral, help
   started), the help viewer's requests among the commands, an error's
   message in red.

### The human's manual test: the help viewer like for like with the command line

The human, after trying the site (2026-11-20): "really slick", then
three points: the `mrepo` box takes an mrepo only, not keywords (and
nothing lists the mrepos); there is no navigation, "one has to guess";
and "to have equivalence with command line I should be able to enter
what info/get requests and see the same result. Important is to have a
100% like for like with command line." Discussed with the local agent;
the proposal below is what we came to, for the team (the cloud session)
to design. Nothing changed in the code.

1. **The address is the command** (the human: "The same command = the
   same page"). The command's words, in order, are the path below the
   component: `haicc docs info/get hdlc/validation` is
   `/help/docs/info/get/hdlc/validation`; `haicc splectral/help
   info/get` is `/help/splectral/help/info/get`. Every page then
   bookmarkable, shareable, Back works, and following links is
   navigating.
   - **Where the URI ends**: a URI has slashes (`splectral/help`), so do
     keywords. The server knows the install's tree (the `install` tab
     draws it) and what each mrepo offers: the longest run of known
     mrepos is the URI, the next two segments the protocol and action,
     the rest the arguments. Ambiguous only if an mrepo is named like a
     protocol: the proposal, `boot/deploy` refuses such a name, rather
     than a separator in every address.
   - **The root `.`** needs a form in a path (`/help/./info/get`, or a
     name); **flags** in the query (`?flags=log=verbose`), last as on
     the command line.
2. **Navigation, cascading dropdowns** (the human's proposal): a
   dropdown for the mrepo; for the chosen mrepo, a dropdown of its first
   level's keywords; as one drills down, the next level's.
   `[docs ▾] › [hdlc ▾] › [validation ▾]`: the row is the breadcrumb
   and the menu at once; choosing opens that address; changing a level
   drops those after it; a page with nothing below has no further
   dropdown.
   - **Each level's options are the parent's own `info/get` answer**,
     its below: level one is `haicc docs info/get`'s below, level two
     under `hdlc` is `haicc docs info/get hdlc`'s. No index of its own
     that can drift: the navigation is like for like too.
   - **The mrepos from the install's tree**, indented as the `install`
     tab draws them.
   - **A keyword opening several pages** says so (`package (3)`): the
     below entries' `choices` count, today not shown in the browser.
   - **Not every page at once**: the docs mrepo has about 1,200
     keywords and 425 pages, too many for a list; a filter over the
     keywords later if wanted.
   - Plain `<select>`: keyboard and phone with no extra code.
   - Later, other read-only actions: a dropdown between the mrepo and
     the keywords for what the mrepo offers (`docs ▾ › info/get ▾ ›
     hdlc ▾`), the same pattern.
3. **The command line's own output, `?raw`**: on any address, exactly
   what that command prints in a terminal (the record, its log, its
   metrics). The drawn page stays the default, a view of that answer.
   **A test**: for a set of commands, `?raw` byte for byte the command
   line's output; the AI agent's comparison of 2026-11-18 then a check
   run every time.
4. **Read-only actions only** in addresses: following a link never
   deploys, starts or stops anything. `info/get` first; `crud/read`,
   `splectral/status` and the like when wanted.

Also from the agent's comparison (2026-11-18), still open: keywords
named in a page's text (`boot howto`, `xpath`) as links.

### The release record, `r-62af3e4`

Each asset is downloaded from
`https://github.com/haiccing/<repository>/releases/download/r-62af3e4/<asset>`;
the manifest and the installer also from
`…/releases/latest/download/<asset>` (`base-docs-haicc`'s manifest is
the one `haicc sources download haiccing` reads; `base-linux-haicc`'s
for the installer released before).

| Repository | Asset | Bytes | sha256 |
|---|---|---:|---|
| `base-app-haicc` | `base-app-haicc-addons.tar` | 17,397,760 | `b12456a5bf93a4776212cc1dd8ff58a63322d9fdbf9ecb176aa05876fe8dcea3` |
| `base-app-haicc` | `base-app-haicc.bundle` | 4,400,147 | `aeac98a8518f585416ca9f00a3349f9aca0b8d53e1efb640fbad204692b58ecc` |
| `base-component-boot` | `base-component-boot-addons.tar` | 17,397,760 | `b12456a5bf93a4776212cc1dd8ff58a63322d9fdbf9ecb176aa05876fe8dcea3` |
| `base-component-boot` | `base-component-boot.bundle` | 4,434,336 | `f3b47708dcb3d72b294790ca42e3ff2f2804fcf797b6ca98adbbbd134529d290` |
| `base-component-docs` | `base-component-docs-addons.tar` | 983,040 | `12dac01c75477fac09c05b130767388f30f5afeb216f0f85ddb72162507ab377` |
| `base-component-docs` | `base-component-docs.bundle` | 1,095,287 | `bfcd16670cd94be6e610607e5fe4c967717b37247ef60791bb8c3f6bc94df07d` |
| `base-component-haicc` | `base-component-haicc-addons.tar` | 983,040 | `12dac01c75477fac09c05b130767388f30f5afeb216f0f85ddb72162507ab377` |
| `base-component-haicc` | `base-component-haicc.bundle` | 1,104,757 | `5cc4cf5b19e15c878644aa09c3366a2462f015df47a67dc399f330aacbf93bf7` |
| `base-docs-haicc` | `base-docs-haicc-addons.tar` | 983,040 | `12dac01c75477fac09c05b130767388f30f5afeb216f0f85ddb72162507ab377` |
| `base-docs-haicc` | `base-docs-haicc.bundle` | 1,088,638 | `3fd0f778101d6bb2ddba21f9f7941240c56f41252150fb0c60510425c6308928` |
| `base-docs-haicc` | `manifest.json` | 45,301 | `312d6b917bb8cba539f701428a18cdcfbee9d7d28f30380833028f583ac4df96` |
| `base-docs-hdlc` | `base-docs-hdlc-addons.tar` | 983,040 | `12dac01c75477fac09c05b130767388f30f5afeb216f0f85ddb72162507ab377` |
| `base-docs-hdlc` | `base-docs-hdlc.bundle` | 1,095,090 | `57729c7e0d692510a4a4a1a059726823e92dab3809722c9fdd55342a905947f6` |
| `base-docs-package` | `base-docs-package-addons.tar` | 983,040 | `12dac01c75477fac09c05b130767388f30f5afeb216f0f85ddb72162507ab377` |
| `base-docs-package` | `base-docs-package.bundle` | 1,159,584 | `993b1b47f58e5965daa95589b261b7333c1bc069c1fa0997dd9628c9e87a8dd8` |
| `base-docs-uri` | `base-docs-uri-addons.tar` | 983,040 | `12dac01c75477fac09c05b130767388f30f5afeb216f0f85ddb72162507ab377` |
| `base-docs-uri` | `base-docs-uri.bundle` | 1,085,176 | `d731116ad33c77e0ceaafac86e77589f47c465611c19e2bdc60822947809db89` |
| `base-docs-vision` | `base-docs-vision-addons.tar` | 983,040 | `12dac01c75477fac09c05b130767388f30f5afeb216f0f85ddb72162507ab377` |
| `base-docs-vision` | `base-docs-vision.bundle` | 1,114,073 | `ebd9a39f100ef20f32ae1e7f35d5973d8664aae3783e0e544adc495236580dd6` |
| `base-docs-xpath` | `base-docs-xpath-addons.tar` | 983,040 | `12dac01c75477fac09c05b130767388f30f5afeb216f0f85ddb72162507ab377` |
| `base-docs-xpath` | `base-docs-xpath.bundle` | 1,086,108 | `b04682d780241ef28dc65790850d57d38feb8ab58025d45506fd838a32160f05` |
| `base-linux-haicc` | `haicc-install.sh` | 17,862 | `fbae35134db00c8415d6b036113bb34f1ddc7ec71c62dc4ae9b9c08c098ac7b3` |
| `base-linux-haicc` | `manifest.json` | 45,301 | `312d6b917bb8cba539f701428a18cdcfbee9d7d28f30380833028f583ac4df96` |
| `base-package-boot` | `base-package-boot-addons.tar` | 17,397,760 | `b12456a5bf93a4776212cc1dd8ff58a63322d9fdbf9ecb176aa05876fe8dcea3` |
| `base-package-boot` | `base-package-boot.bundle` | 4,400,628 | `805c3bcaccbb32404c1718cb0bc4a661600ff7b892ea93e282127244fc79b3f0` |
| `base-package-container` | `base-package-container-addons.tar` | 17,397,760 | `b12456a5bf93a4776212cc1dd8ff58a63322d9fdbf9ecb176aa05876fe8dcea3` |
| `base-package-container` | `base-package-container.bundle` | 4,439,158 | `596966a05b440528d0a7470b8a42d45a78bc1f93a134ebb87600e4f0d60cfd98` |
| `base-package-crud` | `base-package-crud-addons.tar` | 983,040 | `12dac01c75477fac09c05b130767388f30f5afeb216f0f85ddb72162507ab377` |
| `base-package-crud` | `base-package-crud.bundle` | 1,213,141 | `effa47017f4448dcb16457c8ef9b9f2214fe152ee7adc2a3b0c5ccaabe8cd762` |
| `base-package-haicc` | `base-package-haicc-addons.tar` | 17,397,760 | `b12456a5bf93a4776212cc1dd8ff58a63322d9fdbf9ecb176aa05876fe8dcea3` |
| `base-package-haicc` | `base-package-haicc.bundle` | 4,049,267 | `05fd50edb8346723b22e8e816f0b0fb485c5fcf8045ab22a558f22eee257d04d` |
| `base-package-info` | `base-package-info-addons.tar` | 983,040 | `12dac01c75477fac09c05b130767388f30f5afeb216f0f85ddb72162507ab377` |
| `base-package-info` | `base-package-info.bundle` | 1,095,398 | `4b0b5aeb596aa8008302e6cc05d4538fd3f9672f7eb9bae6f31ec1f717512dc4` |
| `base-package-protocol` | `base-package-protocol-addons.tar` | 983,040 | `12dac01c75477fac09c05b130767388f30f5afeb216f0f85ddb72162507ab377` |
| `base-package-protocol` | `base-package-protocol.bundle` | 1,102,235 | `bd5b0e2d582f61db09b626486d635932a2a1c6bc5882917289d31abeac7829e2` |
| `base-package-runtime` | `base-package-runtime-addons.tar` | 17,397,760 | `b12456a5bf93a4776212cc1dd8ff58a63322d9fdbf9ecb176aa05876fe8dcea3` |
| `base-package-runtime` | `base-package-runtime.bundle` | 4,296,648 | `53c49ce0f2581cdf3e60d02de71c56e31b9b9e698c37dc4fe7dc5f8e9b1143c1` |
| `base-package-service` | `base-package-service-addons.tar` | 17,397,760 | `b12456a5bf93a4776212cc1dd8ff58a63322d9fdbf9ecb176aa05876fe8dcea3` |
| `base-package-service` | `base-package-service.bundle` | 4,010,164 | `086ece8aac293d2f84b31db281286066ef5deaa28a603368b51f96249475fcd4` |
| `base-package-splectral` | `base-package-splectral-addons.tar` | 17,397,760 | `b12456a5bf93a4776212cc1dd8ff58a63322d9fdbf9ecb176aa05876fe8dcea3` |
| `base-package-splectral` | `base-package-splectral.bundle` | 4,653,373 | `3a6e5e8cc86233e8a1db5186ea6f8ec177433d6f7b5428bf911d0681049704b4` |

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
