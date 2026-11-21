# replica

Names the replica a container action is about: this mrepo's own, in a container.

## Signature

`replica(exec)`

## Returns

- `at`: the position it is linked at, in `main`: `container`.
- `mrepo`: its own unique URI: this mrepo's with `container` behind it,
  `<swarm>/<name>/container` (any unique URI, a path, with `container`
  behind it).
- `dir`: its folder, by this mrepo's unique URI:
  `<work>/containers/<unique URI>`; beside this mrepo where the
  context names no work folder.
- `folder`: the same, relative to this mrepo's own folder.
- `name`: its container's name, `haicc-<unique URI, its slashes hyphens>-<hash>`, the hash
  the first eight characters of the folder's sha256.
- `node`, `links`: its node's document and its shortcuts, in `main`.
- `local(key)`: its link's record in the links layer, by the link's key.
- `recorded()`: its shortcut and its link's record as one; `null` when
  there is no replica.
- `refuse()`: throws when the position holds data of the mrepo's own.

## Errors

- The context names no directory.
- The mrepo's unique URI is not a path of two names at least, `<swarm>/<name>`.
- The mrepo is a replica itself (its unique URI ends in `/container`):
  `a replica makes no replica of its own`.

## Also exported

`AT`: `container`. `CONTAINERS`: `containers`, the folder under the work
folder. `MOUNT`: `/mrepo`, where a replica's folder is seen inside its
container.
