# base-docs-haicc

The haicc platform: what it is, its levels from the machine to the swarm, and our terms.

haicc runs software as mrepos: repositories that run, their data in
layers and a runtime executing the requests posted to them. On a
machine, one command reaches an install of mrepos, local ones and
swarms of nodes; each answers about itself. Packages make the mrepos,
protocols are what they offer, and the documentation is read from the
docs mrepo: `haicc docs info/get <keywords>`.

## Links

- [test](test/)
- [test-reports](test-reports/)
- [modules](modules/)

## Levels

- **The machine**: on Linux, the `haicc` command: a folder linked or the
  packages downloaded from their releases, Bare put in place, the
  sources. Every command starts here.
- **The boot mrepo**, `local/boot`: the root of an install, the first
  mrepo, put in place by the boot, which sorts the work folder first
  (`mrepos/`, the install's registry; `scripts/`). It deploys the others
  and takes commands at `.`: `haicc . <protocol>/<action>`.
  The one mrepo with no service: nothing upstream manages it.
- **The docs mrepo**, `local/docs`, a fixed name in the base family: one
  an install, always `docs`, so what reads it (the help viewer) finds it
  by its unique URI wherever it is deployed. Deployed in the boot mrepo (or by
  the workbench, at `workbench/docs`), the install's documentation:
  every package in its store, built at its `initialise`, split on
  package, read with `info` in a package's context.
- **The host**, `local/host`: the mrepo a machine is managed with,
  service managed; applications, swarms and their nodes are deployed in
  it. `haicc host <protocol>/<action>`. On an install with the
  workbench, the workbench fulfils this role (below): the role counts,
  not the mrepo's name.
- **A swarm and its nodes**: a swarm is made by the host
  (`swarm/create swarms/<swarm>`): a node in its `main` whose kind is
  `swarm`, with its master, the swarm's first node, and its lookup db.
  Nodes are deployed into it (`swarm/deploy swarms/<swarm>/<name>`),
  each an mrepo, `<swarm>/<name>`, registered by the host that created
  it. Every node runs `rns` on the swarm's lookup db: `rns/status` says
  who is registered and active. Every node keeps its own log, synced
  lazily to the master: `log/read` there answers every node's. A node
  reaches another by its unique URI, `haicc <swarm>/<name>
  <protocol>/<action>`: dispatched, resolved by `rns`, delivered to it
  directly. A node can have a replica in a
  container, linked as `container`; or it runs in a container on its
  own haicc install, a pair (`boot/deploy ... --flags container`).
- **The workbench**, `local/workbench`: a solution, the development and
  testing environment, the local manager in the host's role. One
  command on a fresh install, `haicc . boot/deploy workbench
  haiccing/base-solution-workbench`, deploys it; its commission deploys
  its components below it, the docs mrepo and Splectral
  (`workbench/docs`, `workbench/splectral`), each commissioned by its
  own, then brings it into service. Its `main` holds the `howtos`
  namespace, where how-tos are installed by their key.
- **Splectral**, `local/splectral`: an app platform beside the host. It
  deploys its components with the boot protocol, installs their
  Splectral side (`splectral/install`) and serves them in a browser as
  a site, a tab each, a component's section in its content area; its server is the data layer, running the commands a
  component asks for as a terminal does. Its components are packages of
  the `splectral` organisation: the help viewer, the first, and the log
  viewer, a swarm's logs as its master holds them.

## Platforms

haicc is the base; on it, three platforms, one for each type of
component: `myctral` (data), `myctrans` (transformation) and `splectral`
(interaction). Each is an app platform with its packages in an
organisation of its own, beside haicc's own, `haiccing`.

- **The platform itself is haiccing's**: the mrepo that deploys its
  components and its server (`base-package-splectral`); its components'
  packages are its organisation's, and name no other organisation's.
- **An organisation is built, released and sourced by itself**: its
  packages in the sources under `<org>/`, its manifest
  `<org>/manifest.json`. An install sources `haiccing` and the
  organisation of each platform it deploys.
- **A package is named fully qualified**, `<org>/<package>`, always:
  in a command, a list, a manifest. No organisation is assumed, so
  packages of other organisations, a user's later, are named the same
  way.
- **References**: a list (a top-level inclusion) names its own
  organisation's packages only; a package may depend on the
  organisations its own declares (haiccing's for the three platforms),
  written in the organisation's manifest (`depends`).
- **A platform declares its organisation**: its package's
  `package.json`, `"platform": "<org>"`; a list of that organisation is
  its component.
- **Sourcing, an organisation at a time**: `haicc sources download
  <org>`, its manifest an asset of the latest release of its
  documentation package (`<org>/base-docs-<platform>`, haiccing's
  `base-docs-haicc`).
- **One package template, an input source each**: a platform's packages
  are brought to a template very similar to haiccing's
  (`base-docs-package`); what differs is the input source, the
  platform's own organisation.
- **Built so far**: `splectral`, its proof of concept; `myctral` and
  `myctrans` have their organisations, no packages yet.

## Terms

- **mrepo**: a repository that runs; its data in layers, git branches;
  a runtime executing the requests posted to its inbox.
- **layer**: one branch of an mrepo, with a mode: `main` its data,
  `runtime`, `packages`, `protocols`, `links`, `info`,
  the inbox, the outbox, the request layers.
- **request**: a form, `{ protocol, action, uri, args }`, or a command
  as typed; executed, recorded, answered through the outbox.
- **protocol**: what an mrepo offers, a set of actions; one package,
  one protocol; offered once it is active.
- **package**: the unit of delivery, a bundle run with Bare; it carries
  its own copies of what it needs.
- **component**: a package that is a list of packages deployed together.
- **solution**: a package that is the mrepos an install is made of: its
  own mrepo's list, and its commission deploying its components below
  it; named by the segment it is deployed at (`workbench`). Not a kind
  the boot knows: what it does is its hooks'.
- **module**: code, carried by packages; a documented method is a
  folder, `external/` for a protocol's actions, `internal/` for code.
- **family**: packages that follow one package specification: `base`.
- **organisation**: the packages of one platform, or haicc's own
  (`haiccing`), built, released and sourced together: a GitHub
  organisation, a folder in the sources, a manifest.
- **position**: where a command stands; a URI names it.
- **unique URI**: an mrepo's name across the install, a path: its
  namespace, then its name (`local/host`, `swarm-1/node-1`,
  `haiccing/base-package-crud/howto/query/boot`); its folder
  `<work>/mrepos/<unique URI>/`, the install's registry. Never a prefix of another's: no mrepo's
  folder inside another's. Unique with respect to its install: what is
  in `local`, and a how-to's mrepos, only within it; a swarm's node
  (`<swarm>/<name>`) independent of the install it runs on. Beyond the
  install, in an external context, a domain segment in front makes it
  unique there (not built).
- **namespace**: where unique URIs are made: `local`, what the boot
  mrepo deploys; a node whose kind is a namespace's, the nearest above
  a position: `swarm` (its name the namespace's), `howtos` (the path
  below it the URI: a how-to's key, `<org>/<package>/howto/<name>`).
- **kind**: what a node's document says it is, the type of its data
  structure: `{"kind":"swarm"}`, `{"kind":"howtos"}`. What a position means, its documents
  say, not a path; later a kind is a schema's name.
- **sources**: the folder an install deploys from. Air-gapped: nothing
  is installed from the internet directly; a download only fills the
  sources folder.
- **shortcut**: a node in `main` leading to another mrepo; `haicc` hops
  through it.
- **link**: what an mrepo knows of one it deployed: its shortcut in
  `main` and its record in the `links` layer (where it is, its package,
  its runtime). The managing mrepo's, in forward visibility only.
- **registry**: the install's mrepos, the work folder's `mrepos/`, a
  folder each by its unique URI; for the install's system
  administration. Made at the initial boot, kept by deploy and
  teardown; no mrepo copies it.
- **idempotent**: every action can be repeated; a repeat is allowed and
  may warn; what it does again is the action's own to say
  (`base-docs-hdlc`, "Every action is idempotent").
- **hook**: what an mrepo runs on a status transition, a file a
  transition of simple commands, its own lines: its runtime starting
  (`boot`, the activations); `commission`, after its boot at every start
  (a deploy, a restart), its lines idempotent; its
  service's `initialise` (its setup), `start`, `stop`, `shutdown`;
  `decommission`, at the start of its teardown.
- **lifecycle**: an mrepo's whole: deploy, its `commission`; its
  service, `initialise`, `start` ⇄ `stop`, `shutdown`; its
  `decommission`, teardown. The runtime starts at its deploy and stops
  at its teardown only; what each hook holds is its package's.
- **commission**, **decommission**: the hooks of a deploy's end and a
  teardown's start: what the mrepo does once deployed (its components
  deployed, each commissioned by its own, the cascade; its service
  initialised, started) and before it goes (what it deployed torn down).
  The deploy and the teardown wait for them; a line that fails fails
  them.
- **script**: lines, each a simple command, run where the `haicc` points
  (`haicc <URI> haicc/script <URI> '<lines>'`); a package's, placed by
  a deploy in the work folder's `scripts/`, run by name (`haicc <URI>
  haicc/file <URI> <org>/<package>/<name>`).
- **continuation**: a script a command answers with, to go on with,
  run in the context of the command it continues.
- **docs mrepo**: the install's documentation, every package's pages in
  its store, split on package, read with `info/get`; any other mrepo
  answers about itself.
- **context**: the package a keyword is read in, its name in front
  (`info/get haiccing/base-package-boot/deploy`); a package's keywords
  are its own. A short keyword: the mrepo's own package's, else a choice
  of the packages that have it. Never kept between requests.
- **HDLC**: the haicc delivery lifecycle, how work is done.
- **pair**: a node run in a Docker container on its own haicc install.
  The host links it (`how: container`) and forwards every command for it
  to it; a platform command acting on it (the boot protocol's) goes to
  the container's platform, which executes it; the container's
  lifecycle is the host's, through Docker.
- **app platform**: an mrepo that deploys its components with the boot
  protocol and adds only what is its own; a component deployed in two
  parts, a plain mrepo first, the platform's side laid on it after.
  Splectral is one.
- **swarm**: haicc's node management on a host: a swarm, its master and
  its nodes made, each node registered; not a protocol the nodes run.
- **master**: a swarm's first node: it keeps the swarm's lookup db; one a
  swarm.
- **lookup db**: a swarm's registry, common to its nodes: each node's
  unique URI, where it lives, whether it is active; kept at the master,
  a replica on every node, read with `rns`.
- **lease**: how long a node stays active without its `rns` renewing it
  at the master; run out, the node is quiet.
- **cell**: a node as a self-contained unit: its own haicc, its own
  `rns`, its own `dispatch`, its own identity, its own log.
- **dispatch**: a command routed to the node its unique URI names, not
  through shortcuts: resolved in the sender's lookup db, on one machine
  dropped into the node's inbox folder.
- **log**: a node's completed requests, a record each, in a topic the
  node alone writes; a swarm's are read together at its master.
- **haici**: human ai continuous improvement, findings from the request
  log, fed back to the HDLC; its protocol records feedback on a command
  (`--flags feedback <text>`), the request log its store.
