# base-docs-hdlc

The haicc delivery lifecycle: how work is done, from a request to running software.

The aim is full AI autonomy, from a need to running software that
satisfies it: KISS, consistent rules and self-containment make it
possible. Work arrives as a request, from a person or from `haici`, is
scheduled, built, validated, released and reported back. An agent does
what it can on its own; structure and design are decided as a team.
The rules here are proposals to be tested: when practice shows one is
wrong, it is raised.

## Links

- [test](test/)
- [test-reports](test-reports/)
- [modules](modules/)

## Principles

From the start of the work (2026-10-26), in engineering terms; each
says where it is built.

- **A request is the unit of change**: work starts as a request and
  grows into its result by execution. What has a history of its own is
  a repository, and its history is the record. Built: an mrepo, its
  requests, its history.
- **Only a request changes a repository**: nothing writes into another
  repository; reading and use go through its API. Built: the inbox, the
  protocols.
- **A state change is visible through a commit**: what changed between
  commits is a transaction in progress, not state. Built: every request
  committed.
- **Outcomes are data, on `main`**: results, notes, designs, decisions;
  the request layers hold the requests and their metadata, nothing
  more. Built: `main`, the external state.
- **Every action is idempotent** (the human, 2026-11-22): an action
  can be repeated; a repeat is allowed and may raise a warning; what it
  does again is the action's own to say (a deploy of what is there does
  nothing; an `initialise` again adds only what is new). A restart, a
  retry, a commission run again are then safe. In part: the boot
  protocol's deploy and teardown, the service's transitions, the
  container's actions.
- **Self-contained units**: a unit carries what it needs to be
  understood, run and verified, its instrumentation and audit included,
  and meets its environment through its interface; done is decided
  mechanically from execution data. Built: sealed packages, their
  reports.
- **A test reads execution data**: execution records; a separate reading
  gives a verdict, a narrative or a diagnosis. In part: the test
  reports.
- **Execution is repeatable exactly**: a run records its invocation,
  every state it ran on by commit, its environment and its
  nondeterministic inputs, enough to run it again; metrics and audit are
  then needed only at the boundary. Not built: the records lack the
  environment and the nondeterministic inputs.
- **Cascading links**: the link from a context down to a process is
  authoritative, the link back up informative. Built: an mrepo's links;
  the install's registry, the work folder's `mrepos/`.
- **Ids, not versions**: a validated instance gets an id; the commit
  that records it is its place in the history, the authoritative record.
  Built: packages pinned by commit, bundles by their content's hash.
- **Private instance data in a repository of its own**: a unit
  describes the private data it needs (its config schema, meaning,
  examples) and holds none; a running instance's config, data and
  secrets live in a private repository its operator owns, secrets
  encrypted in it, never hidden state outside it. Not built
  (`base-docs-vision`, "Private data").

## Autonomy

- **Autonomy first.** Collaboration only where it is required: meaning,
  missing or inaccessible information, an exception that halts the
  work. Collaboration is discussion: discuss first, write what has
  settled.
- **Structure and design are decided as a team**, in discussion, not by
  one member alone; what is left to the agent is its to decide and to
  say. The team is its members, human and AI alike, each a person in
  it: one member's words are input to the discussion, not a decision.
- **Natural language**, short; one question at a time, with an opinion
  and a recommendation.
- **What is settled is recorded in the words used**, with its reason.
- **Always discussed**: anything touching meaning, the philosophy or a
  settled commitment; a change to the principles or the working
  practices; anything irreversible or outward-facing.

## Collaboration

- **A team, on equal terms**: what is settled is ours, not one side's:
  "we", "our terms", "our order of work". Bring an opinion and a
  recommendation, not only questions; a decision is made together, in
  discussion. Who said what is recorded, in the words used.
- **Finish the discussion before building**: a reading of what was said
  is put back in its own words and confirmed before any of it is built.
  Building on an unconfirmed reading, even a mostly right one, costs
  changes after.
- **Point by point, briefly**: one question at a time, short; no walls of
  text. Short answers are read literally: the reading said back in a few
  lines with one example, only what is still open asked.
- **Check before asking**: the code, the documentation, the repositories.
- **Long stretches of planning, then a batch built**: what settles is
  stacked as scheduled work and built when the team agrees, then
  worked through to the end without stopping at each step.
- **Say what is being done** when a step takes long; report after each
  step of a build, plainly, with what passed and what did not.
- **Record what settled**, as the work's record, and keep the entry
  points current: a context reset loses everything else.
- **A new repository asked for**: its description alone, in a block to
  copy; its owner and name in a line. Created with a licence, so its
  `main` has a first commit.
- **Few pushes**: one commit and one push per part, then the product
  repositories.
- **A failed test: whose mistake**: most often a test still in the old
  form; a race shows one run in a few, so a test that touches the
  request layers is run several times.

## Single concern

- **Every part has one concern**: a module, a repository, a process, a
  step. A part that grows a second concern is split by concern.
- **One concern, one place**: implemented once, in a module of its own,
  used by the modules that need it, never copied by hand.
- **Shared in development, copied into packages**: a package carries a
  copy of every module it needs, is tested and sealed, and runs on its
  own copies. Packages share nothing at run time; a package is replaced
  as a whole.
- **Validation at the boundary**: input is validated once, where it
  enters, by the one validator for its kind; inside, the happy path. A
  failure stops the work and says why.
- **Knowledge stays with its concern**: a part knows only what its
  concern needs.
- **What is there is used as it is**: something new is made only where
  nothing does it already; a new platform or application takes the
  platform's protocols and commands as they are and adds only what is
  its own.

## Documentation

- **It follows the implementation**: it says what was built, nothing
  more. What is not built is the vision's, or scheduled work.
- **A fact lives once, beside what it documents**: a README in every
  folder, reached from the one above. The generic lives in the
  documentation packages; a package or a module documents only what is
  its own. A decision and its reason: the record of the work.
- **The rules are checked**, not remembered: the README rules, the code
  rules and a package's structure run as tests.
- **Worked from the packages** (the human, 2026-11-18): the
  documentation lives in the packages and is kept there as the
  implementation goes on, a design still changing included; the
  direction of what is not built is the vision's
  (`base-docs-vision`). The records where the work is done hold the
  history: what was said, decided, found, scheduled; what settles moves
  into the packages and leaves the records.

## Working demos

Feedback on the documentation, settled with the human (2026-11-18), to
shape the way we work; not yet built (scheduled work). An AI is the
documentation's primary user, and for it working demos are the most
important part of the documentation, when they run in the validation: a
demo nothing runs is prose with code in it, and goes stale as prose does.

- **Every how-to runnable**: a how-to has its page and a script beside
  it, its steps (`.haicc` lines, `sh` where the machine level is
  needed), each with what it answers (`# expect: <fragment>` under its
  line, checked). A run proves what the page says; a reader sees the
  answer beside the command.
- **A scene and its steps**: the scene is what has to be there before the
  first step (an install booted, a host in service, a swarm); a how-to's
  scene is often another's end, so preparing it runs the how-tos before
  it. Two ways through: stepped, a step at a time, each answer seen;
  or run through, every step and its check (a demo, the validation).
- **Scenes prepared in the background**: an install brought up to the
  first step while other work goes on, started by an intention to do a
  piece of work. A how-to has a unique key (`<org>/<package>/<name>`),
  its scene placed by it: a development install preinstalls the scenes,
  ready to start, and they can be explored as part of the documentation.
- **Run in the validation**: a package's pre-release (`full`) runs its
  how-tos, grouped in one install a package or a pattern, in their order;
  one that needs Docker or the network says so and is skipped with the
  reason; a how-to that fails fails the pre-release.
- **A run's report, stored with the how-to**: each run's report beside
  the how-to's page, fresh at every pre-release, read with `info` like the
  page: every step's command and answer, what each changed, its metrics,
  the checks, the state before and after. A report producer writes it
  from the run's records, in its shapes (JSON for agents and comparisons,
  Markdown for people).
- **A direct run**, a demo with no steps: its report is enough to say
  what it does and that it works on this release; exploring its end, or
  trying a variation, needs it live, prepared again on demand.
- **The review by an AI agent as the documentation's user** stays beside
  them: a run proves the commands, the review finds what cannot be found.

## Validation

Before every commit, scoped to the change (the human, 2026-11-23: "a
change made and tested, and a release built from it, remains valid;
package scoped tests only, with a full test every so often"):

- **A package that changed: its pre-release**: rebuilt, its `full` set
  run from its bundle when its content changed, the report written into
  `test-reports/` and committed with it. A module that changed: the
  pre-release of the packages whose behaviour it changes, not of every
  package that carries it. A package runs self-contained, its own copy:
  a release built from a tested change stays valid.
- **What the change touches end to end**: the boot's test, or the one
  end-to-end script that covers it (`run.sh`, `splectral.sh`, ...); not
  all of them.
- **The full test, every so often** (overnight): every package's
  pre-release, the strict release check (every package's report
  current), the boot's test several times, every end-to-end script.
  Before a milestone, too.
- **The checks**: the READMEs, the code, every package against the
  package structure: no problems.
- **The runtime or the repository code changed**: the boot's test
  several times; a race shows one run in a few. Nothing left running.
- **Anything the command touches changed**: the `haicc` command end to
  end, the script that covers it. Containers made by the tests need a Docker daemon; none is left
  after.
- **A package tests what it provides**, in a test of its own; where
  nothing is specific to it, a dummy that says so. A test that runs
  nothing by accident fails.
- **No commit while a build runs** over the tree: it catches files
  mid-rewrite.
- **Partial while changes are made**: not every build every time. A
  batch of changes, then one rebuild and what the changes touch: the
  changed packages' pre-releases, the checks; documentation alone, the
  checks and the docs view. Everything in the full test.
- **The implementation validation**: every pattern a package implements
  (its kind, a layer, hooks, a service, a continuation script) has a
  how-to naming it; one without fails the code check.
- **A report certifies the content it was run on**: after a commit of
  generated files (the modules' copies, a dispatcher), the changed
  packages' pre-releases again before the work is final. A report left
  stale by a module's copy alone waits for the full test; the strict
  release check, every report current, is the full test's.
- **A test waits for a process to end** (`kill -0`), not only for it to
  stop answering; nothing left running after a run.
- **A test run's last lines are read**: an apostrophe in a test's title
  or message breaks its file, and a filter on the output hides that.

## Branches

- **`main` holds settled state**; it changes only by plain merges from
  `execute/main`, the execution branch, never by direct commits.
- **Plain merges**, no squash, no rebase: history reaches `main` as it
  happened. No force-push on any branch; a branch is deleted only after a
  plain merge.
- **A push refused is merged**, never forced: another session may have
  pushed.
- **Commit messages**: the first line the state change; the body the
  request it answers and why, briefly.

## Products

- **Each package and module has a repository of its own**, at the path
  it has in development, `<org>/<repo>`. Once validated, each one that
  changed is updated from development: a module's history split and
  plain-merged into its repository; a package's folder written over its
  repository's `main`. When the human asks, or at a milestone agreed
  with them: not after every change.
- **New repositories are created by a person.**
- **Deploy and teardown, no upgrade in place**: what changes how things
  are placed or stored comes with a new deploy after a teardown; an
  update is a new install, reading the data of the one before it, then a
  switchover.

## Work

- **Scheduled work**: requests, from a person or from `haici`, planned
  into phases and items; an agent takes up an item it may do alone.
- **Tasks have labels**, meaningful, named whenever a task is.
- **A new pattern, a how-to**: a pattern not done before gets a how-to:
  a proof of concept first, saved as a how-to, then the implementation.
  The how-to lives in the package the pattern belongs to and names it,
  `Pattern: <name>`.
- **A reading is put back in its own words** and confirmed before it is
  built.
- **Each part of the work is recorded**: what was built, what was
  decided while building and why, what was found, how it was validated.
- **How a task reads**: **asked**, a request from a member, not yet
  discussed; **settled**, what the team agreed in discussion, in the
  words used and who said what, built as written; **left to us**, handed
  over, ours to decide and change while building, said what was done;
  **proposed**, put to the team by a member and not yet agreed, agreed
  before it is built unless the task says it is ours; **where**, the code found when the task was
  discussed, a start, checked again.
- **Planned PRINCE2-style, as far as needed**: products first, by
  phases, the next in detail and later ones in outline, managed by
  exception within tolerances; a phase is entered when the one before
  has proved itself, not by a date. No bureaucracy: the repositories
  carry what documents would.
- **From vision to work**, three concerns: the vision, the directions
  not yet ordered (`base-docs-vision`); the roadmap, the order (the aim,
  the priorities, the phases, the current phase's plan, the product);
  the scheduled work, the items, a task each. A direction enters the
  roadmap when it is given a place in the order, and becomes scheduled
  work when it is designed and requested, taken up as requests and
  reported back; it leaves the vision then. The roadmap and the
  scheduled work are our development's private data, kept together in a
  repository of their own, not in a package.

## Tooling

Today's tooling, beside the packages (`tools/`), not in them, until the
HDLC is a protocol of its own. Kept to become packages: one tool, one
concern; what two tools share in `lib/`; a tool reads and writes files and
prints one line of JSON a result, so another can use it.

- `install.sh`: the dependencies, replayed from the lockfile.
- `release.js`: every package assembled and bundled into the sources,
  Bare's tarball, the `haicc` installer; `--strict` refuses a stale
  report. For every platform of `lib/platforms.js` (`linux-x64`,
  `linux-arm64`): one bundle a package carrying each one's native
  addons, Bare's tarball and pin for each. The tools themselves run on
  `linux-x64`.
- `package-test.js <org>/<package>`: a package's pre-release.
- `package-template.sh <org>/<package>`: a package brought to its
  organisation's template, its generic tests copied, its pin recorded.
- `products.sh <module>`, `packages.sh -m <what> <org>/<package>`: the
  product repositories updated.
- `lib/orgs.js`: the organisations, one list every tool reads: each its
  template and the organisations its packages may depend on.
- `info-extract.js`, `code-check.js`: the checks; `info-view.js`: the docs
  view, the docs mrepo of a transient install (every package the sources
  offer) in one page, browsed by keywords.
- `docker.sh`: a Docker daemon made sure to answer.
