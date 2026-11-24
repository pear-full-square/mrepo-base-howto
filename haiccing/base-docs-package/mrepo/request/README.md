# /request

The requests, as they move. Non-atomic. A request is one document,
named by its offset (13 digits: the milliseconds when it arrived), in
one of the layers at a time, the same name in each; each move a commit.
`done` only grows: its documents are kept in folders by the offset's
digits, `done/17953/179531/<offset>.json` (its `.layer.json`:
`stream`).

| layer | |
|---|---|
| `pending/default` | waiting, in the order they arrived; a preloaded request here runs first |
| `execute` | a completed request, merged in from its own branch, on its way to `done` |
| `done` | each finished request, refused ones too, in the order done: the history |

An error goes into the request it happened to.

## Flags

What is asked of the way a request is handled, beside what it asks for.
Written after a URI, after the word `--flags`, space separated: the
flags of that step. A flag stands alone, or carries a value,
`key=value`, no space.

```
haicc host --flags log=debug -- haicc node-1 crud/read swarms
haicc host crud/read swarms --flags log=verbose
```

- **A list is closed by `--` or by the end of the command**, nothing
  else: every word in between is a flag. Where a command follows, the
  `--` says where it starts; left out, the command is taken for flags,
  and that is said. After the URI of the last command the list runs to
  the end of the line, or to a `--` with the command's arguments after
  it.
- **In the form** they are a map: `"flags": { "log": "debug" }`.
- **A flag holds down a chain until changed**: one written at a step
  goes with each command sent on from there; one written after the last
  command's URI is that command's.
- **A flag that is none**, or a value its flag does not take: ignored,
  with a warning in the request's log. The rule (the human): "wrong flag
  or issues with underlying functionality don't throw errors but
  warnings": a flag whose target is not there is a warning too, nothing
  thrown.
- The flags there are: `log`, below, `layer`, `continuation` ("A
  continuation", further down), and `container`, a routing directive:
  `boot/deploy`'s child deployed into a container, on the container's
  own haicc install (`mrepo-base-boot`'s `deploy`).

### The layer

A request from outside stands at `main`: its URI is read there. That is
a default, and a flag changes it: `layer=<name>` reads the command's own
URI at another layer.

```
haicc . crud/read "done/*[value/value/protocol='boot']" --flags layer=request
haicc host crud/read done/* --flags layer=request
```

- **The routing stays in `main`**: the URI of `haicc <URI>` is a
  position, and positions and shortcuts are `main`'s. The flag goes on
  with the command, down the chain, as any flag.
- **What is offered there** is what each protocol's config says, as at
  `main`: no door is closed with the layer.
- **A record is a file**: `crud/read` answers with its document.

## The log

A request's log is in its own record, `log`: its entries, each
`{ level, event, time, ... }`, its numbers in fields of their own (`ms`,
counts).

| level | |
|---|---|
| `error`, `warn` | always kept: what stopped the request (`request.failed`: the error, its causes, the step it was at, what was undone); what was got over |
| `info` | without a flag: what the request changed, a target a line (`request.changed`: the paths added, changed, removed); where it was sent on; its metrics, the closing line (`request.metrics`: `ok`, `ms`, reads, selects, puts, removes, commits); and the meaning of what its action did |
| `verbose` | `--flags log=verbose`: the action's steps too, each with what it took and what it read and wrote |
| `debug` | `--flags log=debug`: its internals too, and the boundary's own steps (`train.*`) |

An action's entries are stored under its protocol and action:
`crud.read.select`. The entries of a request a command was sent on to
come back with its response, each under its `jump`: the positions gone
through.

## Internal requests

A request comes from the inbox, or from the mrepo itself. Either way it
passes one handler into `pending/default`; the inbox itself checks nothing.

- **From the inbox**: the handler validates it: addressed to this mrepo,
  offered by its API.
- **Internal**: placed by the mrepo's runtime or by an action, straight to
  the handler, never through the inbox. It carries no mark: a request is
  internal when the inbox, which keeps its history, has no record of it. A
  preloaded request is internal too.
- **As it executes**, an internal request needs no API and does not wait
  for the service to be started. The service's own actions stay under its
  state machine, whoever asks.
- **Before the mrepo is operational**, the runtime takes nothing from the
  inbox: its own requests come first, such as `info/extract`. The
  inbox's records wait.

## A continuation

A command may answer, beside its output, with a script to go on with:

```json
{ "output": { "deployed": "host" },
  "continuation": { "at": "host", "script": "service/initialise\nservice/start\n" } }
```

- **`script`**: lines, each a simple command; at most 64 KiB. **`at`**:
  the position it is for, from the root.
- **The terminal goes on with it**: the `haicc` command sends it to the
  root as one command, `haicc/script <at> '<lines>'`; the lines run at
  that position, each after the one before, the first that fails ending
  it and failing the command.
- **Through a shortcut** it comes back with the response, its position
  behind the one the command was sent on at.
- **Who answers with one**: an action, when it has something to go on
  with, run in the context of the command it continues. A deploy does
  not: what a package does once deployed is its `commission` hook,
  run in the mrepo itself (`mrepo/runtime`).

## Commands sent on

A command at a shortcut is not executed where it arrived. `haicc <URI>
<command>` goes to the positions the URI selects and executes the command
at each (a URI that selects: a list of what each gave); where the URI
reaches a shortcut, the command that follows is sent to the mrepo linked
there, and that mrepo's response becomes the request's result.

- **Sent on**: the hop takes its own `haicc <URI>` off, and the rest is
  delivered as it is to the other mrepo's inbox. Where the URI runs on
  through the shortcut, what is left of it goes in front, a `haicc`
  there. On the same node that is direct: a file dropped into its
  inbox folder. Another node needs dispatch, which is not built.
- **Waiting**: the request's processing ends there. Its principal, on
  its own branch, now says which child it waits for. The mrepo goes on
  with its other requests.
- **The response** is collected from the other mrepo's outbox folder and
  comes in through `pending/default` like any request of the mrepo's own.
  At the front of the queue it is not begun as a request: it is added to
  the principal's branch, and the principal is returned with it. Both move
  on to `done`; the response is not sent anywhere else.
- **Checked by the mrepo that executes it**: the command that follows is
  interpreted and checked where it lands.

```json
{ "command": ["haicc", "host", "info/get", "haiccing"],
  "protocol": "haicc", "action": "goto", "uri": ["main", "host"],
  "args": ["info/get", "haiccing"],
  "remote": { "at": "host", "folder": "../local/host", "key": "…" },
  "output": { } }
```

