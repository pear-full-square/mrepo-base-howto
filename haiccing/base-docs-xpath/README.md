# base-docs-xpath

What a query is in the base family: XPath over an mrepo, stopping at a shortcut, the hops across mrepos through haicc.

A URI that selects is a query: standard XPath's forward part (XPath
2.0), built in phases. Within one mrepo a query walks its tree, nodes and the documents
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
| filter | a position compared: `position()`, `last()`, `+` and `-` between numbers | `*[position()<=50]`, `*[position()>last()-50]` |
| function | `name()`, `starts-with()`, `contains()` | `*[starts-with(name,'s')]`, `*[name()<'1795482773435']` |
| value | a quoted text, a number; `@leaf` is `leaf` | `'sam'`, `3` |

Refused, and said as such: descendants (`//`), the union (`|`), a bare
number joined with something else, the axes written out (`::`), a filter
inside a filter, the other functions. The parent
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
- **Comparing**, as XPath 2.0: with a number on a side, as numbers; two
  texts as text, an order (`<`, `>`) too: names of one length that are
  digits order as their numbers do. A filter that compares several
  values holds when one of them does.
- **A position** is the place of a node among those the step selected
  under the same parent, in the order they came: alone in its filter
  (`[2]`, `[last()]`), or compared (`[position()>last()-50]`: the last
  50). A filter of positions and names alone reads no document: a range
  of a folder costs its listing.

## Standard only

- **XPath 2.0's forward part**, in phases; nothing that looks back or
  up. 2.0, not 1.0 (the human, 2026-11-24: "why not sticking with xpath
  2?"): it is typed, as data with a schema is; it works on ordered
  sequences, as a topic's records are; it orders text as text. What was
  built to 1.0 is 2.0 too. A form outside the standard is not built:
  `starts-with()` and `contains()` say what a wildcard in a value
  would.
- **A leaf in a filter** is a child holding a value: a document's key
  with a value under it. `@name` is accepted and means the same as
  `name`.
- **A name in a filter is a URI's**: lowercase, by the URI's rules; a
  document's key in its URI form, `[owner/public-key='k1']`.

## Attributes

An attribute is a leaf: a field holding one value, written `@name`. It
is never an object.

- **A leaf or a node, nothing else.** A field with one value is an
  attribute (`@offset`, `@timestamp`); a field with structure is a
  node, navigated by path (`value/...`, `headers/...`).
- **The schema says which, where there is one.** In AVRO a field of a
  primitive type (a string, a number, a boolean, a timestamp, an enum,
  or one of those that may be null) is an attribute; a record, a map,
  an array, or bytes that carry the next level is a node. This is known
  before any data is read.
- **A record's own fields are attributes, its data is below `value`.**
  The base record (`mycelium-value-avro`, `record.json`) gives
  `@topic`, `@key`, `@offset`, `@timestamp`; and the nodes `headers`
  and `value`: `*[@offset>1795312345678]`,
  `*[@offset=1795312345678]/value/value/output`.
- **JSON follows the same rule.** Without a schema a leaf is found from
  the value at hand: a key holding a value that is no object. JSON
  documents are brought in line with AVRO's schemas, so that what is an
  attribute is said the same way for both.
- **Built now**: in a filter `@name` means the same as `name`, and a
  leaf is a key with a value under it; the engine does not yet tell
  the two apart (`[@value]` holds where `value` is there, structure or
  not), and `@name` is not a step (`*/@offset` is refused).
- **To come, with AVRO**: the attribute taken from the schema; `@name`
  refused on a field that has structure; `@name` as a step, selecting
  the value; a query checked against the schema before it reads; an
  index is on an attribute, the offset the first.

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
