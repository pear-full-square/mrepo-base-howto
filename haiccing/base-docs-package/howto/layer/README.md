# layer

A layer of its own: a package bringing a branch of the mrepo beyond the common ones.

Pattern: layer

A package brings a layer by its folder in `mrepo/`, a leaf with its
`.layer.json` (its mode and description). Its name has to be known to
the repository code, or the boot refuses it: `not a layer`.

## Steps

```sh
# the leaf: its mode, atomic for data written one commit at a time
mkdir -p haiccing/<pkg>/mrepo/<layer>
echo '{ "mode": "atomic", "description": "<what it holds>" }' > haiccing/<pkg>/mrepo/<layer>/.layer.json
# its name known: mycelium-git's LAYERS and SOLO
$EDITOR pear-full-square/mycelium-git/lib/write.js
# and mrepo-base-execute's TARGETS, so an action may write it
$EDITOR pear-full-square/mrepo-base-execute/index.js
# its page at run time: base-docs-package's mrepo/<layer>/, linked from mrepo/'s menu
$EDITOR haiccing/base-docs-package/mrepo/<layer>/README.md
# the check: every package carrying those two modules, its pre-release
tools/bare tools/release.js --strict
```

## Notes

- **No README inside the layer** of a package that brings structure:
  it would be committed into it; the layer is documented in
  `base-docs-package`.
