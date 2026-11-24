# component

A component: several packages deployed together as one mrepo, its main empty.

Pattern: component

A component brings no protocol and no code of its own: a list of the
packages its mrepo is made of, itself last, and the runtime config of
that mrepo. Its README lists the same packages under `## Included
packages`, siblings, in deploy order.

## Steps

```sh
# cloned from a component (the package how-to)
cp -a haiccing/base-component-docs haiccing/<new>
# its list, mrepo/packages/.layer.json: the packages in deploy order, itself last
$EDITOR haiccing/<new>/mrepo/packages/.layer.json
# its README: the menu, and ## Included packages, the same list but itself, as ../<package>/
$EDITOR haiccing/<new>/README.md
# its hooks, what its mrepo offers and when (the hooks how-to)
ls haiccing/<new>/mrepo/runtime/hooks
# its own test, configured: the list, the hooks, against the packages in the sources
SOURCES=$PWD/sources tools/bare haiccing/<new>/test/configured/run.js
# the check: deployed, its info read
haicc . boot/deploy <name> <new>
```

## Notes

- **It defines an mrepo** (the mrepo-definition how-to): its list and
  its runtime config are laid in from it, the last of the list.
- **The info test checks** its included packages against its list.
- **A list names packages, not components**: a package that takes over
  a component's role carries that component's packages in its own list
  (the workbench, `base-solution-workbench`: the haicc component's, the
  host's role), itself last.
