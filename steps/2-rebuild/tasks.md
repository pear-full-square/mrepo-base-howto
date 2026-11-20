# Tasks: the open scheduled work

This file holds only the scheduled work still open: not built, or built
in part (the open remainder), proposed and waiting for the human, or to
settle. What is built is documented in the packages; the history (what
was said, decided, built, found) is git's: `git log -p
steps/2-rebuild/tasks.md`. An entry leaves this file when it is built.

How to read an entry: `base-docs-hdlc`, "Work". The direction for what is
not scheduled: `base-docs-vision`. Designs in discussion, files of their
own: `xpath.md`, `splectral.md`, `distributed-applications.md`. An item
marked "to check" may be done or overtaken: check it against the
packages before building, and drop it if so.

Validation, the commit, the merge and the product repositories: as
`CLAUDE.md` and `handover-next.md` say, for every task.

## Priorities (the human, 2026-11-15)

The human: "I think we have a clear list of priorities: use mycelium,
achieve p2p swarm, improve self-containment (help, dev pipeline) to
achieve efficient AI autonomy."

What is still open of the list, in the human's words and order:

| | label | the human | where it stands |
|---|---|---|---|
| P2, P3 | `node-mrepos`, `swarm-demos` | "Then creating node mrepos, how to create the container version." "Then we can do simple demos with a p2p swarm." | done for this phase; the nodes finding each other is the next phase (`swarm-cluster`) |
| P4 | `install-tests-review` | "We need to do a review of the package repos for 'full install tests'." | the lists made by the review; built later (`install-tests`) |
| P6 | `help-and-howtos` | "We need proper howtos, we need a proper help protocol." | the static side built (`info`); the rest is `help-mvp`, step 3 |
| P7 | `claude-headless` | "I want to use claude headless ASAP using the tailored help and howtos." | not discussed (`base-docs-vision`, "Agents") |
| P8 | `dev-on-haicc` | "Then we need to 'haicc' the development process." | not discussed |

**The milestone** (the human): "ready to start using headless claude (AI
autonomy) and tackling the D&I process using haicc": `claude-headless`,
then `dev-on-haicc`. D&I: "design and development, which will then
become HDLC afterwards (haicc (software) development lifecycle)".

## The plan: three weeks, two tracks (agreed 2026-11-20)

The human: "yes, both tracks in parallel, write it into tasks.md. There
is local and cloud to use." Three weeks (to about 2026-12-11) before the
human is home to set up home-based swarms: "At home I have plenty of
small platforms we can use - raspberry pi with some larger ones. So we
can set up swarms for testing and such with dedicated nodes and run
them during cheap electricity hours (7 hours at night, during the day
with enough battery capacity)." Track A must be ready by then; Track B
runs beside it (`model-shaping.md`).

**Track A: the home swarm**

| week | label | what is done when it is done |
|---|---|---|
| 1 | `base-solution-haicc` | one command installs host, docs and Splectral on a fresh machine, from the releases |
| 1 | `arm64` | the sources for `linux-arm64` too (Bare's runtime, every native addon), the installer choosing by machine: a Raspberry Pi installs and boots |
| 1-2 | `swarm-cluster` | the nodes of a swarm on different machines find each other on a private DHT: the `swarm` protocol, `join`, `leave`, `status`; a node says its peers |
| 2 | `windows-wsl` | haicc installed and tested in WSL on a Windows laptop |
| 2-3 | `night-runs` | a swarm's test runs scheduled on dedicated nodes, in the cheap hours; their reports collected |
| 3 | `home-rehearsal` | the local machine runs a swarm of two machines from the releases, step by step: the how-to followed at home |

**Track B: model shaping, data first**

| week | label | what is done when it is done |
|---|---|---|
| 1 | `runnable-howtos` | every how-to with its script and what each step answers, run in the validation: the benchmark |
| 1 | `haici-feedback` | `--flags feedback ...` on any command, recorded, read back (`help-mvp`'s remainder) |
| 2 | `trace-export` | a tool: an install's requests and their feedback as a set (JSONL) |
| 2-3 | `claude-headless` | `howto/plan` and `howto/explore` with headless Claude in them, run by the local agent: the baseline and the first traces of planning |
| 3 | `model-node` | a package that runs a small open model as a service (an inference runtime) and answers requests; a tiny model in the cloud, 3 to 4 billion on the laptop, measured on the benchmark |

**How it is worked** (ours, agreed with the plan)

- A batch of changes to the shared base modules at a time, validated
  once, in the background, while the next piece is designed: one full
  validation costs about an hour.
- Cloud sessions in parallel only on separate packages (a track each),
  one build on `sources/` at a time, merged into `main` in turn.
- The local machine: a test run after each milestone, a release at the
  end of each week; at home, the swarms' nodes.
- Each item, once agreed, built through to its end and reported; the
  human's allowances: the design-heavy items (the `swarm` protocol, the
  benchmark's runner, the model node) first.

## The tasks by label

| label | what | where it stands |
|---|---|---|
| `first-tests` | every package tests what it provides: the open remainder | below, "First" |
| `deployed-tests` | the tests that deploy floating test mrepos | to settle when the work reaches it |
| `test-reports` | a report checked where the package is deployed | to discuss |
| `coverage` | a generic test of the test coverage | the bar put to the human, not answered |
| `relative-uris` | the prefix on answers; the changeover's last steps | in part |
| `crud` | XPath across links, other layers, `update` | in part |
| `request-train-repairs` | the later request run again; objects collected; `p2p-git` | in part |
| `logging` | what is not logged; a log's size | in part |
| `xpath-phase-2` | the union and the fan-out over shortcuts | in discussion, `xpath.md` |
| `inbox-watcher` | the folder that only grows | to check |
| `mrepo-registry` | the rest, for the next design round | in part |
| `swarm-cluster` | the nodes finding each other, the `swarm` protocol | plan, Track A, weeks 1-2 |
| `splectral` | Splectral beyond the proof of concept | `splectral.md`, "Open" |
| `dev-env-poc` | a proof-of-concept development environment, from this repository's structure and tools | design discussion first, with the human |
| `platform-orgs` | three platforms on haicc, each its own packages organisation: the code and the sourcing | built; the manifests' releases, each platform's template, dependencies checked |
| `help-mvp` | the flag unit, `help/annotate`, `haici/feedback`, `explore` and `plan` scoped | step 3 in part: the flag unit and `help/annotate` built; `haici/feedback`, `explore` and `plan` open |
| `external-request-api` | what the outside may ask | to discuss |
| `error-on-empty` | a flag: an empty selection fails the request | set aside by the human |
| `base-solution-haicc` | a solution: the mrepos of an install as a script | plan, Track A, week 1 |
| `install-tests` | each package's tests and examples as transient installs | to build, later |
| `runnable-howtos` | every how-to runnable, run in the validation | settled (`base-docs-hdlc`, "Working demos"); plan, Track B, week 1 |
| `review-code` | the code changes the review found, still open | in part |
| `composite-actions` | an action resuming after a child request; a time limit | not designed |
| `release-signing` | bundles signed, the manifest checked against a key | deferred |
| `terminal-mrepo` | the terminal as a mini mrepo | not designed |
| `dispatcher` | the dispatcher application | to check |
| `headers` | a request's headers | to plan with the human |
| `type-actions` | populating `main` and `initialise`: a type's own actions | to check |
| `request-history` | a request's own history in its document | when wanted |
| `modules-tool` | a mini tool for the modules kept here | done by hand until then |
| `runtime-status` | the runtime's status beyond "not yet operational" | to check |
| `housekeeping` | the human's to do: repositories, a branch, the seed | to check |
| `private-vision` | `base-docs-vision` private: out of the public manifest and releases, in our own installs' sources only (the human, 2026-11-20) | to build, not urgent |
| `arm64` | the sources for `linux-arm64` too: a Raspberry Pi a node | plan, Track A, week 1 |
| `windows-wsl` | haicc in WSL on a Windows laptop | plan, Track A, week 2 |
| `night-runs` | a swarm's test runs scheduled in the cheap hours | plan, Track A, weeks 2-3 |
| `home-rehearsal` | a swarm of two machines from the releases, step by step | plan, Track A, week 3 |
| `haici-feedback` | the feedback flag, `haici/feedback` | plan, Track B, week 1 |
| `trace-export` | an install's requests and feedback as a set | plan, Track B, week 2 |
| `model-node` | a small open model as a service in an mrepo | plan, Track B, week 3 |

## `first-tests`: every package tests what it provides

**Settled** (the human)

- **Tests that fail when something is forgotten**: "when everything is
  checked by default, one can be relaxed about it".
- **Pinned, upgraded explicitly** (the model; not built): each package
  pinned to a commit of the template, upgraded as an explicit step,
  never set off by a change of the template. **For now the blanket
  approach**, our coverage being insufficient; the modules a package
  carries too ("blanket for now").

**Open**

- **Cloning the template is the aim** (the human, 2026-11-14): the
  template itself is cloned, and carries the help to customise it: a
  clone a clean, working package whose READMEs say how to make it one's
  own. To check: since 2026-11-17 a new package is a clone of the best
  candidate (`base-docs-package`, the how-to `package`).
- **Tests in a running mrepo** (proposed, not answered): at the end of a
  protocol's test, the `done` history compared with its config, an
  action never requested or a hook never run failing it; one helper that
  makes a test mrepo from a list of packages and test data, starts it,
  sends requests, compares, stops it (`base-package-runtime`'s `start`
  the model). What each package's covers: `install-tests`.
- The READMEs that say "tested by the boot package" corrected as each
  package gets its test (to check).

## `deployed-tests`: the tests that deploy floating test mrepos

**Settled** (the human): a package's deployed test is its how-to
(`base-docs-hdlc`, "Working demos"); the test is the deployable thing,
its folder an `mrepo/` with the test data and the configs under test and
a list naming the packages it needs; deployed the real way, through a
boot mrepo with the boot protocol; not constrained: types of deployed
test keep being added. With `install-tests` and `runnable-howtos`.

**To settle** (when the work reaches it)

- What a test deploys as its target: a unit inside a package
  (`<org>/<package>/test/<name>`), where `boot/deploy` takes a package.
- Which boot mrepo: one the machine has, or a temporary one (the
  pre-release).
- How the test talks to it: commands as someone would type them.
- "Nothing forgotten", from the `done` history: every action requested,
  every hook run.
- Where the shared helper lives; cleanup; what runs in `validate` and
  what in `full`; more than one mrepo, later swarms.

## `test-reports`: a report checked where the package is deployed

**Open**, to discuss: a check in situ, that the bundle a running mrepo
holds carries a current, passing report. Not built.

## `coverage`: a generic test of the test coverage

The human, 2026-11-14: wanted, on the modules and on the haiccing
packages as well; the implementation looked at later.

- The tool is here: `brittle --coverage` (`bare-cov`): statements,
  branches, functions and lines a file, as text and as JSON. Code run in
  a separate process (the runtime a test starts) is not measured:
  following child processes is part of the work.

**Open** (put to the human, not answered)

- The bar: every function called by a test as the hard rule, lines and
  branches reported with the uncovered lines listed; or every line run.
  Ours: the first to start, tightened to the second once green.
- What coverage means for a haiccing package: its own tests against the
  code it carries and its own entry points.

## `relative-uris`: the open remainder

What is built: `base-docs-uri`. Open:

- **The prefix on what an answer returns** (to come with the `haicc`
  commands that need it; the human: "Multi segment will become clear
  with haicc commands"). Settled (the human): URIs are rewritten on
  exit by a prefix, not by rewriting the data; the prefix may be an
  array, the rewrites being fixed chunks; jumps are made with the
  `haicc` command, which creates the prefix, each jump putting its own
  chunk in front (`["host", "node-1"]` back in the boot mrepo); the
  internal layer prefix in front of the jumps inside an mrepo
  (`["main", "host", "node-1"]`); the prefix in the request's data
  structure, not in a header. Ours: its exact shape in the form, and
  how a tool shows it to a sender outside.
- **The changeover, its last steps**: `mycelium-uri`'s `validate` and
  the repository's own reads still slash-led; modules change over as
  they are touched; when none uses the old form, the validator refuses
  it. An action at a moved root reaching the mrepo's own state (the
  service state in `runtime`) through the runtime's view: to settle
  (to check).

## `crud`: the open remainder

- **XPath across linked mrepos**: `base-docs-vision`, "Queries across
  links"; the design in `xpath.md`.
- **Internal use on other layers**: the files there
  (`runtime/service.json`) are not nodes; they move to the node form
  when an internal use comes.
- **`update`**: with mutable and immutable implemented (an update on the
  mutable side from a stream of immutable change events).

## `request-train-repairs`: the open remainder

- **The later request run again**: a squash onto a target that moved
  merges, and a conflict throws. With one request at a time it does not
  occur; the rerun comes with requests executed in parallel (`xpath.md`,
  "Parallel execution: threads").
- **The objects a removed branch leaves**: a collection for the
  filesystem layers (`xpath.md`, "Commits").
- **`p2p-git`'s own two defects on refs**, for a process reading a
  repository another writes (`mycelium-git`'s `listBranches` tolerates
  both): a ref written in place, for an instant unreadable (to be written
  aside and renamed); its listing of branches returning nothing when a
  branch is removed during its walk (`readdirDeep` failing on the
  vanished file: to skip it).

## `logging`: the open remainder

- **The runtime's part after a request is completed** (its record
  merged, moved to done): not logged.
- **A log's size**: not bounded.
- `error-on-empty`, the second flag: below.

## `xpath-phase-2`: the union and the fan-out over shortcuts

What is built: `base-docs-xpath`. Next, in discussion (`xpath.md`,
"Standard XPath, in phases"): the union and the fan-out over several
shortcuts, which lifts the usage restriction (a query going on from
several shortcuts, or from shortcuts beside ordinary nodes, says so and
stops); descendants; the further phases of the list. Found: about 1 ms a
node read; beyond some hundreds of nodes, a cache of reads by id and
reads in parallel before a query over several requests. Results as
attachments of a request: the human's direction, not designed.

## `inbox-watcher`: the folder that only grows

To check. What was taken in moved out of the folder, or folders by date
(`xpath.md`: how many to a folder).

## `mrepo-registry`: the rest, for the next design round

What is built: the `links` layer, an mrepo's own, and the mrepo
registry, the boot mrepo's (`base-package-boot`, `base-component-boot`).
KISS until then (the human: "We just need enough functionality to
achieve that and will do a further design round with the next step").

- Who may deploy; a shortcut to an mrepo that was not deployed here
  (linked).
- **The visible state in `main`, the reverse index** (the human): "for
  shortcuts main keeps in-situ shortcut info, with 'visible' state.
  Registry can 'reverse index', structure the repositories in a
  structure geared towards admin and xpath queries for instance, and
  contains full information (including internal management stuff)." "The
  shortcut info can contain information that it was deployed or just
  linked etc."

## `swarm-cluster`: the nodes finding each other, the next phase

Closed for this phase (the human, 2026-11-16: "If we can show a cluster
with nodes, and a splectrum showing some information then that is good
enough for me"). A node in a container is now a pair (`base-docs-haicc`,
"pair"); what the pair deploy does not do yet: `mrepo-base-boot`,
`internal/pair/`, "Not yet".

**For the next phase.** Our five questions, each with what we
recommended, not answered:

1. What "found each other" means first: every node holds an open
   connection to every other node of its swarm, a node can say who its
   peers are, the cluster script ends by checking it; no data
   replicated yet.
2. Who is on the network: the container's side only (then the replica;
   since the pair, the node in its container), the host's side local.
3. Discovery: a private DHT a swarm; the swarm's first node its
   bootstrap; nothing on the public DHT.
4. Where the bootstrap's address is kept: in the swarm's own node in the
   host's `main` (`swarms/swarm-1`), written when the first node joins.
5. How it is commanded: a `swarm` protocol (the human: one that "will
   'sit on top' of other protocols like service"), `join`, `leave`,
   `status`, requested at the node: its first action makes a node a
   swarm node (its swarm, its role).

It brings `hyperswarm` and `hyperdht` back into the lockfile, the old
`p2p-dht` and `p2p-connect` from their repositories (the earlier code in
git, `42a5a66^`: `p2p-connect`, `p2p-dht`, `p2p-rns`, `p2p-node`), and
two new repositories for the `swarm` protocol.

**Left from this phase**

- **The default continuation** (an mrepo's config naming the script
  that follows an action): "needs a better design". Not built.
- **A node's teardown and its container** (to check, with the pair):
  `boot/teardown` of a node left its container; the machine-level
  teardown clears both.
- **The image's base is pulled** by Docker the first time
  (`debian:bookworm-slim`); `docker load` from the sources was agreed,
  not built.

## `splectral`: Splectral beyond the proof of concept

What is built: `base-docs-package`, the how-tos `platform` and `program`,
and the Splectral family's packages. Open: `splectral.md`, "Open, one at
a time" (the family's documentation package, the repositories, today's
page as a component, info views on every mrepo from the registry,
parameters, writes, live updates).

From before the design session, not taken up there (to check):
scenarios and continuation scripts (a scenario a list of steps: say, do,
await an event; one thing?); the map and the model back (the old core
in git, `42a5a66^`, and in its repositories, `pear-full-square/splectral-*`,
`splectral/base-view-map`); the structure as it is, asked with `haicc`
commands, for what ended without a command; the first demo beyond the
log.

## `dev-env-poc`: a proof-of-concept development environment

**Asked** (the human, 2026-11-18): "POC development environment using
main structure or similar from this repo and the tools from this repo.
Needs design discussion first." In the same group as `splectral`, next
for the team to discuss. Not designed, not built.

**Where** (a start, checked again): this repository's structure
(`haiccing/`, `splectral/`, `pear-full-square/`, `tools/`, `steps/`;
`CLAUDE.md`, "What is here") and its tools (`tools/`, `base-docs-hdlc`,
"Tooling"); the priority it may serve, `dev-on-haicc` (P8).

## `platform-orgs`: three platforms, each its own organisation

Built 2026-11-19 (the human: "Yes, go ahead with the five changes. We
need fully qualified packages, that does user packages later"; on our
reading of references: "Yes, just itself for top level inclusions wider
for dependencies"). What it is: `base-docs-haicc`, "Platforms";
`tools/lib/orgs.js`. Open, the remainder:

- **The manifests' releases**: haiccing's on `haiccing/base-docs-haicc`
  from the next release (and on `base-linux-haicc` too, for the
  installer released before it); splectral's on
  `splectral/base-docs-splectral`, a repository the human creates
  (`splectral.md`, step 2). The local agent's (`handover-local.md`).
- **Each platform's own template**: `tools/lib/orgs.js` names
  `haiccing/base-docs-package` for all three until a platform's
  documentation package holds a template of its own.
- **Dependencies checked**: a package's dependencies on another
  organisation are written in the manifest (`depends`), not yet checked
  where a package is deployed (the dual install's first half is
  haiccing's by its command).

## `help-mvp`: the flag unit, the help and feedback flags, `haici`

Step 3 of the human's order, after `info` and the package review (both
done): the flag unit, `help/annotate` and `haici/feedback`, with
`howto/explore` and `howto/plan` scoped. The direction:
`base-docs-vision`, "Help and haici".

**Built** (2026-11-20, the order agreed with the human: `splectral.md`,
"Open, one at a time", 1): the flag unit (`mrepo-base-request`,
`flags/`: the four flags moved in unchanged, `help` added); strict, a
command its flags keep from running completes not run (`run: false`),
`haicc` exits 1; the `help` flag, a rewrite, last; `help/annotate` in
`haiccing/base-package-help` (`mrepo-base-help`), linked and activated
wherever `info` is. Their repositories, `haiccing/base-package-help` and
`pear-full-square/mrepo-base-help`, exist already (the old help package
and module, last pushed 2026-11-17): a push replaces them. Decided while
building (ours): the strict check is at the door (`admit`), so a command
not run never reaches its action; a rewrite whose protocol is here but
not active meets the door's own error as it executes (`not now`), not a
not-run answer; `help/annotate`'s `run` and `more` are written where it
answers (`crud/read swarms` at the host), the position typed being the
terminal's (the viewer's command box puts it in front). Still open
below: `haici/feedback`, `explore` and `plan`.

**Settled** (the human)

- A flag is a folder of its own, everything it needs inside, so flags
  are added independently; every flag's folder in the module that
  processes flags, `mrepo-base-request` ("Request is always there").
- The help flag and the feedback flag are rewrites: the command they are
  attached to is not executed; the help flag triggers the `help`
  protocol, the feedback flag a feedback command. Feedback "can be
  supplied on anything that exists as command".
- The feedback flag is the last flag on the last command part; all text
  after it is the feedback text. Its command runs where the command
  would have run.
- `haici`, a protocol of its own (human ai continuous improvement),
  starts from the request log; KISS: "don't do too much up front".
- "wrong flag or issues with underlying functionality don't throw
  errors but warnings."
- "instead of help/command, help/annotate as it explains with help
  information; howto/run --> howto/explore and howto/plan. However these
  methods are not mvp, we may scope them and put headless claude in as
  placeholder implementation." `help` keeps `annotate`, `howto` keeps
  `explore` and `plan`; their static side is `info`'s.

**Left to us, decided**

- **Strict, with warnings**: a flag that is not one, a value its flag
  does not take, a tail flag that is not last, a rewrite on a part that
  is not the last, a rewrite whose protocol is not here or not active:
  nothing of the command is executed. The request completes, not
  failed; its answer says it was not run and why, its warnings in its
  log. The `haicc` command exits 1 for a command not run, so a
  continuation stops there.
- **The answer's form, for help and haici** (as hc, their main user):
  natural language, short; the commands to go on with written exactly
  as typed; what is acted on (a warning, an error, the request's id) in
  a fixed place; the record as it is with `--raw`.
- **The flag unit** (`mrepo-base-request`): `flags/<name>/`, each with
  `index.js` (its declaration: `kind`, `scope`, `values` (a list, a
  pattern, or none), `tail`; for a rewrite its `rewrite(form, value)`)
  and `README.md` (extracted, checked as a method is); `flags/index.js`
  lists the folders, the module's test failing for one not listed;
  `lib/flags.js` keeps the parsing and names no flag. Kinds: `modifier`,
  `option`, `rewrite` (before the door: the door checks the rewritten
  command). Scopes: `chain`, `step`, `last`. The flags there are moved
  in, unchanged: `log`, `layer`, `continuation`, `container`.
- **`help`, a rewrite, last, no value**: `haicc host crud/read swarms
  --flags help` becomes `help/annotate` at the same URI, its arguments
  the command's; also asked directly. It answers the command as
  understood, what it does (from the info layer), the door's answer here
  and now, the arguments given against those the action names, the
  command to run it, and `info/get` for more. Nothing executed.
- **`feedback`, a rewrite, last, tail**: becomes `haici/feedback` at the
  same URI, its arguments the text, then the command's; it keeps
  nothing but its own request's record (the request log is the store)
  and answers with its request's id; read back with `layer=request`.
- **`haici`**: `base-package-haici` and `mrepo-base-haici` (one action,
  `feedback`; its own test, `mounted`), in both components, activated by
  a `boot` hook. The repositories exist (2026-11-16, to check).
- **`howto/explore`** (what can be done from here, asked in words) and
  **`howto/plan`** (a goal: the steps, a continuation script): scoped
  only, each documented as an action, its README the contract, headless
  Claude the placeholder.
- **Tests**: the flag unit's own (each kind and scope, the tail, the
  strict cases, a folder not listed); `help/annotate` and
  `haici/feedback` in their packages' `mounted` tests; the `haicc` test:
  `--flags help` answered and not run, `--flags feedback ...` recorded
  and read back, an unknown flag not run (exit 1), through a chain.

**Open**

- Where `howto/explore` and `howto/plan` live, now that the `howto`
  package is gone. `help/annotate`: in `haiccing/base-package-help`, a
  package of its own (ours; the human, 2026-11-20: "Please go ahead with
  your proposed order"), its repository there already; linked
  wherever `info` is.
- For `explore` and `plan`: the call to headless Claude built now, or
  scoped only (ours: scoped only; the call, the runtime starting `claude
  -p` with `haicc` its only tool, a piece of its own).
- From the earlier command help design: the external API structured (a
  view of the protocols and actions offered, joining a package's config
  with each action's page); URI dismantling (what a local URI points to:
  its layer, a folder or a package, a mapping out).

**Not in it** (later): guided runs; `haicc howto boot` at the machine
level; an action not in code calling hc with a prompt; `haici`'s
sections from the request log; the help of a position; flags on the
machine level's commands; findings rooted in their packages and fed to
the HDLC.

## `external-request-api`: what the outside may ask, designed, not hard-coded

The human, 2026-11-15: "we will need to design an 'external request
(allowed protocol & actions) API. I want it done properly, not with
hard-coded rules." To discuss; not placed in the order of work.

Today: a request from outside is checked in `mrepo-base-request`
(`check`): its protocol loaded and active, its action in the protocol's
config, its URI one the action's config names, the service's state
where the action names states; and the default layer `main`.

## `error-on-empty`: an empty selection fails the request

Set aside by the human ("of no importance at the moment").

**Settled** (the human): a flag for the XPath; with it, a selection that
matches nothing fails the request. Needed for a subset of commands only;
added to a request by the user, or set for specific protocols (like
`service`). A local matter: how a package is made, and what type of
mrepo it is for; the configs well documented. Its place: a flag folder
in `mrepo-base-request` (`help-mvp`).

## `base-solution-haicc`: a solution, the mrepos of an install as a script

The human (2026-11-17): "Afterwards we need to start creating the
base-solution-haicc package that kicks in with a haicc boot installing
host, docs and splectral." Not built.

**Settled** (the human, 2026-11-17)

- A solution, a new kind beside package and component: the mrepos an
  install is made of (the host, the docs mrepo, Splectral), deployed and
  started by a script; `haicc boot/deploy` with it a whole install. How
  the boot names it: to settle then.
- Base runs on one boot component, in three versions (host, node,
  container node); a component carries a script library, its custom
  versions of functionality. Base operations are protocols, custom
  versions scripts; scripts will be able to replace protocols. Not on
  `boot/deploy`: `service/initialise`, say, run differently for each
  type.
- Parked for the solution: `swarms/` and the cluster; the registry's
  logic and the cascade (a child's children torn down with it) in the
  component's script library.

**Open with it**

- **`base-linux-haicc` documented**: it has no bundle; a
  documentation-only form of it with the solution, the solution's list
  naming what the docs mrepo documents in place of `documents: sources`.
- **Scripts**: positional arguments (`$1`...) in a script (the human:
  "yes, record it and build it after the validation"; to check); a
  package's scripts installed into `<home>/scripts/<org>/<package>/`.
- **Requests tagged by trigger**, internal or external, the access
  restrictions lifted for base; the different routes (an internal inbox)
  later. To check.
- **A cheaper request**: a request costs about 1 s, every command alike
  (the inbox, pending, execute, done, the outbox, each a commit): fewer
  commits a request. Moved back (the human: "probably won't be done
  within this base iteration of packages, or maybe near the end").
- **The how-tos of two patterns** (ours, put to the human; to check): a
  module's config moved into its package, a package brought to the new
  form.

## `install-tests`: each package's tests and examples as transient installs

The human (2026-11-17): "make a list of missing tests and examples -
both transient installs - that should be added (later)". A transient
install: deployed, exercised, torn down, nothing left. One piece of work
with `runnable-howtos`. The lists, from the package review:

- **boot**: deploy for real (the runtime answering, the shortcut, the
  `links` record, the registry's node); teardown (all of it gone);
  redeploy (from its package, and another); a swarm's node; teardown by
  a registry query; a child with a child inside. Examples: a host and a
  node, deployed, read through both, torn down; a swarm of two nodes;
  the registry listed, queried, torn down by a query.
- **crud**: the protocol in a running mrepo, through the inbox; a
  selection removed by a filter. Example: a swarm's structure built,
  queried, removed.
- **info, protocol, service, haicc**: each in a running mrepo through the
  inbox; `goto` at a query's positions; `service` in each state refusing
  the others. Examples: a host's lifecycle, a chain of hops.
- **runtime, container, splectral**: `runtime/run` from the command
  line; `container` without Docker and `status` `gone`; `splectral` on a
  taken port, started again. Examples: a node in its container,
  Splectral watching a cluster deployed.
- **The components**: the cluster taken down; the docs mrepo from a
  github source. Examples: a host with one node step by step, the
  cluster.
- **The `haicc` command**: `haicc output <width>` kept across commands;
  `sources download bare haiccing` in one command; `--home` and `--bin`
  elsewhere. Example: an install from the releases.

## `runnable-howtos`: every how-to runnable, run in the validation

Settled with the human, not built: `base-docs-hdlc`, "Working demos".
With `install-tests`, after the proof of concept's fixes
(`distributed-applications.md`, "What comes of it"); the how-tos written
from now on with a script beside them, even before the validation runs
them.

**Ours, to settle while building**

- `info/get <keywords> howto <name>` answers with the page and its
  script: what the AI reads it can run.
- The end to end tests named from the how-tos they prove (`splectral.sh`
  from `splectral-component` and `platform`), until each is split into
  how-tos of its own.
- A scene kept still until it is opened (its runtimes started on use);
  prepared again when its sources change; thrown away and prepared again
  after it is worked in.
- The report producer: a first case of a `myctrans` pipeline.

## `review-code`: the code changes the review found, still open

- **A runtime that stops taking its inbox in** (found 2026-11-17, a
  node's replica in the `haicc` test): its process alive and idle, two
  requests left in its inbox folder, its pass loop no longer
  rescheduled (most likely a pass awaiting something that never ended).
  The runtime now says a pass that stalls (`runtime-stall.json`); one
  hang in nine runs since. The cause to find.
- **From the docs review by an AI agent** (2026-11-18; the review in
  git, `steps/2-rebuild/docs-review-local.md`): 10, a continuation's
  `--output` printing two documents and a page as JSON (a printing mode,
  to design). Done since: 9, the `package mrepo` entry twice (gone with
  the documentation's offload); 5, settled (the human, 2026-11-19:
  "Packages are self contained, and certainly not mention dev repo").

## `composite-actions`: an action resuming after a child request

Not designed: an action resuming at a label after a child request;
fan-out; a time limit for a child that never answers; dispatch to
another node. The pipeline engine may take the composite actions' place
(`base-docs-vision`, "Pipelines", proposed).

## `release-signing`: bundles signed

Deferred: bundles signed and the manifest checked against the
publisher's key (the key tool was removed with the clean-up: to be
rebuilt with it). Nothing is signed today; we are not set up for it.

## `terminal-mrepo`: the terminal as a mini mrepo

Not designed: the terminal as a mini mrepo, its boxes, its requests
done.

## `dispatcher`: the dispatcher application

To check (Splectral's server and the distributed applications may have
taken its place): like haicc, its own API; requests to it processed,
others routed; stray records returned to it as misdelivered; local
subscriptions file operations, remote ones other nodes, followed or
announced.

## `headers`: a request's headers

To plan with the human: the execution's metadata, the states a request
ran on, are in the commits only meanwhile. Today the headers stay empty.

## `type-actions`: populating `main` and `initialise`

To check (a component's scripts may cover it): a type's own actions, its
package's functions run as configured, documented in the same shape as
an action.

## `request-history`: a request's own history in its document

When wanted: a request's history, step by step, in its document.

## `modules-tool`: a mini tool for the modules kept here

No npm run: a module added or removed written into `package.json`
(workspaces), `package-lock.json` (its workspace entry, its link entry)
and `node_modules/` (its link); the third-party code nothing uses any
more pruned from the three (worked out with the closure, as the
assembler does). Done by hand until then (`CLAUDE.md`, "Working here").

## `runtime-status`: the runtime's status beyond "not yet operational"

To check: left open when the service was built; whether the runtime says
more of its status than "not yet operational" today.

## `housekeeping`: the human's to do

To check, each the human's:

- `pear-full-square/mrepo-base-log` (created empty): dropped, to be
  archived.
- The branch `claude/vigilant-gates-b1r8rn` on the remote holds nothing
  that is not in `main`: to delete.
- The seed `dev-env-3-mrepo-native` (on `splectrum/roadmap-1`): its
  repository, `splectrum/dev-env-3-mrepo-native`, to be created; whether
  to update the seed to say its storage setting and boxes as layers are
  built here (one commit to `roadmap-1`).

## `housekeeping-branches`

- The branch `execute/solution` (a worktree's, for parallel work in a
  session) is stale: its work merged; delete it with the human's go.
