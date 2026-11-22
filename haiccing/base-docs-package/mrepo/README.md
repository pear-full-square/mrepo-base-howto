# mrepo/

The mrepo: what a package lays in, by layers, and what each layer holds and does when it runs.

An mrepo is a repository that runs: its data in layers, git branches,
and a runtime executing the requests posted to it. A package's `mrepo/`
is its part of an mrepo, laid out by layers as the repository will hold
them; the URIs are the same, `mrepo/main/…` is `/main/…`. Here each
folder documents a layer.

## Links

- [main](main/)
- [runtime](runtime/)
- [packages](packages/)
- [protocols](protocols/)
- [info](info/)
- [links](links/)
- [inbox](inbox/)
- [outbox](outbox/)
- [request](request/)
- [execute](execute/)

## A package's part

```
mrepo/
  main/                     layer.json  the mrepo's content
  runtime/                  layer.json  the runtime's data: service state, hooks
  packages/                 layer.json  the packages to source, in its layer.json
  <layer>/                  layer.json  any other layer the package brings
```

- **A leaf** is a folder holding a `layer.json`; the folders above it
  only group. A leaf's files are committed with it, `layer.json` too, so
  no folder is empty.
- **`layer.json`**: `{ "mode": "atomic", "description": "..." }`, its mode
  below.
- **No README inside a layer** of a package that brings structure: it
  would be committed into it. A layer explains itself in its
  `layer.json`, and here.

## The rules

- Every path starts with its layer, from the root: `/main/notes/a.json`.
- A URI in a request is relative, without a leading slash: "Requests",
  below.
- Layers are disjoint, never merged into each other.
- One writer per branch.
- The repository is the truth; a folder on disk is a view of a commit.
- Writes are commits only, never files edited in place.
- No log of its own: a request is its own record, its `log` in it,
  `request/done` the history.

## Modes and storage

Each layer has a mode, in its `layer.json`:

| mode | written | layers |
|---|---|---|
| atomic | one commit at a time, by the runtime | `main`, `runtime`, `protocols`, `info` |
| replicated | as atomic, also copied out as files | `packages` |
| non-atomic | its own writers, in parallel | `inbox`, `outbox`, `request/*`, `execute/*` |

Where the layers are stored:

| storage | |
|---|---|
| `filesystem` | p2p-git, every layer on the filesystem, in the mrepo's own folder: `<dir>/.git` |
| `p2p` | atomic and replicated layers in a Corestore (replicated to peers), the others on the filesystem |
| `git` | native git, on the filesystem |

Request and execute layers are always on the filesystem, whatever the
storage.

## The mrepo's folder

An mrepo is a folder, `<dir>`. The first, the boot mrepo, put in place by
`base-component-boot`, is `<work>/mrepos/boot/`; every other is placed by its
unique URI, side by side with it: `<work>/mrepos/<unique URI>/` (the
host: `mrepos/local/host/`). The mrepo that deployed it has a node for it
in `main`, a shortcut: the link, nothing of its data; and a record in its
`links` layer: where it is on this machine: the managing mrepo's, in
forward visibility only. The install's registry, for its system
administration, is the work folder's `mrepos/` itself, made at the
initial boot with `scripts/` beside it: nothing in an mrepo copies it.
A running mrepo sees only forward
(a URI has no `..`); outside is reached through a mapping (the work
folder's package store, named in its packages manifest).

Every mrepo has a unique URI in its runtime layer, a path: its namespace,
then its name (`<swarm>/<node>`). What the boot mrepo creates is
`local/<name>`: the boot mrepo is `local/boot`, the host `local/host`.
Its inbox is addressed by it: `/local/host/inbox`. An mrepo deployed
below `main` is in its parent's namespace, unless a node above it says
it is a namespace (its kind), the nearest:

- **A swarm**, `{"kind":"swarm"}`: its name the namespace. A swarm's node
  is deployed at `swarms/<swarm>/<name>`, below its swarm's node:
  `swarm-1/node-1`, placed at `<work>/mrepos/swarm-1/node-1/`.
- **A `howtos` node**, `{"kind":"howtos"}`: the root of a namespace, the
  path below it the unique URI; a how-to's key, `<org>/<package>/howto/<name>`,
  then its mrepo's name: `howtos/haiccing/base-package-crud/howto/query/boot`
  is `haiccing/base-package-crud/howto/query/boot`, placed at
  `<work>/mrepos/haiccing/base-package-crud/howto/query/boot/`.
  What that mrepo deploys is in its namespace, beside it
  (`.../howto/query/host`), a swarm's nodes too.

**The rule**: a unique URI is never a prefix of another's (`swarm-1` is a
prefix of `swarm-1/node-1`, and no mrepo): no mrepo's folder inside
another's. A deploy that would break it is refused, nothing built.

A swarm's node can have a replica in a container, made by the
`container` protocol (`base-package-container`): a second mrepo, its
unique URI the node's with `container` behind it
(`swarm-1/node-1/container`), its folder beside the mrepos:
`<work>/containers/<unique URI>/`, the one folder its container can
write. The node on the host, the bridgehead, links it at the position
`container` and reaches it through its inbox and outbox folders, as any
linked mrepo.

A node can instead run in a container on its own haicc install, a pair
(`boot/deploy <position> <package> --flags container`, `mrepo-base-boot`).
The container's haicc home is a folder of the host's,
`<work>/containers/<unique URI>/`, mounted into it, the host's sources
read only at their own paths; it boots itself, and its own boot mrepo
deploys the node at the same position, by the same unique URI. The host
keeps a link (`how: container`) to the node's folder inside it and no
runtime of its own for it:

- **Commands for the node** go as to any linked mrepo: a file in its
  inbox folder, the answer from its outbox folder.
- **Platform commands on it** (its deploy, teardown, redeploy) go to the
  container's boot mrepo, through its inbox, and are executed there.
- **The host never starts, stops or signals** its runtime, nor uses an
  absolute path read from its data; the container is the host's, through
  Docker (`--init`, as the host's user), found by the folder it is
  labelled with.

```
<dir>/
  .git/          its layers
  inbox/         input through the filesystem: a record written here is committed
  outbox/        output: each record committed is written here too (there from the start)
  packages/      its packages, hard linked, for Bare to run
  runtime.sock   its runtime's local connection (status, stop)
```

No other layer has a folder: it is read from the repository.

## Records

Scope: the data the platform produces and keeps as records:
configuration, audit, metrics, events, state.

- **Two levels, side by side in a repository.** Records in topics are
  the lower level. Objects (`.md`, `.js`, a JSON document, any git
  object) are the higher level: they exist in their own right, without a
  record level under them. An object may also be generated from records:
  a change log of records, in a topic, whose fold is the object (a git
  tracked file generated by its change log). The record level is never
  required.
- **The elementary data container is a Kafka record**, compatible with
  Kafka's record. Partial for now: only the properties needed so far,
  each added later with Kafka's name and meaning.
- **The data is the record's `value`**; its schema is the data's schema.
  Additional metadata goes in the record's `headers` (the header values'
  schema is open).
- **Data lives in topics, in Kafka's sense**, single-partition for now,
  with Kafka's functionality built basic and evolving (towards mycelium's
  p2p Kafka). State is never written directly: it is built from topics.
- **Kafka's names, wherever possible**, with Kafka's meaning: record,
  key, value, timestamp, headers, offset, topic, partition, segment,
  producer, consumer, committed offset, retention, log compaction. Our own
  additions get names of their own and say so (archiving, sealing).
- **Property names are data names** (the URI documentation), in
  records, values and header keys. Kafka's own property names already
  are.
- **JSON first.** AVRO later, with values in the form avsc gives them now.
- **Never a secret** in any property of any record.

## A request

A record, as an onion: a form (the request) in an envelope (where it is
going). Its key, a GUID, names its document in every layer.

```json
{
  "topic": "/local/boot/inbox",
  "key": "7b0c1f4e-2d3a-4c5b-9e6f-0a1b2c3d4e5f",
  "timestamp": "2026-11-10T00:00:00.000Z",
  "headers": {},
  "value": {
    "topic": "/terminal",
    "key": "7b0c1f4e-2d3a-4c5b-9e6f-0a1b2c3d4e5f",
    "timestamp": "2026-11-10T00:00:00.000Z",
    "headers": {},
    "value": { "protocol": "service", "action": "start", "uri": "." }
  }
}
```

The envelope's `topic` is where it goes; the core's, where the completed
form goes back. Each move replaces the envelope; the core never changes.
Processing completes the form: its `output`, or the `error` that stopped
it.

The request itself is a form, `{ protocol, action, uri, args }`, the
arguments a list, unnamed. It can also be given as a command, as it is
typed: its parts in order, `<protocol>/<action> <URI> <argument>...`.

```json
"value": ["haicc", "host", "service/start"]
```

The mrepo interprets it on its way in. The protocol alone takes its
default action: `haicc` is `haicc/goto`.

A URI in a request is relative: it has no leading slash and is read from
where its writer stands. `.` is the position itself, and so is none
given; `./x` is `x`.

- **From outside** the writer stands at `main`: `.` is `main`, `host` is
  `main/host`. The outside reaches `main` and nothing else.
- **The mrepo itself**, a hook or a request of its own, stands at its
  root, above the layers, and names the layer first: `protocol/activate .
  info`.

Inside, in the form, a URI is an array of segments: the prefix where
its writer stands, then the URI as written. From outside that is the
prefix `main` and one segment: `["main", "host"]`, `["main", "."]`.
Outside, a URI is one segment, as it is written. What an action is
about, when that is not where it is executed, is an argument: `runtime/run . packages/<org>/<package>/test/validate`.

Its way: `inbox` → `request/pending/default` → `request/execute` →
`request/done`, and back through the `outbox`. Order is the commit chain.
Requests are checked at the inbox, and again as they execute.

## Deploying an mrepo

`boot deploy <name> <package>`, executed by the parent, names a target
package; the target's `mrepo/packages/layer.json` lists the packages the mrepo is made
of, in order.

1. **Laid in**: each listed package's `mrepo/` part, read from its bundle,
   in that order (a later file replaces an earlier one), into
   `<parent>/main/<name>/`. Runtime config comes from the last package of
   the list only: the one that defines the mrepo.
2. **Built**: each layer committed; the boxes' folders made.
3. **Its packages linked**, individually, from the work folder's store.
4. **Its runtime started**, from its own `packages/`, by its folder:
   `bare <dir>/packages/haiccing/base-package-runtime.bundle <dir>`.
5. **Its shortcut placed** in the parent's `main`, at its position: a
   node, and its link beside it.


