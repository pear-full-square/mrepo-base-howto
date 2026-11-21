# tools/

The development side's tools, by what they are for. Each says in its own header what it does and how it is run.

How they are kept (to become packages): `base-docs-hdlc`, "Tooling".

## Setting up

| tool | does |
|---|---|
| `install.sh` | the dependencies replayed from the lockfile, without npm |
| `ensure-bare.sh` | Bare's runtime put in place from its pinned tarball |
| `bare` | Bare, as this repository runs it: the development tools run on `linux-x64` |
| `docker.sh` | Docker's daemon made sure to answer, started where a cloud session has none running |

## A package: built, tested, brought to the template

| tool | does |
|---|---|
| `package-assemble.js` | a package's `modules/` written: our modules copied, the third-party code they use |
| `package-bundle.js` | a package written as a bundle into the sources, its entry in the manifest |
| `package-test.js` | a package's pre-release: built, its `full` set run unless its report is current, the report written and bundled |
| `package-template.sh` | a package (`<org>/<package>`) brought to its organisation's package template: the generic tests' folders, `test-reports/`, the pin |

## All packages

| tool | does |
|---|---|
| `release.js` | every package assembled and bundled into the sources, Bare's tarball for each platform, its pins, the `haicc` installer; each package's test report stated |
| `code-check.js` | the code rules over the carried modules; each package against the package structure |
| `info-extract.js` | each component's info extracted from the bundles, with its problems; the README rules on the source READMEs (`--files`) |
| `info-view.js` | the info of each package and each component's mrepo, as a runtime extracts it, in one page to browse by keywords (`sources/info-view.html`; its template `lib/info-view.html`) |

## Measuring

| tool | does |
|---|---|
| `commit-bench.js` | the commits measured on this machine: writers at once (threads, processes), a folder's width, a long history, the Corestore, native git, a request's cycle |

## The product repositories

| tool | does |
|---|---|
| `products.sh` | a module's own repository updated from here |
| `packages.sh` | a package's own repository (`<org>/<package>`) updated from here |

## lib/

| file | holds |
|---|---|
| `lib/dispatcher.js` | a package's dispatcher and test runner, written into the package |
| `lib/report.js` | a package's test report: its status against a bundle, the report to read |
| `lib/platforms.js` | the platforms a release is for (`linux-x64`, `linux-arm64`): one list; every bundle carries each one's native addons, the sources each one's Bare |
| `lib/orgs.js` | the organisations: one list every tool reads, each its template and the organisations its packages may depend on; a list checked against its organisation |
| `lib/commit-bench-worker.js` | a writer of `commit-bench.js`, run as a thread or as a process |
