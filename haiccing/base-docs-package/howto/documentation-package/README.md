# documentation-package

A documentation package: pages only, the generic documentation of its family.

Pattern: documentation-package

A documentation package brings no structure and no code: its READMEs
are pages. It documents what does not depend on one implementation, for
its family (`base-docs-*`), and is read from the docs mrepo. A package
or a module documents only what is its own.

## Steps

```sh
# cloned from a documentation package (the package how-to)
cp -a haiccing/base-docs-uri haiccing/<new>
# "docs": true in its package.json; its test of its own: none, a dummy that says why
$EDITOR haiccing/<new>/package.json haiccing/<new>/test/none/README.md
# its pages: the README the top, a folder a page where it grows, each reached by a menu
$EDITOR haiccing/<new>/README.md
# included in the docs mrepo: its list and its README's included packages
$EDITOR haiccing/base-component-docs/mrepo/packages/.layer.json haiccing/base-component-docs/README.md
# the check: its pre-release, its info test reaching every page
tools/bare tools/package-test.js haiccing/<new>
```

## Notes

- **Its keywords** are its name, fully qualified: `haicc docs info/get
  haiccing/base-docs-uri`.
- **Documentation follows the implementation**: what is not built is the
  vision's.
