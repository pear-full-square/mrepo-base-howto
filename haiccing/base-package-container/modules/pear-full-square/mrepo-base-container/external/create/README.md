# create

Makes the mrepo's replica: an mrepo built from its own package, and a container that will run it.

The replica is made of what this mrepo is made of: the package that
defines it, the last of its own list, from the same store. It is built
under the work folder's `containers/`, by this mrepo's unique URI, and
has its own: this mrepo's with `container` behind it. Its container is made, not started: `container/start`
does that.

## Signature

`create(exec)`: requested as `container/create`, at the mrepo itself.

## Returns

`{ created, mrepo, container: { name, image }, package, packages, layers }`:
`created` is the position the replica is linked at, `container`; `mrepo`
its unique URI, `<swarm>/<name>/container`.

What it writes in this mrepo:

- `main/container/.node.json`: the replica's node, an empty document.
- `main/container/.shortcuts.json`: its shortcut, `[{ "mrepo", "link" }]`.
- `links/<key>.json`: the link's record: its URI, the position (`at`),
  how it came about (`container`), where it is (`folder`, from this
  mrepo's own folder), its package, the packages placed, its layers, and
  its container's name and image.

## Errors

- A replica is there already: `created already`.
- The position `container` exists locally, as data in `main`.
- No Docker daemon answers: `no Docker`.
- The mrepo has no unique URI of the form `<swarm>/<name>`, a path.
- Its packages manifest names no store, or lists no package.
- The package lists no `base-package-runtime`: nothing to run.
- The image is not built, or the container not made. Nothing of the
  replica is left then: neither its folder nor a container.

## Design

- The image is built here when it is not there: the first create on a
  machine takes the time Docker needs to pull its base.
- The container is given the replica's folder as `/mrepo`, and nothing
  else of the host.
- The replica has a unique URI of its own: a request and its answer are
  addressed by it, so two mrepos cannot share one.
