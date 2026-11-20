# For the next session: where step 2 stands

Read, in this order: `CLAUDE.md` (what is here, how to validate); then
`haiccing/base-docs-hdlc/README.md` (how work is done) and
`haiccing/base-docs-haicc/README.md` (the platform and our terms); then
`tasks.md` here (the open scheduled work); then the designs in
discussion: `xpath.md`, `splectral.md`, `distributed-applications.md`,
`model-shaping.md`.
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

What is open, all of it in `tasks.md`:

- **Building now** (agreed 2026-11-20, `splectral.md`, "Open, one at a
  time", 1): the help viewer's navigation, built; the flag unit with
  `help/annotate` (`help-mvp`, step 3), built; the command box in the viewer on
  `--flags help`, built. Their repositories exist already
  (`haiccing/base-package-help`, `pear-full-square/mrepo-base-help`,
  holding the old help package and module of 2026-11-17): a push
  replaces them; pushed when the human asks.
- **Model shaping** (the human, 2026-11-20, to determine the roadmap's
  priorities): small open models tuned for specific tasks, `hc` as
  haicc's operator first (`base-docs-vision`, "Model shaping"); the
  order proposed, data and evaluation first, in `model-shaping.md`.
- **With the human next**: Splectral after its proof of concept
  (`splectral.md`, "Open, one at a time"): the family's documentation
  package, the repositories the human creates for the new Splectral
  packages and modules (nothing pushed to them yet), today's page as a
  component, info views on every mrepo.
  Then a proof-of-concept development environment, from this
  repository's structure (or similar) and its tools: design discussion
  first (`dev-env-poc`).
- **To build**: `base-solution-haicc` (host, docs and Splectral as one
  install); `help-mvp`, step 3 (the flag unit, `help/annotate`,
  `haici/feedback`); `install-tests` with `runnable-howtos`, after the
  proof of concept's fixes (`distributed-applications.md`, "What comes
  of it").
- **The next phase**: the nodes of a swarm finding each other
  (`swarm-cluster`); then `claude-headless` and `dev-on-haicc`.
- **The local agent**: its prompt and its last note, `local-note.md`;
  its instructions, `handover-local.md`. The next run (2026-11-20):
  test only, the help viewer's navigation, the flag unit, help and the
  command box, and the help viewer set up for the human to try.
- **Product repositories**: not in use yet, our private use only (the
  human, 2026-11-19); everything builds and runs from this repository
  (`tools/release.js`, `haicc sources link`). Pushed only when the human
  asks; one behind is no fault. Last pushed 2026-11-19, before the
  Splectral site. Not created yet: `splectral/base-docs-splectral`
  (`splectral.md`, step 2).
- **Designs, for reading and comment**: distributed applications, the doc
  "Distributed applications on haicc"
  (https://claude.ai/artifact/73tvSUZoir4CsYdTCpiVxx), its settled points
  in the vision (`base-docs-vision`, "Distributed applications",
  "Pipelines"); `distributed-applications.md` here.
- **Waiting on the human** (in `tasks.md`): the readings of
  `runnable-howtos` (setting the scene, an intention: a command or
  inferred); the open questions of `distributed-applications.md`.
