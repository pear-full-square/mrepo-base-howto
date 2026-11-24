# base-package-crud

The crud protocol: the generic actions on an mrepo's data, its nodes created, read and deleted by URI.

An mrepo that links it can be given structure in `main`: nodes, each a
folder with its document. `crud/create` makes a node and every node above
it; `crud/read` answers with the nodes a URI selects; `crud/delete`
removes them. There is no update.

## Links

- [create](modules/pear-full-square/mrepo-base-crud/external/create/)
- [read](modules/pear-full-square/mrepo-base-crud/external/read/)
- [delete](modules/pear-full-square/mrepo-base-crud/external/delete/)
- [howto](howto/)
- [test](test/)
- [test-reports](test-reports/)
- [modules](modules/)

## Nodes

A node is a folder in `main` holding its document under a hidden name:
`swarms/swarm-1/.node.json`. A shortcut is a node too: its sources are
beside its document, in `.shortcuts.json`. Deleting it removes the link,
not the mrepo it leads to.

## Config

The `crud` protocol's, in `protocol.js`: where each action is offered,
what it takes. Every action can be repeated: the second time changes
nothing.

| action | offered at | target | arguments |
|---|---|---|---|
| `create` | anywhere in `main` | needed | the node's document, JSON, optional: `{}` |
| `read` | anywhere in `main` | `.` reads the layer itself | none |
| `delete` | anywhere in `main` | needed | `recurse`, optional |

There is no `update`: asked for, it is answered with the actions there
are.

## Package

- `protocol.js`: the `crud` protocol, its config and its actions, from
  `mrepo-base-crud`.
- `main.js`: the dispatcher, the bundle's main, generated.
- No structure of its own: the nodes are made in `main`, the runtime
  package's layer.
