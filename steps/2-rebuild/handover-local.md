# For the local agent: what a run is, and releases

For the local agent (a Linux x86-64 machine with git, curl and tar; no
Node.js needed). The task itself is the prompt in `local-note.md` ("The
next run"); this is its background. Nothing is signed and there is no
executable: the boot is its bundle, run with Bare; the `haicc` command
is an app run with Bare (`haiccing/base-app-haicc`), the sh scripts
(`haiccing/base-linux-haicc`, installed by `haicc-install.sh`) its
first step only.

## What a run is

```sh
tools/bare tools/release.js                  # the sources, built into sources/
sh haiccing/base-linux-haicc/test/run.sh     # the whole flow, in a temporary folder
```

and, for the human, in their own home:

```sh
sh haiccing/base-linux-haicc/haicc-install.sh
haicc sources link <clone>/sources
haicc prereq
haicc boot/deploy
haicc . boot/deploy host haiccing/base-component-haicc
haicc host service/initialise
haicc host service/start
haicc . crud/create swarms/swarm-1
haicc . crud/read swarms
```

- `haicc`'s own folder is `~/.haicc`: its scripts, the pins, the sources
  list, Bare (unpacked by `haicc prereq` from the sources) and the work
  folder (`~/.haicc/work`: the boot mrepo, the package store, the
  mrepos).
- Only `haicc sources download` reaches the network; nothing in a run
  above does, once `tools/release.js` has fetched Bare's tarball.
- A runtime is a process that keeps running: the boot mrepo's after
  `haicc boot/deploy`, one more for each mrepo deployed. To stop them all
  and start over: `haicc boot/teardown` (every runtime of the install
  stopped, its containers removed, the mrepos and the package store
  removed; Bare, the sources and the scripts stay), then `haicc
  boot/deploy` again. An install that is there is not migrated: tear it
  down with the old `haicc` first.
- Docker is a prerequisite of the `haicc` test and of the container
  tests: a daemon running, the user allowed to use it (`docker version`
  shows a server). A container left by a run that broke off: `docker ps
  -a --filter label=haicc.folder`, then `docker rm -f <id>`.
- A command prints its response record whole, unpacked across lines;
  `haicc --raw <URI> ...` prints it as stored, one line;
  `haicc --output <URI> ...` the output alone.
- **A URI is relative**: no leading slash; `.` is the local root, `host`
  the position `host`; a leading slash is refused.
- **Each package carries its test report** (`test-reports/`), written by
  the cloud session's pre-release; `tools/bare tools/release.js
  --strict` says whether each is the one of the bundle just built.

## Products: pushed from the local machine

Decided by the human (2026-11-23: "local will push the product
repositories"). At a milestone, when the prompt asks for it: after the
run's tests passed whole, from the commit tested (`main` still that
commit), `sh tools/products.sh <module>` for each module and `sh
tools/packages.sh -m "<what changed>" <org>/<package>` for each
package, one at a time; a repository that does not exist is listed in
the note, never created (the human creates them). Recorded in the note:
each product's line, and its content checked against its folder.

## Releases: created on the local machine

Decided by the human (2026-11-13). The cloud session cannot create a
GitHub release; it can only push commits. So:

- **Where**: a release on each package's own repository
  (`github.com/<org>/<package>`), not in a repository of sources.
- **An organisation's manifest** (`sources/<org>/manifest.json`): an
  asset of its documentation package's release, `<org>/base-docs-<platform>`;
  haiccing's on `haiccing/base-docs-haicc` (2026-11-19: no longer on
  `base-linux-haicc`; the installer released before it still reads it
  there, so the first release after it carries it on both).
- **What**: what `tools/bare tools/release.js` built for that package,
  from the commit you tested: its bundle and what belongs with it, as
  `sources/` holds it (the manifest entry, its native addons). For
  `base-linux-haicc`: `haicc-install.sh`. Bare is third party: it is not
  ours to release.
- **How**: with `gh`. Do not bring signing back. The local sources keep
  the structure you know.
- **When**: only on the human's word, and only after the tests of the
  prompt passed on that commit.
- **The network is not good enough for many downloads**: prefer few
  files per release over many.
- **Record it** in your note, `local-note.md`, a section at the top: the
  commit, each repository, its tag, its assets with their sizes and
  hashes, the URL each is downloaded from. `haicc sources download`
  fetches what you publish (`base-linux-haicc`'s README, "haicc sources
  download <org>"), so say exactly what you published and how you
  named it.
