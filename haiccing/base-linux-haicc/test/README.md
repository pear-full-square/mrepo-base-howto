# test/

The haicc command tested end to end as it is installed, from the installer to a started host and its teardown.

`sh test/run.sh` works in a temporary folder, removed after, and leaves
nothing running. It needs a sources folder with the packages' bundles and
Bare's tarball: `SOURCES`, else `../../sources`, beside the packages;
without one it is skipped. `--keep` leaves the folder and its runtimes to
inspect. One line a check, the count last; exit 0 passed, 1 failed.

## Steps

1. **The installer**: the one `build.sh` writes; installed with `--home`
   and `--bin`; the command registered.
2. **Before Bare**: the usage says the first step's commands and points
   to the rest.
3. **Nothing there yet**: https the only source, by default; the
   prerequisites say what is missing; `haicc boot/deploy` and the app's
   other commands stop, pointing to `haicc prereq`, and write nothing.
4. **The sources**: a folder linked, listed before https; a folder that
   is not there.
5. **The prerequisites**: a check changes nothing; `haicc prereq` unpacks
   the pinned Bare from the sources and records its hash; there next time.
   Bare chosen by machine: every pinned platform's in the sources; an
   `aarch64` machine (`uname` answering as one would) chooses
   `linux-arm64`'s, a platform not pinned is said.
   From here the command is the app: its usage whole; no such command; a
   URI with no command after it; `haicc boot` alone; `--output` without a
   URI; no boot mrepo yet; the backup off and on; a folder linked twice
   listed once; a download of our packages, not published yet.
6. **The boot**: `haicc boot/deploy`: the boot mrepo at the root, its
   runtime started, nothing deployed.
7. **Commands**: the host deployed at the root from
   `base-component-haicc`; the response record printed unpacked across
   lines by default, as stored with `--raw`; a record printed, packed
   again, is the record as stored in the outbox; deployed
   again, an error on stderr; its boot protocol behind the service's door,
   not active; its info not extracted yet;
   `service/initialise` and `service/start` passed through to it, each
   answering what was done and the state now (`--output`).
8. **What is missing is said**: a target, a package, a command; a
   protocol or an action that is not there, with those that are.
9. **A node inside the host**, deployed by a command passed through;
   commands chained through both shortcuts; a URI running through a
   shortcut; an argument with spaces and quotes; the output alone.
   **Flags**: `--flags help` answered where the command would run,
   nothing of it executed, through a chain too, by default in natural
   language; `--flags feedback <text>` recorded where the command would
   run, nothing of it executed, answered with its request's id and read
   back from the request layer, asked directly too; a flag that is none,
   help not on the last command, feedback with no text or where `haici`
   is not: not run, exit 1, said why.
10. **Torn down**: the node; the service stopped, its boot protocol
    deactivated; shut down; the host.
11. **The boot again**: there already, kept.
12. **The machine level torn down**: `haicc boot/teardown` with a host
    deployed: both runtimes stopped, the mrepos and the package store
    removed, Bare, the sources list and the scripts kept; a second time,
    nothing there; `haicc boot/deploy` brings it back.

## In a container

`sh test/container.sh`: the haicc command installed in a container as on
a machine, from the host's sources, the prerequisite of a node run in its
container. A plain `debian:bookworm-slim` container with nothing of haicc
in its image; Docker answering (else skipped), the image there (pulled
once; offline, put there beforehand). The container removed after, its
folder too; `--keep` leaves both.

1. **The container**: haicc's home a folder of the host's; the sources
   mounted read only at the same path as on the host; the host's user;
   `--init`, which reaps a runtime that ended (without it a stopped
   runtime stays a zombie and counts as running).
2. **The install**: the installer, `haicc sources link` with the host's
   sources, `haicc prereq` every line ok.
3. **The boot and a host in service**: `haicc boot/deploy`; the host
   deployed with `--flags continuation=start`.
4. **Commands**: a script's lines at the host; the host by its registry
   reference; `info/get`; the service stopped.
5. **The teardown**: both runtimes stopped, none left in the container;
   the work folder emptied; Bare kept.

## Splectral

`sh test/splectral.sh` (`--keep` as above) tries Splectral, an app platform, with a
component, end to end, in a temporary folder removed after: the docs
mrepo and Splectral deployed; the help viewer installed in two halves
(`boot/deploy help haiccing/base-package-service`, then `splectral/install
help splectral/base-component-help-viewer`), its hooks laid by the mrepo
itself, its package not in the mrepo's own; what `install` refuses;
its pages asked over HTTP before and after its service started (a page
by its keywords, another mrepo, a keyword not there), its data requests
in the install's record; stopped, torn down, nothing left running. Each
step timed, the pages too. It needs the splectral packages' bundles in
the sources.
