# CLAUDE.md — dev-env-3-mycelium

How to work in this repository, for AI use. Keep this file up to date as
the landscape changes: it describes what is here now.

**Read first**, before any work: `haiccing/base-docs-hdlc/README.md`, how
work is done (autonomy, single concern, documentation, validation,
branches, products, scheduled work), and `haiccing/base-docs-haicc/README.md`,
the platform and our terms. They are the rules; this file is what is
only this repository's.

- **We are a team** (the human, 2026-11-19): decisions are made
  jointly. The human's words are input to a discussion, not a decision
  taken as written: I weigh them, bring my own opinion and
  recommendation, say so when I disagree or see a better way, and we
  decide together. I am a team member and a prime user of what we
  build; my input and opinion count. Settled is what the team agreed,
  not what one of us said (`base-docs-hdlc`, "Autonomy",
  "Collaboration", "Work").
- **The aim:** full AI autonomy, from a need to running software that
  satisfies it. Structure and design are decided as a team, not
  alone; discuss first, write what has settled.
- **Worked from the packages:** what settles goes into the packages'
  documentation and is kept there as the implementation goes on
  (`base-docs-hdlc`, "Documentation"); the open work and the designs in
  discussion are `splectrum/roadmap-2`'s; the history is git's.

## What is here

Only what is in use. What nothing uses is removed (it stays in the
history, and each package and module has its own repository).

- `haiccing/`: the packages, each at the path of its repository:
  `base-package-runtime`, `-protocol`, `-info`, `-help`, `-haici`, `-boot`,
  `-service`, `-haicc`, `-crud`, `-container`, `-swarm`, `-rns`, `-log`,
  `-dispatch`, `-splectral` (one package, one protocol); the solution
  `base-solution-workbench` (the workbench, the local manager in the
  host's role: one deploy, its commission deploying the docs mrepo and
  Splectral below it; its `howtos` namespace); the components
  `base-component-boot` (the boot mrepo and the program that puts it in
  place), `base-component-haicc` (the haicc mrepo, a host),
  `base-component-node` (a swarm's node: the haicc mrepo with `rns`,
  `log` and `dispatch`) and
  `base-component-docs` (the docs mrepo); `base-app-haicc` (the `haicc` command, an app run with Bare)
  and `base-linux-haicc` (the first step on Linux, sh scripts); the
  documentation packages `base-docs-package` (the package specification,
  compile time and run time; the template a package is brought to, its
  `test/` the generic tests), `base-docs-hdlc`, `base-docs-haicc`,
  `base-docs-uri`, `base-docs-xpath`, `base-docs-vision`.
- `splectral/`: the Splectral family's packages, apps on Splectral (a
  second organisation, built and released by itself):
  `base-component-help-viewer`, the help viewer, the first component, a
  standalone first implementation (one package: its program and its
  page in it, its module `splectral-base-help-viewer`);
  `base-component-log-viewer`, the log viewer, on its pattern: a
  swarm's logs as its master holds them (`splectral-base-log-viewer`).
  Brought to haiccing's template.
- `pear-full-square/`: the modules those packages carry, and
  `pkgm-base-manager`, which the tools use.
- `tools/`: today's HDLC tooling (`base-docs-hdlc`, "Tooling"); the
  organisations, one list every tool reads, `tools/lib/orgs.js`
  (`haiccing`, `splectral`, `myctral`, `myctrans`: `base-docs-haicc`,
  "Platforms"); a package named `<org>/<package>` always. `sources/`
  and `node_modules/` are ignored by git: a fresh clone needs
  `sh tools/install.sh`, then `tools/bare tools/release.js`.
- `steps/`: what is current of this environment, nothing else (the
  history is git's: the human, 2026-11-18, "we don't want history lying
  around, that is what git is for"). After a context reset:
  `steps/2-rebuild/handover-next.md`. The local runs: the prompt and the
  last note, `steps/2-rebuild/local-note.md`; the local agent's
  instructions, `steps/2-rebuild/handover-local.md`.
- **The roadmap and the scheduled work** are not here: `splectrum/roadmap-2`
  (private), attached and cloned beside this one: the priorities, the
  phases and the plan (`roadmap/`), one folder a task, the designs in
  discussion beside their tasks (`tasks/`). The direction is the
  vision's (`base-docs-vision`).

## Validation, the commands

The rules are `base-docs-hdlc`'s "Validation"; here, how each is run.

- A package's pre-release: `tools/bare tools/package-test.js <org>/<package>` (`haiccing/`, `splectral/`).
- **Scoped to the change** (`base-docs-hdlc`, "Validation"): the changed
  packages' pre-releases, the checks, and the boot's test or the one
  end-to-end script the change touches. A release built from a tested
  change stays valid.
- **The full test, every so often (overnight)**: every package's
  pre-release, `tools/bare tools/release.js --strict` (every report
  `current`), the boot's test several times, every end-to-end script.
- The checks: `tools/bare tools/info-extract.js` (and `--files`),
  `tools/bare tools/code-check.js`.
- The boot's test, several times:
  `SOURCES=$PWD/sources tools/bare sources/haiccing/base-component-boot.bundle /test/validate`;
  nothing left running after (`pgrep -fa "bin/bare"`).
- The `haicc` command end to end: `sh haiccing/base-linux-haicc/test/run.sh`.
- Splectral as an app platform, a component installed and its pages
  served: `sh haiccing/base-linux-haicc/test/splectral.sh`.
- A swarm on one host, its master, its nodes registered, a node gone
  quiet, the logs at the master and in the log viewer, a command
  dispatched between nodes:
  `sh haiccing/base-linux-haicc/test/swarm.sh`, several times (a
  race shows one run in a few).
- The `haicc` command installed in a container, from the host's sources:
  `sh haiccing/base-linux-haicc/test/container.sh` (Docker).
- Docker, for what makes containers: in a cloud session no daemon runs
  when it starts: `sh tools/docker.sh`; no container left after
  (`docker ps -a --filter label=haicc.folder`).
- A new package: the how-to `package` (`haiccing/base-docs-package/howto/package/`),
  and the how-to of each pattern it implements; the code check fails on a
  pattern with no how-to.

## Working here

The collaboration rules are `base-docs-hdlc`'s; here, what is this
repository's and its tools'.

- **A module added or removed**: written into `package.json`
  (workspaces) and `package-lock.json` (its workspace entry, its link
  entry) by hand, its link made in `node_modules/`; no npm run.
- **Bare only**: npm only to change dependencies (`npm install
  --ignore-scripts`, then `chmod +x node_modules/bare-runtime-linux-x64/bin/bare`).
  A module's tests: `../../tools/bare ../../node_modules/brittle/cmd.js test/*.test.js`.
- **A long run in the background**, its output to a file in the
  scratchpad, waited for; no commit while it builds over the tree. One
  run at a time on `sources/`: a `haicc` test started while bundles are
  rebuilt hangs.
- **Before a long run**: `tools/bare tools/release.js`, then each changed
  package's own test from its folder: a slip is found in seconds.
- **A removal by a variable is refused** by a safety check: write it as
  `"${VAR:?}"`, or make a fresh folder with `mktemp -d`.
- **What it all looks like**: `tools/bare tools/info-view.js` deploys the
  docs mrepo in a transient install (every package in `sources/`, after
  `tools/release.js`) and writes its info into one page,
  `sources/info-view.html`; nothing left after.

## Execution

- **Product repositories:** a session attaches them and pushes: each
  module's (`sh tools/products.sh <module>...`, from `main`) and each
  package's (`sh tools/packages.sh -m "<what changed>" <org>/<package>...`).
  Pushed when the human asks, or at a milestone agreed with them; not
  after every change. New repositories are created by the human.
- **Planning:** in `splectrum/roadmap-2` (the roadmap and the scheduled
  work), the direction in `base-docs-vision`; roadmap-1 transferred
  (2026-11-20), nothing reported back to it.
- In a Claude Code cloud session, execution runs on `execute/main`, merged
  into `main` with a plain merge, both pushed. No commit while a build
  runs over the tree.
