# /main

The mrepo's data: what it is for. Atomic: written by the runtime, one
commit at a time, only through a request's execution.

A section of `main` can have protocols of its own (`/protocols`). From
outside, `main` is all of an mrepo that a request can name.

## Nodes

Structure in `main` is made of nodes. A node is a folder holding its
document under a hidden name; a name starting with a dot is no URI's, so
nothing from outside can name it.

```
/main/swarms/.node.json               {}
/main/swarms/swarm-1/.node.json       { "size": 3 }
```

- **`.node.json`**: the node's document, `{}` when it was given no
  value. It is also what keeps the folder in git.
- **Made, read and removed by `crud`**: `crud/create swarms/swarm-1`
  makes the node and every node above it.
- **A node's children** are the folders in it that hold a document.

## Shortcuts

A shortcut is a node whose data originates elsewhere: another mrepo,
linked at that position. Its sources are beside its document:

```
/main/host/.node.json                 {}
/main/host/.shortcuts.json            [{ "mrepo": "local/host", "link": "<key>" }]
```

- **A list**: each entry a source, by its unique URI, with its link's
  key. One is in use: a child deployed there.
- **What is needed to show the link**, nothing that is local to a
  machine. `main` replicates; what the deploying mrepo knows about the
  child, where it is, the package it came from and its runtime's
  process, is in its [links](../links/) layer, by the link's key.
- **Managed by the boot protocol**: `boot/deploy` makes the node and its
  link, `boot/teardown` removes both. Deleting the node with `crud`
  removes the link, not the mrepo it leads to.

## Resolving

A URI is resolved inside the mrepo it is in (`mrepo-base-xpath`): a
position is a shortcut when its node has sources.

- **A URI is a query.** It names one node, or selects several: a `*`
  for every child, a filter for the nodes whose document it holds for:
  `swarms/*[state='started']`. A leaf in a filter is a key of the
  node's document; a URI can go on inside a document, to a value there.
  A key is written in its URI form, in a filter too: `publicKey` is
  `public-key`; a capital there is no valid URI. A list in a document
  is a child that repeats: `tags` is every item, `tags[2]` the second;
  a position counts from 1, in the tree as well (`swarms/*[1]`).
  What of XPath is read: `mycelium-xpath`'s README. Quoted at a command
  line, its stars and brackets being the shell's too.

- **Where a shortcut leads on this machine** is read from the
  [links](../links/) layer: the link's record there, by the key the
  shortcut names, says the mrepo's folder, with its inbox and outbox
  folders inside. The shortcut at `host` leads to
  `<work>/mrepos/local/host/`. `main` itself holds what is needed to show
  a link, nothing that is local to a machine.
- **A shortcut stops it.** What is below a shortcut, and its document,
  is in the mrepo it leads to. A command's own URI does not run through
  one: `crud/read host/swarms` is refused, with the way across. The way
  across is `haicc`: `haicc host crud/read swarms`, or
  `haicc host/swarms crud/read .`: what is left of the URI goes on with
  the command, from one local root to the next.
- **One shortcut at a time.** A `haicc` URI that reaches a shortcut
  among other positions, or several shortcuts, is refused, `not yet`: a
  known issue, resolved when the query has its union.
- **Own shortcuts only.** An mrepo resolves its own; those of a linked
  mrepo are not visible from here.

## The registry

The install's registry is the work folder's `mrepos/`: a folder each
mrepo, by its unique URI, for the install's system administration. No
mrepo keeps a copy in its `main`: what an mrepo deployed it sees through
its own links, its shortcuts and its links layer, forward only.

```
haicc . crud/read "*"                          what the boot mrepo linked
haicc . crud/read "*" --flags layer=links      its links' records
```

## Later

What XPath does across linked mrepos: a selection that crosses several
links or mixes them with local nodes (the union), several sources and
local data combined at one node; descendants, positions, the other
functions.
