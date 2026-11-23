# documents

An mrepo that documents every package the sources offer, beyond the packages it is made of.

Pattern: documents

A list (`mrepo/packages/layer.json`) with `"documents": "sources"`: as
the mrepo is deployed, every package the sources offer that the list
does not name is placed beside the others, its bundle only, marked
`documented` in the packages manifest. Nothing of it is laid in or
runs: no structure, no protocol loaded, no addon; its pages are
extracted with the rest, each package at its keyword below the top. What
is installed is what is documented: the docs mrepo, the solution's
manual.

## Steps

```sh
# the list: what the mrepo is made of, and what it documents beyond it
$EDITOR haiccing/<pkg>/mrepo/packages/layer.json   # "documents": "sources"
# its README: what it documents, beside its included packages
$EDITOR haiccing/<pkg>/README.md
# deployed: the documented packages placed beside the list's
haicc . boot/deploy <name> <pkg>
# their pages below their organisations, by their names
haicc <name> info/get
haicc <name> info/get <org>/<package>
```

## Notes

- **Only `sources`** for now: later, a solution's list.
- **A documented package is not run**: `runtime/run` refuses it.
