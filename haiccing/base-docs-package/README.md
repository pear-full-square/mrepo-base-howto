# base-docs-package

The base family's package specification: a package at compile time, and at run time the mrepo it makes, layer by layer.

Each folder here is a part of a structure unit; its README says what
goes there. `mrepo/` is the run time: the mrepo, each layer a page. Every
package of the base family follows it; the template a base package is
brought to.

Every organisation's packages follow it: haiccing's, and each
platform's (`myctral`, `myctrans`, `splectral`; `base-docs-haicc`,
"Platforms"). A platform's package template is very similar to this
one; what differs is the input source, the platform's own organisation.

## Links

- [mrepo](mrepo/)
- [test](test/)
- [test-reports](test-reports/)
- [name](name/)
- [example](example/)
- [howto](howto/)
- [modules](modules/)

## A structure unit

A folder, at any level: a package, a further unit inside it, a test, an
example. Every part is optional; a part present gives the unit what it
is for.

| part | the unit then |
|---|---|
| `run.js` | can be executed on its own: `bare run.js [arguments]` |
| `main.js` | its dispatcher, the bundle's main (generated): `run(target, { dryRun })`, every entry by path (`/run`, `/protocol`, `/deploy`, the tests: [test/](test/)); as the program, the target named, else `/run`; imported, nothing runs |
| `deploy.js` | brings structure beyond its protocols: its part of the mrepo and its requirements, to the parent's `boot deploy` |
| `protocol.js` | provides protocols: their configs and actions; linked into an mrepo, its protocols are loaded by the runtime; they are offered to the outside once activated |
| `modules/`, `package.json` | carries its own dependencies |
| `mrepo/` | comes with an mrepo, by layers |
| `scripts/` | has scripts: lists of commands to go on with after it is deployed, a file each (`<name>.haicc`, a simple command a line), answered as the deploy's continuation when asked for by name, sent on by the terminal as `haicc/script`; `solution.haicc`, with a list, makes it a solution: the mrepos an install is made of, deployed beside its own by that script, answered unasked with every deploy for the deployer's own position |
| `schemas/` | carries schemas: AVRO, a file each (`<name>.json`), named by its URI, `<org>/<package>/<name>`, its AVRO fullname by the data-name mapping (`base-docs-uri`, "Schemas"); sealed in its bundle, registered in the install's registry when it is deployed ("Schemas") |
| `howto/` | has how-tos: what can be done with it, a folder each (`<name>/`), its README the how-to: what it does and its steps as typed commands, each with why; a pattern's how-to names it, `Pattern: <name>`; pages of the package, read with `info` |
| `test/` | has tests and test sets |
| `test-reports/` | holds the proof that its tests passed: the report of its last pre-release |
| `<name>/` | holds a further unit, by its URI part name |
| `example/` | has examples |
| `README.md` | says what it is; a page of an mrepo's info |

## The rules

- One structure, many purposes: a definition, documentation in place,
  examples, tests.
- A package depends only on packages.
- A documentation package is marked `"docs": true` in its `package.json`:
  it brings no structure at deploy; its READMEs are pages of the info. Its
  dispatcher exposes its tests.
- Entry points, each optional: `run.js` (executed on its own),
  `deploy.js` (deployment only), `protocol.js` (protocol actions).
- A collection folder (`test/`, `example/`) holds units, a folder each;
  it is not a unit itself.
- Examples in `example/<name>/`, never a reference to another package.
- No install code in a unit: building an mrepo is the framework's.
- What a person reads is what the repository will hold: expanded folders,
  carried in the package's bundle and read from it by path.
- `modules/` is assembled, never edited by hand.
- **READMEs cascade**: a unit's README links to the README of each folder
  below it, in its menu ("READMEs"), and each of those to theirs, so from
  the top every folder is reached. The exceptions: no README inside a layer of `mrepo/` in a package
  that brings structure (it would be committed into it; `mrepo/`'s own
  README covers its layers; here, a documentation package, each layer has
  its page), and
  `modules/<org>/<module>/` brings its own (linked from `modules/`'s,
  written when the modules are assembled).

## READMEs

Every README is read by people and is a page of an mrepo's info, read
with `info/get` by its keywords. Its shape:

```markdown
# <name>

<one-liner>

<summary>

## Links

<a list of links, one a folder below>

## Included packages

<a list of links, one a package of its list>

## <section>
```

1. **One-liner**: the first paragraph, one sentence of at most 120
   characters, saying what the item is. No parentheses, no references.
2. **Summary**: everything up to the first `##` heading, at most 100
   words: what it does and how it is used. Everything else goes into
   sections.
3. **Self-contained**: nothing of where it was made, a place of the
   moment: neither its notes (`docs/`, `steps/`), nor a link to it
   (`dev-env-<n>`), nor a mention of it (the team, 2026-11-19; the code
   check finds the words). A README stands on its own or links within
   its package.
4. **Every README has a one-liner**, lists of tests included.
5. **Section titles are short, stable nouns** ("Usage", "API", "Tests",
   "Design"), at most three words, or a file's name, so a section can be
   asked for by name.
6. **The menu, `## Links`**, the first section: a list of links to the
   folders below, one each, a label and nothing more (`- [test](test/)`):
   what each is, its own README's one-liner says, once. The label is the
   folder's name. A README with no folder below has no menu.
7. **Included packages, `## Included packages`**, after the menu, in the
   README of a package that defines an mrepo only: the packages of its
   list (`mrepo/packages/layer.json`) but itself, in deploy order, each a
   link to its sibling, its name the label and `../<package>/` the
   target, as they stand beside each other
   here and in an mrepo's `packages/<org>/`.

8. **The keywords come from the menus**: the label is the keyword, in
   its URI form; a link may jump over folders, to a page further down (a
   package to its module's action: `[deploy](modules/<org>/<module>/external/deploy/)`).
   A category is a page whose menu groups what is below it. Each `##`
   section is a keyword below its page. A keyword may reach several
   pages: each a choice.
9. **Every page is reached** by a menu from the top; a link leads to a
   README; a README without a menu is the old form.
10. **No link to a report file**: what is tested must not depend on a
    report (a package's content hash leaves its reports out).

The generic `info` test checks them in every package
(`mrepo-base-info`).

## Schemas

A package's types, carried with it and registered where it is deployed
(`mycelium-value-avro`).

- **Where**: `schemas/<name>.json`, one AVRO schema a file, in the
  package; a module's in its own `schemas/` (`modules/<org>/<module>/schemas/`),
  named by the module's place (`pear-full-square/<module>/<name>`). A
  `README.md` beside them, a line each.
- **Its name its URI**: the file's name is the name's last part, and the
  schema's AVRO `name` its fullname by the data-name mapping:
  `haiccing/base-package-help/schemas/annotate-answer.json` is
  `haiccing.basePackageHelp.AnnotateAnswer`.
- **Its identity its fingerprint**: a schema never changes; a new version
  is a new schema, a new fingerprint, kept beside the old.
- **Registered at deploy**: placing a package registers every schema its
  bundle carries, its own and its modules', in the install's registry:
  the creator registers. An index, not a gatekeeper: a valid schema is
  never refused; one that is not valid AVRO stops the deploy.
- **Read with `info`**: `info/get schemas`, every schema an mrepo's
  packages carry, by URI and fingerprint; a binary record is decoded by
  `crud/read`.

## Modules

A unit's dependencies, with the `package.json` listing what it starts
from. Assembled from those modules, all the way down; never edited by
hand.

```
modules/
  <org>/<module>/      ours, copied whole
  node_modules/        the third-party code, and links to ours by name
  third-party.json     each third-party module: version, licence, where from
```

The unit's code reaches it by relative path:
`./modules/<org>/<module>/index.js`. Our modules find each other by name,
through `modules/node_modules/`.

In a package, `modules/README.md` is generated when the modules are
assembled: it links to each of ours.

## Methods

Inside one of our modules, a documented method is a directory: its
`index.js` and its `README.md`, under one of two folders.

- `external/`: the methods mounted as protocol actions, `(exec, form)`.
- `internal/`: the methods called by code, never requested.

Only the methods that matter are documented. Smaller ones live in the
method they belong to, listed in its README under "Also exported"; a
helper with nothing to document is a plain file. A method's README: the
one-liner, the summary, then `Signature`, `Arguments` for an action, `Returns`,
`Errors`, as they apply. The module's `index.js` exports its methods.

## Logging and handling

Checked by the code test, read from a module's own code (its tests
aside). What is decided in the code is said there, in a remark on the
line or right above it: `// log: ...`, `// catch: ...`, `// console: ...`,
`// time: ...`.

- **A request's log is its record.** An action logs through the
  execution context: `exec.log(level, event, data)`, and
  `exec.step(event, data, fn)` for a step, which the context measures.
  Nothing is printed: a print that is meant says why (`// console:`).
- **Three levels of detail**: `info`, `verbose`, `debug`; `error` and
  `warn` are always kept. `info` is the request's standard, its metrics
  and its audit, made at the boundary for every action; an action adds
  at `info` only the meaning of what it did. Its steps go at `verbose`,
  its internals at `debug`.
- **Every function handed the execution context logs**, or says where
  its entries are, or why it has none (`// log:`): a decision, not a
  default.
- **What is the request's is not done by an action**: it takes no time
  itself (a step is measured for it), writes no entry of the boundary's
  kind (`request.*`, `train.*`), and does not return its own failure as
  a value: it throws, and the request records it.
- **An error is caught at the request.** In between, a catch has one of
  two reasons. To go on: it uses the error, or says what it expects
  (`// catch:`); for a file that may not be there, `exec.find` gives
  `null` and lets everything else through. To say more: the error it
  throws carries the one caught, `{ cause }`.

## package.json

```json
{
  "name": "base-package-example",
  "description": "An example package.",
  "private": true,
  "license": "MIT",
  "type": "module",
  "main": "run.js",
  "modules": ["<org>/<module>"],
  "template": { "repository": "haiccing/base-docs-package", "commit": "<commit>" },
  "scripts": { "test": "bare test/run.js" }
}
```

`modules`: our modules the unit starts from; what they use is worked out
from them ("Modules", above).

`platform`: a platform's package only, the organisation of its
components (`"platform": "splectral"`; `base-docs-haicc`, "Platforms").
A list of that organisation is the platform's component, the pattern
`<org>-component`.

`template`: the commit of this template the package was brought to ("From
the template", below).

## A new package

A clone of the best candidate among the packages there are, brought to
the template and renamed: the `package` how-to (`howto/package/`), and
the how-to of each pattern the new package implements (`howto/`).

## From the template

A package starts from this template and is self-contained: it holds its
own copies of what the template gives every package, the generic tests'
folders in `test/` and the folder `test-reports/`.

It is pinned: its `package.json` names the commit of the template those
copies were taken from. A change of the template changes no package.
Bringing a package to a newer template is an explicit step, taken for
that package when appropriate: the copies taken again, the pin moved, the
package tested.

## Running

A package is released as one bundle, its main the dispatcher (`main.js`),
and run with Bare:

```sh
bare <package>.bundle [arguments]
```

A target first runs that entry (`bare <package>.bundle /test/validate`).
From its folder, the same: `bare main.js [target] [arguments]`. Imported, a
bundle runs nothing: a runtime takes its protocols (`run('/protocol')`), a
deploy its structure (`mrepo/`, read from the bundle).

The boot is a bundle like the others. What has to be there before any
bundle can run, Bare and the sources, is put in place by the `haicc`
scripts (`haiccing/base-linux-haicc`), which are plain sh.

```sh
haicc boot/deploy
```
