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
  string, an array or a map of it):
  `pear-full-square/mycelium-value-avro/json`, the value as its JSON
  text.
- **Values that are names stay strings**: kinds, positions, URI parts
  (they have hyphens; an AVRO enum's symbols cannot).
- **Documents stay plain JSON**, validated as values against their
  schema; not AVRO's JSON encoding, which wraps unions.

## Core types

A core type and its variants: a design principle (the human, 2026-11-21): "we mean the same thing with
more or less detail and the detail depends on the context it is being
used in"; "it will allow us to deal with all sorts of extensions while
at the same type have a base type that can travel broadly. This
constraint creates a dual namespace from a single string: core type in
the name, variant in the namespace context."

- **One string, two parts**: a type's full name is
  `<namespace>.<name>`; the name is the core type, the namespace the
  context of its variant. `haiccing.basePackageRns.logEntry` and
  `splectral.baseComponentLogViewer.logEntry` are one core type,
  `logEntry`, in two variants.
- **A base type travels broadly**: a reader holding the base reads every
  variant, their extra detail skipped; a variant reads the base, its own
  detail from its defaults. AVRO resolves a record by its name without
  the namespace, the core type, so this holds as AVRO is.
- **More or less detail, by context**: a variant extends its core type
  within AVRO's rules (fields added with defaults, fields left out,
  numbers widened, unions extended); where it is read decides how much
  detail is read.
- **The namespace from the URI**: a schema's URI is
  `<org>/<package>/<name>` (`haiccing/base-package-rns/log-entry`); its
  full name by the data-name mapping, exact both ways
  (`haiccing.basePackageRns.logEntry`).
- **Is and is-like**: one core type, its versions and variants, is read
  as AVRO reads it; a different core type is read as another only when
  asked (is-like: aliases generated for that read).
- **Typed topics** (the human, 2026-11-21: "Better to work in typed
  topics to keep structure. The structure of every log is the same at
  the kafka level, but the type is the value type - that is the data
  payload"): every topic has a Kafka record's structure (`key`,
  `value`, `timestamp`, `headers`); what it holds is its value's core
  type, and it is named by it (`request-summary`), never by a generic
  word ("log"); whose it is, is where it is (a node mrepo's
  `request-summary` topic).
## Schemas

A schema's name is its URI, where it comes from; its identity its
fingerprint (`mycelium-value-avro`).

- **Named by its URI**: `<org>/<package>/<name>`, a module's
  `<org>/<module>/<name>`: `haiccing/base-package-help/annotate-answer`.
  Each part a data name's URI form ("Data names").
- **Its AVRO fullname by the data-name mapping**, exact both ways, each
  part its data name: `haiccing.basePackageHelp.annotateAnswer`; the
  name the core type, the namespace its variant ("Core types"). A
  schema whose name does not map is still a schema, known by its
  fingerprint only.
- **Its fingerprint**: the AVRO specification's CRC-64-AVRO of its
  Parsing Canonical Form, 16 hex digits, a name: a schema
  never changes; a new version, a new fingerprint.
- **A record names its own**: a topic is not bound to one schema; each
  record carries its schema's fingerprint (AVRO's single-object
  encoding), each level of it its own ("Data shapes": the `json` type
  where nothing is typed yet).
