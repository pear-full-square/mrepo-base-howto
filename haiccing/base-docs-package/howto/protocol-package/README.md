# protocol-package

A package bringing a protocol: its config in protocol.js, its actions in a module of its own.

Pattern: protocol-package

One package, one protocol. The package holds the config, the module
holds the code: each action a folder `external/<action>/`, its
`index.js` and its README. The package's menu jumps to its actions, so
`info/get <org>/<package>/<action>` is one step.

## Steps

```sh
# a module for the code, its actions a folder each, beside the others
mkdir -p pear-full-square/<module>/external/<action>
# registered for the tools: package.json workspaces, package-lock.json, its link
ln -s ../pear-full-square/<module> node_modules/<module>
# the package, cloned from a protocol package (the package how-to)
cp -a haiccing/base-package-info haiccing/<new>
# protocol.js: protocols.<name> its config (package, description, default?, actions: uris, args, target, states), actions.<name> its functions
$EDITOR haiccing/<new>/protocol.js
# the README's menu: a jump to each action in its module
$EDITOR haiccing/<new>/README.md
# its own test, mounted: the config value by value, each action run
$EDITOR haiccing/<new>/test/mounted/mounted.test.js
# the check: its pre-release
tools/bare tools/package-test.js haiccing/<new>
```

## Notes

- **Active only by a hook**: a loaded protocol is offered once
  `protocol/activate` ran for it; the mrepo that links it says when
  (the hooks how-to).
- **An action logs** through `exec.log` and `exec.step`; the code check
  says so.
