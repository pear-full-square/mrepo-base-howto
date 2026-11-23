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
   URI; no boot mrepo yet (a teardown then a repeat, a warning); the backup off and on; a folder linked twice
   listed once; a download of our packages, not published yet.
6. **The boot**: `haicc boot/deploy`: the boot mrepo at the root, its
   runtime started, nothing deployed.
7. **Commands**: the host deployed at the root from
   `base-component-haicc`; the response record printed unpacked across
   lines by default, as stored with `--raw`; a record printed, packed
   again, is the record as stored in the outbox; deployed
   again, a repeat allowed (`again`), from another package refused, an
   error on stderr; its commission done before the deploy answered, in
   service, its info extracted; `service/initialise` again a repeat, its
   hook run again, the state as it is; `service/stop`, its boot protocol behind the closed door, its
   runtime still running, then `service/start`, each passed through to
   it, answering what was done and the state now (`--output`).
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
   **Scripts**: the host's package's placed by its deploy in
   `<work>/scripts/`, listed by `haicc scripts` with the user's, run by
   name (`haicc/file`). **The registry**: `mrepos/`, the host there by
   its unique URI; its link's record in the boot mrepo; consulted with
   `haicc/mrepos`, each mrepo where it is from the mrepo asked. A teardown again:
   a repeat allowed.
   **Info**: the pages by keywords, split on package: the top, its
   organisations, a package's pages in its context, its name in front; a
   short keyword, the mrepo's own package's, else a choice of the
   packages that have it, each kept apart. **The docs mrepo**: every
   package in the install's store documented; its build removed at
   `shutdown`, built again at `initialise`, a repeat adding what is
   new.
10. **Torn down**: the node; the service stopped, its boot protocol
    deactivated; shut down; the host.
11. **The boot again**: there already, kept.
12. **The machine level torn down**: `haicc boot/teardown` with a host
    deployed: both runtimes stopped, the mrepos and the package store
    removed, the packages' scripts too; Bare, the sources list and the
    scripts kept (the bin's, and the user's in `<work>/scripts/`); a
    second time, a repeat, a warning, exit 0; `haicc boot/deploy` brings
    it back.

## A swarm

`sh test/swarm.sh` (`--keep` as above) tries a swarm on one host, end to
end, in a temporary folder removed after: a host in service; a swarm
made with a lease of three seconds, its master and its lookup db; two
nodes deployed into it, each registered by the host; who is registered
and active asked of the host, the master and each node; a node
resolved; a node gone quiet once its service stopped and its lease ran
out, seen at the master and at the other node, active again when
started; each node's log synced to the master, one asked to and one
lazily, read there in one view and by node; a command dispatched from
one node to another by its unique URI, its path in the request's log,
the master not on it; what is refused; a node
taken out; the log viewer installed on Splectral, its page asked over
HTTP, every node's records and one node's; nothing left running. What
a lease or a node's next turn brings about is asked again until it is
there, for some seconds. Each step timed.

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
   deployed, in service by its commission.
4. **Commands**: a script's lines at the host; `info/get`; the service
   stopped.
5. **The teardown**: both runtimes stopped, none left in the container;
   the work folder emptied but for the install's scripts; Bare kept.

## Splectral

`sh test/splectral.sh` (`--keep` as above) tries Splectral, an app platform, with a
component, end to end, in a temporary folder removed after: the docs
mrepo and Splectral deployed; the help viewer installed in two halves
(`boot/deploy help haiccing/base-package-service`, then `splectral/install
help splectral/base-component-help-viewer`), its hooks laid by the mrepo
itself, its package not in the mrepo's own; installed again, a repeat
allowed; what `install` refuses;
its pages asked over HTTP before and after its service started (a page
by its keywords, another mrepo, a keyword not there), its data requests
in the install's record; stopped, torn down, nothing left running. Then
the workbench on a fresh install, one command (`haicc . boot/deploy
workbench haiccing/base-solution-workbench`): its commission done, its
components below it (`workbench/docs`, `workbench/splectral`) in the
install's registry, `mrepos/`, linked in the workbench only, in service, Splectral's site and the docs answering, the
workbench's `howtos` namespace; the registry consulted (`haicc/mrepos`),
the docs mrepo where it is; the workbench's help view, its help viewer
installed by its commission, reading the docs mrepo by its unique URI;
a second on the same install refused,
its commission failed at its first component, nothing of it left; the
workbench torn down, its decommission taking its components with it;
nothing left. Each step timed, the pages too. It needs the
splectral packages' and the workbench's bundles in the sources.
