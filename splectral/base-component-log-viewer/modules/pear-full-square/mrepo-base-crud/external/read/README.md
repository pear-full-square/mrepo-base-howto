# read

Reads the nodes a URI selects: each with its document and the names of its children.

A URI names one node, or selects: it is a query (`xpath`, the docs mrepo's
keyword, says what of XPath is built). A `*` selects every child; a filter keeps the
nodes whose document it holds for: `swarms/*[state='started']`,
`swarms/*[size>2 and owner/name='ann']/nodes/*`. A leaf in a filter is a
key of the node's document, in its URI form: `publicKey` is written
`public-key`. Nothing there selects nothing: an empty
array, not an error.

## Logical and physical

`--flags logical` reads a topic as its records, the latest first, each
under its address (`done/*[@offset=<offset>]`), nothing of how it is
stored in the answer; `--flags physical` reads the layer as it is
stored (`mrepo-base-xpath`, `query`). With neither, the mrepo's setting
says (`/runtime/xpath.json`, `reading`); with no setting, physical.

A topic read logically answers its node set and one slice of its nodes,
`{ nodeset, nodes }`: `nodeset` its metadata (what was asked, how far it
is read, `done` when nothing is left), its id the request that made it.
The same read given that metadata as its argument answers the next
slice, under the same id, on from where the first ended; nothing is
kept at the mrepo between the two. Who asked holds it as a result that
is iterated, the next slice a request underneath (`mycelium-xpath`,
`answered`).

## Signature

`read(exec, { uri, args })`: requested as `crud/read <URI> [<node set>]`,
the node set as an earlier answer carried it (JSON).

## Arguments

1. A node set, optional: its metadata as an earlier answer of this read
   carried it (`nodeset`), JSON: the answer is its next slice.

## Returns

`{ nodeset, nodes }` for a topic read logically, and for a read given a
node set: `nodes` as below. Otherwise an array of nodes:

```
[{ "uri": ["main", "swarms"], "value": {}, "children": ["swarm-1"] }]
```

- `uri`: in the internal format, its segments.
- `children`: by name only; `crud/read swarms/*` reads them.
- `shortcuts`: only at a node that is a link: the mrepos its data comes
  from, `[{ "mrepo": "local/host" }]`.

The layer itself, `.` from outside, is a node: its document `{}` when it
has none.

A URI that goes on inside a node's document selects the value there:
`crud/read swarms/swarm-1/owner/name` gives `[{ "uri": [...], "value":
"ann" }]`.

A file is its own document, JSON or its text: `{ "uri": [...],
"value": ... }`. So the records of another layer are read:
`crud/read done/* --flags layer=request`. A folder without a document
is not among them, nor a layer's own config (`.layer.json` at its root).

A binary record, AVRO in its single-object encoding (`.avro`), is
decoded by the install's registry (`mycelium-value-avro`, its folder
beside the packages in the store the mrepo's packages manifest names),
every level in its place, as each was written: the record, its value,
what that carries (`unfold`); bytes that are no level of it as base64
text. A fingerprint the registry does not know is an error. A filter
reads JSON documents only.

## Errors

- A query that does not read.
- A URI that runs through a shortcut, a filter on one too: what is below
  one, and its document, is read in the mrepo it leads to, with a `haicc`
  at it.
