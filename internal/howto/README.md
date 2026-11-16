# howto

Reads a how-to from its README, checks its form, and makes an mrepo's howto layer from its packages' how-tos.

## Signature

- `parse(text)`: a how-to's README read.
- `check(text)`: the rules on its form.
- `extract(packages)`: the layer's files. `packages`: `[{ pkg, files }]`,
  a package and its how-to READMEs by bundle path
  (`/howto/<name>/README.md`).

## Returns

- `parse`: `{ title, oneliner, activity, steps, problems }`. `steps`:
  `[{ why, command }]`, the `#` lines above a command joined as its why.
  `activity` is `null` when it has none that is a word.
- `check`: `[[check, detail]...]`, none expected. `check` is `activity`
  or `steps`.
- `extract`: the files by path in the layer: `/index.json`,
  `/problems.json`, and `/<activity>/<name>.json` a how-to.

## Rules

- **Activity**: exactly one line `Activity: <word>`; a word is
  lowercase letters, digits and hyphens.
- **Steps**: exactly one `sh` block, closed; at least one step; each
  command starts with `haicc `; each has a why above it; no why without
  a command below; the last step's why starts with `the check`.
- **Name**: the folder's, a word; one how-to an `<activity>/<name>` over
  all packages: a second is a problem and is left out.

## Also exported

`FOLDER`: `howto`, the folder in a package. `LAYER`: `howto`, the layer.
