# base-docs-vision

The haicc platform's vision: the directions the work takes, not yet settled.

Kept so that decisions take them into account. Parts were agreed with a
person and say so; the rest is direction. Nothing here is built unless
the packages' own documentation says it is: what is built is documented
where it is, and leaves the vision.

## Links

- [test](test/)
- [test-reports](test-reports/)
- [modules](modules/)

## Mycelium

From the bottom:

- **Hypercore:** storage and replication. Hyperdrive, and the
  filesystems git engines run on, sit here.
- **mycelium-git:** objects, trees, checkpoints and the repository rules,
  over a backend contract with several engines. p2p-git on Hyperdrive is
  one of the main components.
- **AVRO:** objects become data structures, with schemas and typed values.
  From here up, a URI names a typed value, not stored bytes.
- **One type system, an encoding per storage** (the team, 2026-11-21;
  the human: "those JSON document can then have their avro schema, no?"):
  the schema is the type; a document in git stays JSON, a record in a
  topic AVRO's binary, a table Parquet's columns, all typed by the same
  schema. A node's kind names its schema. The shapes JSON keeps to get
  there: `base-docs-uri`, "Data shapes". Built: the encoding, the
  install's registry, packages carrying their schemas
  (`mycelium-value-avro`; `base-docs-package`, "Schemas"). Next: the
  kinds' schemas (a swarm's node, the `howtos` namespace, a lookup db
  entry, a trace), documents validated against their kind where they
  enter (`crud/create`); the swarm's schema repository with its lookup
  db, common to every node, replicated lazily.
- **AVRO containers in p2p** (the human: "I guess that AVRO containers
  will be good data containers to use in p2p."): an AVRO object
  container file carries its schema with its records, compressed, in
  blocks: self-describing, as a bundle is. Proposed: a container of
  mycelium's own (beside `mycelium-container-document`), for sets that
  move between repositories (an export, a training set, a log's
  archived segment). Inside a topic, a record in AVRO's single-object
  encoding: built (`mycelium-value-avro`).
- **Kafka:** streaming and high-volume data: records and topics. On
  Hypercore, a partition is a core, an offset a block index; no central
  broker, its functions taken on by peers.
- **Topics from the ground up:** a Kafka record is the elementary data
  container (the data in its `value`, whose schema is the data's schema;
  metadata in its `headers`; only the properties needed so far). Data
  lives in topics in Kafka's sense, single-partition to start, with
  Kafka's functionality and names, built basic and evolving into
  mycelium's p2p Kafka; state is built from topics, never written
  directly (`mycelium-topic`).
- **Multi-paradigm data:** records in topics are the lower level, objects
  (files, documents, any git object) the higher, side by side in a
  repository; an object may be generated from a change log of records,
  or exist in its own right. Built up as mycelium matures.
- **Tables in Parquet files** (the human, 2026-11-21, for the model
  work: "parquet files", "We should add it to the mycelium patterns to
  be implemented (I think confluent iceberg is using it)"): record data
  read as a table (a training or evaluation set, analytics over logs) in
  columnar Parquet files. The topic stays the source: a table is
  materialised from a topic up to an offset, as Confluent's Tableflow
  materialises Kafka topics as Iceberg tables (Iceberg: a table a series
  of snapshots, each a manifest of its Parquet files, read as it was at
  any snapshot). On mycelium (proposed): the Parquet files objects in a
  repository, a snapshot a commit with its manifest and the offsets it
  was taken up to, the schema AVRO's carried into Parquet's.

`mycelium-uri` and `mycelium-xpath` are the shared vocabulary across all
four. On top sit the **repository paradigms**: the dev env, the test-run
instance, the module repository, data instance repositories. Each is its
own set of rules and capabilities; the request flow, deploy, publish and
sync belong to the paradigms that use them.

## P2P

Fetch and push are the outside world's way: a client reaches a server.
Inside P2P the same needs are met by subscription and replication. The
boundary is found, not assumed, once Hypercore is understood. Links over
copies follow naturally from the cluster: a node holds links and loads
lazily what it reads.

## Connectivity

Research, not done (2026-10-26): how nodes reach each other beyond one
network, each option a probe, a phone on mobile data the hard case.

- **Direct holepunching** between nodes over the public HyperDHT.
- **A home node reachable from outside** (a public IP, a forwarded UDP
  port, dynamic DNS), a private bootstrap and a blind relay. Fails under
  CGNAT.
- **A cheap VPS** in the same role, when the home connection cannot be
  reached.
- **Cloudflare at the edges only**: Tunnel and Access for remote reach of
  a node's UI, Durable Objects as a WebSocket rendezvous, R2 for backups.
  Cloudflare cannot host a peer: no UDP in Workers, no inbound UDP in
  Containers, Spectrum's UDP for Enterprise only.

Found so far: nodes on one network connect directly; a private DHT needs
two persistent nodes; a cloud session cannot reach the public DHT, so a
phone and a home node are tested from a local machine.

## Private data

Every application needs it: private instance repositories, replicated
only between the owner's paired devices, encrypted, with an always-on
blind peer for availability. Research, not done (2026-10-26):

- **Holepunch's building blocks** checked against their current
  documentation: keys and discovery keys, `encryptionKey`, the
  Corestore's primary key, Hyperswarm's firewall, Autobase, blind
  pairing, blind peers; where a device's primary key is kept (the OS
  keystore, from Bare?).
- **A probe**: a phone and a home node paired into one encrypted
  instance repository, with a blind peer. Until storage is
  Holepunch-based throughout, git with encryption (age or sops) fills
  the gap.
- **A cloud session's private data**: how it gets what it needs, and
  whether an AI session can act as an operator.
- **Post-quantum readiness**: Holepunch's stack is classical (Ed25519,
  X25519), with no post-quantum plan found (2026-10-26); symmetric
  encryption and hashing hold. The risk is harvest now, decrypt later
  on key exchange. By default keys move out of band (pairing by QR or
  locally). To check: whether sodium-native exposes libsodium 1.0.22's
  ML-KEM768 or X-Wing; a post-quantum handshake inside a Hyperswarm
  connection (the third-party `post-quantum-core` approach); WireGuard
  with an out-of-band preshared key, or Rosenpass, between one's own
  devices; SSH's hybrid ML-KEM for git; whether Bare's TLS negotiates
  X25519MLKEM768 for a node's UI.

## Devices

A full peer on every device, the phone included (2026-10-26): Bare in an
app, or Termux (a Termux probe agreed for later); a node's git store and
its local UI on the phone; a real phone in the test loop, its execution
data read like any node's.

## Values

Agreed with the human, 2026-11-08: the data type, encodings and
containers (compact-encoding the envelope, AVRO the content; RPC on the
replication connection); mycelium repositories, the branch model and
portable execution; the levels' structure, Pear below HAICC.

## Cluster

- No npm inside P2P: a package comes in once, at the boundary, and then
  lives in P2P under its own identity, as a repository.
- A deployment links to packages (gitlinks or a manifest; on Hypercore a
  key and a commit) rather than containing them.
- A package repository holds the bytes; everything else holds links.
  Towards a single code repository: run repositories stay self-contained
  by holding links the cluster resolves, so kept runs get small.
- A seed node starts from a plain base with the runtime (Bare) only; a
  self-contained bootstrap repository sets it up. It is the first
  always-on peer; later nodes need only the bootstrap repository and its
  key.
- A cluster has a deployment repository, alive while the cluster runs:
  what it is, its nodes, its state and its monitoring.

## Operators

Single-concern repositories: each does one step of a multistep process
and keeps the record of it. Input is a request, output its response on
`main`; the next one takes it in itself. Every step can be traced and
rerun on its own. The test-run instance was the first.

## Storage

Bundles are the transport between repositories outside replication:
self-contained, immutable, verifiable, shared by hash. Loose objects stay
the working store; deltas are an optimisation for later.

Where an mrepo's layers are kept (the human, 2026-11-12; settled, not
built):

- `main` on the Corestore is the external state; what is on the
  filesystem is the internal state.
- **Only `main` on the Corestore.** On disk, by default, every other
  layer, unless an exception is raised; at least the inbox and the
  outbox.
- Needed: a folder synced with the Corestore, both ways.
- The code does not follow the rule yet: under `p2p` storage it routes
  `runtime`, `packages` and `protocols` to the Corestore as well.

## Solutions

The naming (the human, 2026-11-12; settled, not built):

- **A package** brings a protocol and its part of the mrepo structure.
- **A component** (`base-component-<name>`) delivers a service to the
  solution; the components are its physical view.
- **An application** (`base-application-<name>`) delivers user-facing
  functionality, a logical view within the solution: an mrepo on one or
  more components, one mrepo per component it spans, exclusive (a child
  mrepo, at `main/<application>/`) or shared (a section of the
  component's `main`, with its own protocols). The URI is the same
  either way. With several applications there are relationships between
  them.
- **A solution** (`base-solution-<name>`) is a number of applications and
  components, possibly across swarms.
- **Why it matters**: haicc can place deployments again, to satisfy the
  resources needed, with nothing changing for the application; with the
  replication p2p gives, a new install can come in as passive before the
  switch.

Open: how this application relates to the distributed application of
2026-11-18 (a haicc repository at the top deploying the three platforms,
"Distributed applications"), to be reconciled.

## Deployment

What haicc is for (the human, 2026-11-12):

- **Its concern is deployment**, global, across swarms; also setting up
  and managing the bridges between swarms.
- **Two sides**: on the machine, an app that manages the downloads of
  the sources and installs from scratch; on the swarm's side, an mrepo.
- **Its commands are issued on the host**; what they reach beyond it is
  haicc's own concern.

Superseded since: that the haicc mrepo is the only one with the boot
protocol (the boot mrepo, the host and Splectral all deploy), and the web
of haicc mrepos proxying into a node's container (a node in a container
is a pair, on its own install: `base-docs-haicc`, "pair").

## Organisations

Agreed 2026-11-02. The layers: the p2p and language substrate, mycelium
the repository layer, splectrum the language layer, haicc the project
layer; Splectral for interaction alongside them. **One rule: engines (all
code) in `pear-full-square`; what is made with an engine in its layer's
organisation.** A module's prefix names its layer (`mycelium-`,
`splectral-`, `haicc-`); the organisation says what kind of thing it is.
Dependencies run one way: everything depends on `pear-full-square`, which
depends on nothing outside itself.

- **Splectrum's tool**: the language layer will have a tool of its own,
  its modules (engines) in `pear-full-square`; the `splectrum`
  organisation holds the language modules made with it.
- **`haiccing`: projects**, run with HAICC's tools. Demo projects first
  (`demo-liveness`, `demo-other-host`: a test cluster, a Splectral install
  with its components, a scenario), deployed with `haicc-deployment` and
  `haicc-reconcile`. Where packages are built moves there only once the
  project tool can be used: today's places are manual collaboration, not
  structured by tooling, and stay where they are.

- **`pear-full-square`: the p2p infrastructure.** The p2p series, p2p-git,
  mycelium on the p2p layer, the node and its managers, and the Splectral
  platform's engine (`splectral-server`; the platform itself, made with
  it, is the haiccing package `base-package-splectral`).
- **`myctral`: data repositories** (the human, 2026-11-18), the data
  pillar of a distributed application (below, "Distributed
  applications"): packages made with mycelium's engines that validate,
  merge and commit its data structures; the mycelium stack, built on the
  streaming layer, belongs here.
- **`myctrans`: data transformation** (the human, 2026-11-18), the
  transformation pillar: packages that transform, prepare changes and
  manage the processing. Each of the two builds up the core packages of
  its area, a natural separation of concerns.
- **`splectral`: (interaction) components on the Splectral platform**, completely
  agnostic of p2p: they work in the platform's abstract world (hosts,
  nodes, resources by URI, activity), as mycelium works with the p2p
  layer's abstractions.
- **Splectral, the future vision** (the human, 2026-11-02): a platform for
  multiple functional components that are part of a solution. Approached
  step by step. First feedback towards it, from the local run of the
  demos: a solution (the demo
  app) as one tab with its own menu, its components as tabs inside it;
  time shown on every screen, not only the timeline.
- **`splectrum`: the language layer**: language modules, for building real applications on
  the mycelium p2p platform. What exists now as URI-expressed capabilities,
  together with AVRO (typed values named by URI), becomes a DSL platform:
  that is where splectrum lives.
- **HAICC, human–AI creative collaboration (in `splectrum`)**: the
  eventual tool for the whole cycle: ideas discussed, designed, requested,
  implemented, validated, released and deployed, with the records and the
  repositories as its memory. It is what this repository's process does by
  hand, made explicit and runnable, stage by stage. Its first module is
  the deployment stage, `haicc-reconcile`:
  declare what a module needs, check it, make it so.
- **`p2p-propagate`**: later, a desired state (node types and their
  configurations) carried across a swarm, each node reconciling its part.

## Authority

The split of authority between the swarm (its configuration, on the
master) and the managers (the substrate: containers, networks, ...) is the
current default, and the one implemented. It will be configurable: the
human sees scenarios for other settings, for example a passive swarm whose
configuration a host manages (the swarm cannot manage itself), or an (IoT)
node in a swarm where the node or the swarm manages the OS. Not designed
further yet.

## Packages

Modules are used as packages: sets referenced as one unit (below
mycelium, `third-party` and ours, `p2p`; then `mycelium`; `splectral`;
`haicc`). Third-party
code comes in once, at the boundary, and is ours from then on. Projects
layer as cascading click and runs.

## Releases

- Pear (Holepunch's runtime and platform for p2p applications: staged,
  seeded and released from a `pear://` link) comes in when versions are
  fixed: released versions of Splectral and the tools, run from a link.
  Until then, everything runs from the development tree.
- There is always a public component (Pear's platform, a first fetch), and
  air-gapping is possible: our swarms keep their own DHTs, and what is
  fetched once can be seeded on our own network.
- Nodes keep getting their code by replication of the swarm's packages
  repository, inside the swarm: that is mycelium's, and becomes the
  capability store.


## Pipelines

Discussed with the human, 2026-11-13: a direction for the distant horizon.
What the human said is stated as it is; what is marked proposed or open is
not agreed. The practicalities are designed when the work reaches it.

- **Pipelines kept with their data** (the human, 2026-11-21): "this
  pattern may become a general pattern: have the pipeline(s) that
  produces data associated with the data structures (mycelium repos)
  themselves. But that is for later." Its first case: a how-to, an
  install on the workbench whose runner produces its report from its
  own records.

### The pipeline engine

A platform to run processing pipelines (as StreamSets does), our own, on
p2p, tied in with our request processing.

- **Built from core actions:** the protocols provide core actions; more
  complex processing is built from them, typically the output of one the
  input of the next. New functionality is tried out as a pipeline; a
  protocol package is created only where needed.
- **Run as requests:** each step is a request, executed completely on its
  own, so a pipeline runs asynchronously and in parallel. Which pipeline
  and which step is metadata on the record.
- **Its start:** one ordinary request, of a single type, the only one that
  can come from outside. It is rewritten with the pipeline and step
  identifiers and executed; every other request of the pipeline is
  internal.
- **Its state:** the pipeline's request branch, an execute branch of
  `main` named by the unique pipeline request id. A step merges into that
  branch at its end; the pipeline merges into `main` at its end, as one
  commit, the pipeline request's. The steps' history stays out of `main`.
  A plain request stays as it is (it could be seen as a pipeline of one
  step).
- **Its data:** what passes between steps is the record; larger data is
  on the pipeline's branch, referred to by URI. The pipeline cleans up as
  it runs, so that at merge time only the data that needs merging is
  there.
- **Errors:** handled by the pipeline's definition, for example diverting
  to an error handling path. What happens to the request branch after a
  failure is configuration: discarded, or kept for debugging.
- **Execution plans:** the rewrite is where a plan is made, fixed or on
  the fly.
- **Compiled:** a pipeline written in code, loaded and executed: for
  heavy processing, to gain speed; or for complex jobs over distributed
  remote data, where a plan optimised for the installation can be created
  (long-running batch processing).
- **Written** in a graphical UI or a scripted language. AVRO between the
  steps (schemas: an output checked against the next input).

Proposed, not agreed: the completion of a step places the next one, read
from the definition (no coordinator process); compiled code as a generated
protocol package; the pipeline taking the place of the composite actions
on the roadmap. Open: joins, parallel steps writing the same path, the
definition's format, the grain (a request costs several commits: a step
works on a batch, not on one record).

#### The core of `myctrans`

Agreed with the human, 2026-11-18 ("Your idea is spot on"), with the
distributed applications (below): the pipeline engine is the core of
`myctrans`, the transformation platform. A `myctrans` component is a
pipeline; the platform deploys pipelines and runs them, as Splectral
deploys and runs interaction components. It revises "Its state" and the
end of a pipeline above: the pipeline's state is no longer a branch of the
data's `main`.

- **Why** (the human): it offloads the pressure that would otherwise be
  on the commit pipeline of the data repository; it separates the
  concerns; and processing state held outside the data repository's
  request and execution framework is a lot easier to manage.
- **The two sides.** `myctrans`, the pipeline: steps built from core
  actions, its definition (the order, the error paths, the execution
  plan), its processing state. `myctral`, the data repository: it
  validates, merges and commits; it holds no pipeline's state and runs no
  pipeline's steps.
- **Its state, in the pipeline's own repository.** What the pipeline is
  working on (its progress, its intermediate results, larger data passed
  between steps by URI) lives in the `myctrans` component's mrepo, on its
  own request branch there, not in the data repository. The data
  repository's request pipeline sees one request per proposed change, not
  a request per step.
- **Its end, a proposal.** The last step proposes the prepared change to
  the data repository: puts and removes against the base commit the
  pipeline read. The repository validates, merges and commits it, or
  refuses and says why (its current commit with it).
- **A refusal is the pipeline's error path.** Its definition decides: read
  again at the repository's commit and prepare the change again, rework
  it, or report. The negotiation between the data repository and the
  processing component is this path.
- **One key, no repeats.** The pipeline's request id, which names its
  branch, keys its proposal: a proposal sent twice, after an answer lost,
  is recognised by the repository and applied once. Retries bounded by the
  definition.
- **Started by a request, or by a commit.** A pipeline is started by one
  request from outside (above, "Its start"), or it follows a data
  repository: each commit there, a change record, starts or feeds the
  pipelines that follow it. A commit in one repository thus starts the
  transformation that proposes changes to another: changes flow through an
  application with no coordinator, the completion of one step placing the
  next (proposed above) carried across repositories.
- **A follower keeps its own position** in the stream it follows, as every
  reader does (one writer, one reader), and takes a change record it has
  seen already as seen.
- **The grain**: a run takes a batch of change records, not one (a request
  costs several commits); the batch's size is the definition's.
- **Compiled pipelines**, for speed, as above: a generated `myctrans`
  package.

Open: how a pipeline subscribes to a repository's commits (the channel,
its transport); joins over two repositories (a pipeline reading both,
proposing to one); what a pipeline holds when its component is upgraded
active-passive (its processing state handed over, or rebuilt from the
stream).

### A database server

The human: the pipeline engine is a necessity when mycelium is implemented
as a database server. A reading of how they meet, not designed: a query a
pipeline, its operators steps on the core actions (CRUD first); the
execution plan the query plan; the transaction a pipeline's proposal (a
snapshot of `main` read, one commit at the end by the data repository, a
refusal or the pipeline's state discarded a rollback: "The core of
`myctrans`"); AVRO the rows' schema.

### Data is local

- **Processing is over local stores**, which may be replicas of stores
  from elsewhere. Replicated lazily, such a store works as a cache: a
  block fetched on first read, verified, local from then on.
- **Cache management with a TTL** can be a process on it. Hypercore
  (11.39.6, the one pinned) has `clear` (blocks dropped, fetched again
  when read) and mark and sweep (`startMarking`, `sweep`: what was not
  read since is cleared); it keeps no time per block, so the TTL is ours:
  the period between sweeps, or our own record of use. Only replicas of
  others' cores are cleared, never our own. Open: a TTL per store or per
  source.
- **Applications are designed in local data terms:** a classical
  distributed application is logically one central application, and
  physically runs on each node that has signed into it. To design per
  application: the order of writes (no single place where they arrive),
  global constraints, authority (who is accepted as a writer; every node
  validating what it applies).
- **The atomic commits of `main` come in handy here:** a replica is seen
  only at commit boundaries; a commit is the unit of change, one per
  pipeline request, and names what it was based on; a pipeline reads one
  snapshot throughout. The atomicity is per node: combining two nodes'
  `main` is a merge whose rule is the application's.

### Overlays, and distributed transactions

The human, 2026-11-14 (with the shortcuts moved into `main`, a file
beside the node's document). A node
can draw its data from several mrepos and hold local data beside it: what
is seen is the combination, an overlay; what is stored stays apart, and a
write goes to the local side only. For instance a local layer adds
processed documents to an input data structure while keeping both
separate.

**We can create distributed transactions with these overlays** (the
human). A reading of how, not designed: every party writes its part of a
transaction into its own mrepo, an atomic commit there, tied to the
others by the request's key; nobody writes into another's data, so
nothing is locked. The overlay decides what is seen: the parts become
visible together once all of them are there (or once the one who started
it records that they are), and a transaction that is not completed is
simply never shown and can be cleared. It is the pipeline's request
branch, one commit at the end, across mrepos.

## Distributed applications

Discussed with the human, 2026-11-18, from the Splectral proof of
concept: the direction distributed applications on p2p take, and how the
packages for each responsibility are organised. Agreed as direction; the
practicalities are designed when the work reaches them.

- **Three pillars, haicc on top.** Three component types are enough:
  data, transformation, interaction. Each pillar is a platform with its
  standard packages in an organisation of its own: `myctral`, `myctrans`,
  `splectral`. haicc is one way of working across the three: the same
  commands and records, install and lifecycle, the registry, routing.
- **Interaction is the boundary with anything outside**: a person
  through a UI, an AI agent, another system, a device, a timer.
  Splectral, the first platform, starts with components that issue
  commands through its server, the terminal's equivalent.
- **A central server and self-contained components.** The server
  installs a component and asks for its lifecycle with the same
  commands; once installed, a component runs on its own.
- **Single writer, single reader, both ways.** Each direction between
  the server and a component is one channel with one writer and one
  reader; each channel's transport is chosen for it alone (a folder, a
  Hypercore, an RPC stream), the forms over it unchanged.
- **Streaming applications.** They work on immutable data change
  records. The data repository (`myctral`) validates, merges and commits
  mycelium's data structures, immutable at their base; a commit updates
  the higher-level components built on them (mutable records and the
  like). `myctrans` components transform, prepare changes and manage the
  processing; they hold processing state, not data. A conflict is
  negotiated between the two: the repository refuses and says why, the
  component prepares the change again.
- **Upgrades are active-passive**: a new version deployed beside the
  old, switched to, rolled back by switching back; deploy and teardown,
  no upgrade in place.
- **An application is a haicc repository at the top** that deploys the
  three platforms; the platforms deploy the components. Realising it
  takes time.
- **To explore: a component deployed in two parts**: haicc creates the
  mrepo and hands it over to the platform, which deploys the component
  on it; the component can then have two runtimes, one writer per layer.
- **The pipeline engine is `myctrans`'s core** (agreed, 2026-11-18): a
  `myctrans` component a pipeline, its processing state in its own
  repository, its end a proposal to the data repository ("Pipelines",
  "The core of `myctrans`").

The order, not scheduled (each step designed before it is requested as a
phase; scheduled, it leaves the vision):

1. **Splectral, the terminal equivalent**: components that issue
   commands through its server; the proof of concept's findings fixed.
2. **A component deployed in two parts**: haicc creates the mrepo, the
   platform deploys the component on it; one install shape for every
   platform.
3. **`myctral`, its core**: a data repository that validates, merges and
   commits mycelium's data structures; the forms of a proposed change
   and of a refusal; the negotiation.
4. **`myctrans`, its core**: transformation that prepares changes and
   manages the processing.
5. **An application repository** deploying the three platforms.
6. **Distribution**: components as pairs in containers, then one
   Hypercore per channel direction for a component on another node.


## Help and haici

The human, 2026-11-13 to 2026-11-15. What was built of it: the static
side as the `info` protocol (a package's pages read by keywords), the
how-tos as pages in the packages, read with `info`; their direction,
runnable how-tos, is `base-docs-hdlc`'s ("Working demos"). Built too
(2026-11-20, 2026-11-21): the flag unit (`mrepo-base-request`,
`flags/`); dynamic help, `--flags help` on a command answered by
`help/annotate` where it would run (`base-package-help`); feedback on a
command, `--flags feedback <text>` recorded by `haici/feedback`
(`base-package-haici`), the request log its store; both answered in
natural language, the record with `--raw`. The rest is direction.

- **Three kinds of help** (settled): static help, about the packages'
  composition, design and decisions, complete; dynamic help, a full
  command described in context; and the how-tos, "very important": "the
  entry point to scope an activity on the platform", "what do you want to
  do plus how-to options".
- **`haici`, human AI continuous improvement** (settled; its first
  action, `feedback`, built): it starts from the request log, "the one place that has all the information", parsed
  into its sections (metrics, warnings and errors, audit, the use of the
  protocols, what was asked of help and not found); learning simply
  first, sophistication built up. Its findings are rooted in the package
  they belong to, not where they were seen, and reach the packages that
  use it. Ours, proposed: `haici` proposes, a change goes through the
  development process, it never edits a package.
- **Headless Claude** (settled): a user, a generator ("not only user"),
  and the filler of what is not built yet; "generating dynamic howto
  feedback"; "our setup is recursive and fractal". Ours, proposed: a
  generated how-to counts once a second headless Claude, given only the
  install and the activity, finds it and does it; an action documented
  and not coded run by headless Claude with its README as its contract,
  until code replaces it.

## Queries across links

XPath across linked mrepos (the human, 2026-11-14 and 2026-11-15;
settled, not built; the first phase, inside one mrepo, is
`base-docs-xpath`):

- **Two scenarios**: juxtaposed, the local structure and a linked mrepo
  side by side, each its own stretch of the URI (`crud/read
  host/swarms/*`); stacked, several layers at one position, one on top
  of another (the overlays, "Pipelines").
- **The segmentation is haicc's**: a query that comes in is rewritten
  into a pipeline of `haicc` segments and node set merges ("pure haicc as
  selecting commands and node set merging"); the rewrite made in each
  mrepo as the query arrives there, its shortcuts its own.
- **No cascading**: a linked mrepo answers with node sets already merged
  as far as its own links go; a caller merges one level only.
- **Single or multiple requests**: a query's plan run in one request or
  a step a request, depending on how long processing takes; the mode a
  configuration option, the first implementation measured to find where
  one becomes the other.

## Agents

Discussed with the human, 2026-11-15. What the human said is stated as
it is; what is marked ours is not agreed.

- **The direction** (the human): "The beauty of haicc is that it will
  have custom help and howto tailored to each specific mrepo. That means
  that you only see what is there and the right version etc. I think this
  is perfect for agents work."
- **What follows from it** (ours): an agent learns an mrepo the way a
  human does, from the mrepo itself: its help (what its packages offer,
  at their installed version) and its howto (how to do things there). It
  sees only what is there, so it cannot reach for what is absent, and the
  help cannot be stale, so it does not guess. Every step it takes is an
  ordinary request: gated, logged, audited, committed.
- **Tried** (2026-11-15, the local machine):
  Claude Code headless, `claude -p`, allowed only the `haicc` command,
  asked what `.` and `host` hold. Told nothing but that `haicc --help`
  exists, it read `help/get` at each, then `crud/read`, and answered
  correctly: six turns, 24 seconds, no command tried that does not exist.
- **Two ways to run an agent** (discussed): Claude drives haicc from
  outside (`claude -p` with `haicc` its only tool: works today, on the
  human's subscription); or haicc starts the agent, a protocol of its own
  whose tools are the mrepo's protocols (to design). The human: with a
  swarm, Claude runs on one node and works from there.
- **Ties in with**: command help (the roadmap's item 8: the structured
  external API, the help flag answered in the request's context, AI
  enhanced help as its third stage) and HAICC, human–AI creative
  collaboration (above). The howto is new: not designed.

## Model shaping

Discussed with the human, 2026-11-20. What the human said is stated as
it is; the rest is ours, put to the human.

- **The direction** (the human): "I would like to use smallish open
  models tuned on specific that I am sure we can apply." "The more AI
  autonomy we can have the better. Small local models that take a set
  of specific task out of the main loop are very useful and once we
  have the p2p swarms these can run at specific side on specific
  platform but used throughout the swarm." It should determine the
  roadmap's priorities.
- **The first: `hc` as haicc's operator** (agreed, 2026-11-20): a small
  model that turns an intention into `haicc` commands and continuation
  scripts, explains them, and works the help and the how-tos; exact on
  commands rather than broad. Its slots: `howto/plan` and
  `howto/explore` (`help-mvp`), headless Claude their placeholder.
- **Shaping, not building** (ours): an open model's weights taken as
  they are, tuned (an adapter) for one task; what we own is the data,
  its lineage and the evaluation, not the training.
- **What mycelium brings** (ours): its aim fits the data side of it.
  - The raw material in topics, records with offsets: a slice of it
    ("up to offset N") is exact and can be taken again.
  - The examples typed (AVRO: an instruction and its answer, a
    preference, a trace of commands, an evaluation item), validated as
    they enter (`myctral`).
  - A set made by a pipeline (`myctrans`): filtered, deduplicated,
    scrubbed, formatted, split, a larger model's answers taken in where
    allowed; run again whenever its input moves.
  - Reviewed by a person in Splectral: each choice a record.
  - A set released as a commit with its manifest and hashes; a model's
    record names the set, by commit and offsets, it was shaped on.
  - `haici` the loop: feedback on commands becomes candidate examples,
    the next adapter, new traces.
  - The runnable how-tos, each step with what it answers, an
    evaluation set as they are.
- **Placed in the swarm, used throughout it** (the human, above): a
  model a component on the node that has the platform for it (its GPU,
  its runtime), asked from any node by a request; its weights and
  adapters objects on Hyperdrive, replicated. One base model, several
  small adapters, each a task.
- **Hardware, grown into** (the human, 2026-11-20): "we are not in a
  hurry and probably can work with platforms that other discard. So we
  may get a good second hand price. I want to evolve into it, So start
  small and move up gradually with initial buys still taking part in
  the work load." What follows (ours): a swarm of unequal nodes, each
  taking the work its hardware suits: an older GPU runs the small
  models and the evaluations, a bigger one, bought later, shapes them;
  a node's capacity is part of what places a model on it.
- **Kept apart** (ours): the training itself, a job outside haicc's
  runtime (its own stack), given a frozen export of a set and giving
  back an adapter and its metrics as records; the evaluation items in
  their own topics, never in a training set; each record's consent and
  licence in its headers; a larger model as teacher only where its
  terms allow its answers to be trained on.

## Continuations

Said 2026-11-16, once a command could answer with a continuation (a
script to go on with, run by the terminal). What was said is stated as it is; nothing of it is designed.

- "I think this continuation idea is another good one. Since we keep
  request state the system can write the next set of commands on the
  fly tailored for the mrepo and the interacting user --> please
  execute at your end. (and we can drive the continuation internally as
  well, not going to the inbox. I think I am going to make it the heart
  of a JIT pipeline engine."
- Earlier, on its reach: "any command may return with a continuation,
  i.e. now continue executing this script. It is a bit like an JIT
  pipeline."
- What is built: a fixed script, shell calling `haicc`, answered by a
  deploy, run by the terminal with `sh`; nesting by a script's own
  deploys. Open from here: a continuation written on the fly from the
  request's state; one driven inside an mrepo, not through the inbox; a
  script
  used from elsewhere through the registry ("that functionality will be
  added later, not now").
- Settled for base, 2026-11-17, to build with the solution install:
  one gateway, the inbox, every command submitted there; one language,
  shell calling `haicc`, for a component's scripts and its hooks;
  continuations in a request's response, run by the terminal; hooks run
  by the runtime as console commands; base operations protocols, custom
  versions scripts.

## Repository layers

Proposals on layers beyond `main`, never built:

  - A capability branch holds the installed modules: the code as deployed,
    as plain folders. Inside, code calls code directly; there is no
    catalogue.
  - A categorisation by capability URI belongs to external APIs, where a
    requester names what it wants and the name must be mapped to an
    implementation. It is deferred to that level, together with the
    local-scope overlay below.
  - Capability branches are named by purpose, not by library: a
    capability branch is a deployed environment holding the whole
    capability layer. The repository name already carries the phase.
  - Local scope is config, in its own overlay: `overlay/config`, by
    `main`'s paths, referring to capabilities by URI (deferred, with the
    categorisation, to the external API level).
  - A layer is *local* (a branch here), *imported* (fetched here with its
    history), or *virtual* (resolved from another repository at compose
    time, never stored here). Private config is a virtual layer from the
    private instance repository.

Development and deployment through capability branches, never built:

- The code is developed on `main` as data and deployed as a tree into a
  `capability/<purpose>` branch to operate.
- `capability/default` operates this repository's own functionality.
  `capability/test` is where development deploys and test runs, without
  touching `capability/default`. More test lanes, if needed, are further
  `capability/<purpose>` branches (e.g. `capability/test-isogit`).
- Promotion deploys the tree tested on `capability/test` into
  `capability/default`. The first deployment is a bootstrap by hand.
- Code is tested against every git backend; development may start on
  one (native git, the reference) and add the others.

## Open

- Execution branch prefix: `execute/<target>` (as here) or
  `execution/<target>`.

- Whether history may be rewritten to remove leaked data.
