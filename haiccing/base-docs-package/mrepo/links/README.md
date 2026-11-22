# /links

Every mrepo this mrepo links, a record each: what this machine knows of it. Atomic. For the mrepo's own use.

There where the boot protocol is linked (`base-package-boot` brings the
layer). `main` holds what is needed to show a link, the shortcut: which
mrepo, and the link's key; `main` replicates. Everything needed to
manage the link is here, and stays on this machine.

## A record

A document by the link's own key:

```
/links/<key>.json
{
  "key": "<key>",
  "uri": "local/host",
  "at": "host",
  "how": "deployed",
  "folder": "../local/host",
  "package": "haiccing/base-component-haicc",
  "packages": ["haiccing/base-package-info", "..."],
  "layers": { "main": "...", "...": "..." },
  "runtime": { "pid": 4242 }
}
```

- `key`: the link's own, the one its shortcut in `main` names.
- `uri`: the linked mrepo's unique URI.
- `at`: the position in `main` that links to it.
- `how`: how the link came about: `deployed` here, by the boot protocol;
  `container`: the mrepo's replica in a container, made by the
  container protocol.
- `folder`: where the mrepo is on this machine, from this mrepo's own
  folder. An mrepo is placed by its unique URI under the work folder's
  `mrepos/`, side by side with the others; a replica under its
  `containers/`.
- `package`, `packages`, `layers`: what it was deployed from.
- `runtime`: the process running it, when it has one.
- `container`: a replica's container, its name and its image.

## Written and read

- **Written by the boot protocol only**: `boot/deploy` adds the record,
  `boot/teardown` removes it, `boot/redeploy` does both.
- **Where a shortcut leads** is read here: a command sent on at a
  shortcut goes to the folder its link's record names.
- **Not keyed on the mrepo's URI**: a link is found from its shortcut by
  its key, and from an mrepo or a position by what the records say
  (`*[uri='local/host']`, `*[at='host']`): the mrepo's own lookups,
  either way.
- **Not for the outside**: what an install's mrepos are is the work
  folder's `mrepos/`, the install's registry, its system
  administration's ([main](../main/), "The registry").

## Not yet

A link to an mrepo that was not deployed here; a swarm's nodes in
containers.
