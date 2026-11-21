# For the next session: where step 2 stands

Read, in this order: `CLAUDE.md` (what is here, how to validate); then
`haiccing/base-docs-hdlc/README.md` (how work is done) and
`haiccing/base-docs-haicc/README.md` (the platform and our terms); then
the roadmap and the scheduled work, `splectrum/roadmap-2` (private;
attached with `add_repo`, push, cloned beside this one): its
`README.md`, `roadmap/` (the priorities, the phases, the plan) and
`tasks/` (one folder a task, the designs in discussion beside theirs).
What is built is documented in the packages; the history is git's.

## Starting a session

A fresh clone has no `node_modules/` and no `sources/` (both ignored by
git), so nothing runs until they are there:

```sh
sh tools/install.sh           # the dependencies, replayed from the lockfile (curl, tar; no npm)
tools/bare tools/release.js   # every package assembled and bundled into sources/, Bare's tarball
```

Then the validation in `CLAUDE.md` works. To see the whole thing run:
`sh haiccing/base-linux-haicc/test/run.sh`.

**Docker**: the container protocol's tests and the `haicc` test's
cluster make real containers. In a cloud session Docker is installed
but no daemon runs when the session starts: `sh tools/docker.sh` starts
it (as root) and waits for it; it does not survive the session's
container. Without a daemon those tests fail, they do not skip.

- **Work on `execute/main`**, merged into `main` with a plain merge, both
  pushed (a cloud session may be given a branch of its own: it is not
  used for the work).
- **`splectrum/roadmap-2`** is attached (`add_repo`, with push) and
  cloned beside this one; its commits as hdlc's "Branches".
- **The product repositories** are pushed from here, so a cloud session
  attaches them first (`add_repo`, with push): the modules, each
  `pear-full-square/<module>` for a folder of `pear-full-square/`
  (`sh tools/products.sh <module>...`); the packages, each
  `haiccing/<package>` for a folder of `haiccing/`
  (`sh tools/packages.sh -m "<what changed>" <package>...`). Only those
  that changed.
- **`haicc` itself**: the cloud environment's setup script (2026-11-18)
  installs it from its latest release in every fresh session (`haicc` on
  the PATH, its folder `~/.haicc`, Bare and the haiccing packages
  downloaded; not booted): `haicc boot/deploy` to start. That is the
  released haicc; this repository's own build is `sources/`, linked
  with `haicc sources link "$PWD/sources"` to use it instead.
- **A browser**: Chromium and Playwright are installed in a cloud
  session (`require('playwright')`, no install), for a page's
  screenshot (Splectral's, the docs view).
- **Nothing is left running** by the tests. A runtime left over from a
  failed run: `pgrep -fa "bin/bare"`, then stop it by its pid.

## Right now

**Paused for a review** (the human, 2026-11-21: "pause the builds, and
we'll do a review of each"; "don't run off without talking"). Before
anything else: `splectrum/roadmap-2`, `tasks/review/`: the items, the
state of each build session, the form of the review (as our last one:
`tasks/distributed-applications/design.md`, "The proof of concept
reviewed"), and what is open with the human. Nothing is built, merged
or sent to a build session until the review is done and the human has
approved what follows. Use our own help and rules for how we work
(`base-docs-hdlc`, the packages' pages, `info`); do not invent process.

- **Work not on `main`, in the build sessions' containers only**:
  `runnable-howtos`' phase 1 (`session_01WxkeD3Xo8aGfLG9vjQt6Ay`,
  paused) and `avro-foundation`'s rework, three commits and 48
  generated files (`session_01WxkeD3QaJg6w838zRfqwFR`, paused). Their
  state: `tasks/review/`, items 5 and 6.
- **Product repositories**: `avro-foundation` says it pushed 8 modules
  and 23 packages "at the human's request" from e7433ac7: to confirm
  with the human. Otherwise pushed only when the human asks. Not pushed
  since 2026-11-19: `pear-full-square/.github` (its profile no longer
  links this repository, 2026-11-20).
- **A rule proposed, not committed** ("Work outside the rules needs
  approval", for `base-docs-hdlc`): its text in `tasks/review/`, "Open".
- **The local agent**: its prompt and its last note, `local-note.md`;
  its instructions, `handover-local.md`. Its last run (2026-11-21):
  004dbc7 built and tested, the help viewer set up for the human.
- **The roadmap-1 transfer**: done (2026-11-20); roadmap-1 ready for the
  human to archive (`tasks/cleanup/`).
