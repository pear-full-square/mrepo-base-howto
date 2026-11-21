# base-docs-uri

How a URI is written in the base family: its names, relative to where it stands, and the data names inside it.

A URI names something in an mrepo, a node, a layer, a document. It is
written relative to where its writer stands, as `/`-separated parts,
each a name; inside it is an array of segments. A URI that selects is a
query, read by XPath. Validated once, at the boundary, into its
canonical form.

## Links

- [test](test/)
- [test-reports](test-reports/)
- [modules](modules/)

## Names

- **A part**: lowercase `a-z`, `0-9`, `-`. Any folder can become a
  branch and the other way round. `_` is reserved: see "Data names".
- **A file's part includes its extension**: a name, then optional
  `.`-separated extensions of the same characters (`request.md`). A leaf
  is an object, its storage format part of its name.
- **Every name is lowercase**, files included; uppercase names are
  external (`README.md`).
- **Case-insensitive coming in**: a URI is validated into its canonical,
  lowercase form; external content keeps its own case. Inside, paths
  match exactly.
- **No scheme, query or fragment**: `/`-separated parts only.
- **A name is never both a branch and a prefix.**

## Relative

- **No leading slash**: a URI is relative to where its writer stands. `.`
  is the position itself, and so is none given; `./x` is `x`.
- **From outside**, a command's writer stands at `main`: `.` is `main`,
  `host` is `main/host`. The outside reaches `main` and nothing else; a
  flag names another layer.
- **The mrepo itself**, a hook or a request of its own, stands at its
  root, above the layers, and names the layer first.
- **No `..`**: a running mrepo sees only forward; outside it is reached
  through a mapping.

## Segments

Inside, in a request's form, a URI is an array of segments, each a
relative URI of one or more parts: the prefix where its writer stands,
then the URI as written. From outside: `["main", "host"]`, `["main",
"."]`. Outside, a URI is one segment, as it is written.

## Selecting

A part may be `*`, and a part may carry filters, `[...]`: the URI then
selects, and is a query (the XPath documentation). A filter is kept as
written, checked for its brackets and quotes, and for the URI's own
rule: what is no quoted value in it is lowercase, as a name is. A filter
without a name filters the position itself, in front only:
`[state='started']`.

## Data names

The names of properties in records, values and headers, and of anything
that becomes an AVRO name.

- **lowerCamelCase**: `a-z`, `A-Z`, `0-9`, starting with a lowercase
  letter: `publicKey`, `readyMs`.
- **No two capitals in a row**: `dhtUrl`, not `dhtURL`.
- **Practically case-insensitive**: no two names that differ only in
  case.
- **One form in JSON, in memory and in AVRO**: a valid JSON key,
  JavaScript identifier, AVRO name and Kafka header key as it is.
- **In a URI, its URI form**: each capital becomes `-` and the letter in
  lowercase (`publicKey`, `public-key`); back, `-` and a letter become
  the capital. Exact both ways.
- **`_` is reserved**, in data names and URI parts alike: the one
  character left for an encoding, should one be needed.
- **Other mappings later**, at the boundary, for external names that
  break these rules.

## Data shapes

The shapes JSON data keeps, so that every value has an AVRO schema (the
team, 2026-11-21: "That will give us a natural flow into AVRO"). Rules
for what is written from now on; checked once the schemas are there.

- **An object is a record or a map, never both**: a record has known
  fields; a map has data keys only, its values one type. Fixed fields
  with open keys beside them become a field holding a map
  (`{"size":3,"nodes":{...}}`).
- **An array holds one type**: no tuples, no mixed items; a record with
  named fields instead.
- **A field has one shape**: one of a value or a record is fine; never
  sometimes one array or map and sometimes another.
- **Absent and `null` mean the same**: a missing field takes its
  default; nothing hangs on the difference.
- **Integers up to 2^53**; ids and counters beyond, strings.
- **Free-form JSON only at named edges** (a request's arguments, open
  headers): there, a declared `json` type (null, boolean, number,
  string, an array or a map of it).
- **Values that are names stay strings**: kinds, positions, URI parts
  (they have hyphens; an AVRO enum's symbols cannot).
- **Documents stay plain JSON**, validated as values against their
  schema; not AVRO's JSON encoding, which wraps unions.
