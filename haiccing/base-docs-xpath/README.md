# base-docs-xpath

What a query is in the base family: XPath over an mrepo, stopping at a shortcut, the hops across mrepos through haicc.

A URI that selects is a query: standard XPath's forward part, built in
phases. Within one mrepo a query walks its tree, nodes and the documents
beside them, and stops where a shortcut leads to another mrepo. Going on
from there is a hop, `haicc`'s: the rest of the query is sent to the
mrepo the shortcut leads to. How a URI is written: the URI
documentation.

## Links

- [test](test/)
- [test-reports](test-reports/)
- [modules](modules/)

## A query

Phase 1, built:

| | | example |
|---|---|---|
| step | a child by name, any child, the node itself | `swarms/swarm-1`, `swarms/*`, `.` |
| filter | a leaf compared: `=`, `!=`, `<`, `<=`, `>`, `>=` | `*[name='sam']`, `*[size>2]` |
| filter | a leaf is there; a leaf by a path | `*[name]`, `*[value/uri='main/host']` |
| filter | `and`, `or`, `not()`, brackets; several in a row | `*[size>2 and name='sam'][state]` |
| filter | a position, alone in its filter, from 1; the last | `*[2]`, `tags[last()]` |
| function | `name()`, `starts-with()`, `contains()` | `*[starts-with(name,'s')]` |
| value | a quoted text, a number; `@leaf` is `leaf` | `'sam'`, `3` |

Refused, and said as such: descendants (`//`), the union (`|`),
`position()` and a position joined with something else, the axes written
out (`::`), a filter inside a filter, the other functions. The parent
(`..`) is not built: a query looks forward only.

## Its meaning

- **It parses, processes and continues**: a segment, the steps up to a
  filter or the end, is walked; a filter makes the set smaller; and so
  on.
- **A node's document continues the tree below it**: a step that names
  no child is looked for among the document's keys. A list is a child
  that repeats: its key names every item, in order, a position picks
  one.
- **A document's key in its URI form**: `publicKey` as `public-key`.
- **Comparing**: a number as a number, an order (`<`, `>`) as a number;
  anything else as text. A filter that compares several values holds
  when one of them does.
- **A position** is the n-th of the nodes the step selected under the
  same parent, in the order they came.

## Standard only

- **XPath 1.0's forward part**, in phases; nothing that looks back or up.
  A form outside the standard is not built: `starts-with()` and
  `contains()` say what a wildcard in a value would.
- **A leaf in a filter** is a child holding a value: a document's key
  with a value under it. `@name` is accepted and means the same as
  `name`.
- **A name in a filter is a URI's**: lowercase, by the URI's rules; a
  document's key in its URI form, `[owner/public-key='k1']`.

## Commands over nodes

- **Every command is a map over the nodes its URI selects**: one node,
  none or many alike. `crud/read swarms/*` reads each node selected.
- **The routing URI is a query too**: `haicc <query> <command>` executes
  the command at each position the query selects, and sends it on with
  what is left of the URI where it reaches a shortcut.
- **What a request answers is the action's own**, any data: what a URI
  resolves to is always an array of nodes; a command run at several
  nodes answers with what each gave, listed.

## Shortcuts

- **A shortcut** is a node in `main` whose data comes from another
  mrepo: beside its document, under a hidden name, the sources it comes
  from, each by its unique URI and its link's key. Where it leads on
  this machine is the mrepo's own, in its links layer.
- **A query stops at a shortcut**, with what is left of it: the rest, a
  query from that node as its root. A filter on the node it stops at
  goes with it.
- **Every mrepo has a unique URI**, a path, `<namespace>/<name>`:
  `local/host`, a swarm's node `swarm-1/node-1`, a how-to's mrepo
  `haiccing/base-package-crud/howto/query/boot`. A shortcut names the mrepo it leads to
  by it.

## Hops

- **Within one mrepo, XPath is internal**: every protocol uses it to read
  its own mrepo, nobody requests it.
- **Across mrepos, it is `haicc`'s**: `haicc/goto` takes a command to
  the position its URI names, executed there, or sent on at a shortcut
  with what is left of the URI. One hop is built.
