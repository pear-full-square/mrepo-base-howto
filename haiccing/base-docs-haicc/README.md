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
  mrepo, put in place by the boot. It deploys the others, keeps the
  mrepo registry, and takes commands at `.`: `haicc . <protocol>/<action>`.
- **The docs mrepo**, `local/docs`: deployed in the boot mrepo, the
  platform's documentation, read with `info`.
- **The host**, `local/host`: the mrepo a machine is managed with,
  service managed; applications, swarms and their nodes are deployed in
  it. `haicc host <protocol>/<action>`.
- **A swarm and its nodes**: a swarm is made by the host
  (`swarm/create swarms/<swarm>`): a node in its `main` whose kind is
  `swarm`, with its master, the swarm's first node, and its lookup db.
  Nodes are deployed into it (`swarm/deploy swarms/<swarm>/<name>`),
  each an mrepo, `<swarm>/<name>`, registered by the host that created
  it. Every node runs `rns` on the swarm's lookup db: `rns/status` says
  who is registered and active. A node can have a replica in a
  container, linked as `container`; or it runs in a container on its
  own haicc install, a pair (`boot/deploy ... --flags container`).
- **The workbench**, `local/workbench`: a solution, the development and
  testing environment. One command on a fresh install, `haicc .
  boot/deploy workbench haiccing/base-solution-workbench`, deploys it
  and, by its script run at the root, the docs mrepo, the host and
  Splectral beside it, in service. Its `main` holds the `howtos`
  namespace, where how-tos are installed by their key.
- **Splectral**, `local/splectral`: an app platform beside the host. It
  deploys its components with the boot protocol, installs their
  Splectral side (`splectral/install`) and serves them in a browser as
  a site, a tab each, a component's section in its content area; its server is the data layer, running the commands a
  component asks for as a terminal does. Its components are packages of
  the `splectral` organisation; the first is the help viewer.

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
  own mrepo's list and a script, `scripts/solution.haicc`, answered with
  every deploy of it and run at the deployer, deploying the others
  beside it; named by the segment it is deployed at (`workbench`).
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
  `<work>/mrepos/<unique URI>/`, its node in the registry
  `registry/<unique URI>`. Never a prefix of another's: no mrepo's
  folder inside another's.
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
- **hook**: what an mrepo runs on a status transition, a file a
  transition of simple commands: its runtime starting, its service's
  `initialise`, `start`, `stop`, `shutdown`.
- **script**: lines, each a simple command, run where the `haicc` points
  (`haicc <URI> haicc/script <URI> '<lines>'`).
- **continuation**: a script a command answers with, to go on with.
- **docs mrepo**: the install's documentation, every package's pages,
  read with `info/get`; any other mrepo answers about itself.
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
  `rns`, its own identity.
- **haici**: human ai continuous improvement, findings from the request
  log, fed back to the HDLC; its protocol records feedback on a command
  (`--flags feedback <text>`), the request log its store.
