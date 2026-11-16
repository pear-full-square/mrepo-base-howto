# extract

Writes the mrepo's howto layer from the how-tos of its linked packages, replacing what is there.

Each linked package's bundle is read for its `howto/<name>/README.md`
files. Run by a hook, where the help is extracted.

## Signature

`extractAction(exec, { uri })`: requested as `howto/extract`, at the
mrepo itself.

## Returns

`{ howtos, activities, changed, problems }`: how many how-tos, the
activities they declare, whether the layer changed, and how many
problems their forms have.

What it writes, in the `howto` layer:

- `index.json`: the how-tos by activity, each `{ howto, oneliner,
  package }`.
- `<activity>/<name>.json`: one how-to: its title, one-liner, activity,
  package, where its README is in the help layer, and its steps.
- `problems.json`: `[{ package, howto, check, detail }]`.
- `layer.json`, when the layer has none.

## Errors

- A URI that is not the mrepo itself.
- The packages manifest is no document.

## Design

- A how-to that was there and is no more is removed: the layer is what
  the packages bring now.
- Problems are counted and logged as a warning; they do not fail the
  request: an mrepo starts with a how-to against its form.
