# base-package-info

The info protocol: an mrepo's pages, extracted from the packages it links and read by keywords from the top down.

Every README of an mrepo's packages is a page, addressed by the menus
that lead to it from the top: the README of the mrepo's own package.
An mrepo that links this package has an `info` layer; `info/extract`
fills it, `info` answers a page and the keywords below it.

## Links

- [get](modules/pear-full-square/mrepo-base-info/external/get/)
- [extract](modules/pear-full-square/mrepo-base-info/external/extract/)
- [howto](howto/)
- [mrepo](mrepo/)
- [test](test/)
- [test-reports](test-reports/)
- [modules](modules/)

## Config

The `info` protocol's, in `protocol.js`; no state.

| action | offered at | arguments |
|---|---|---|
| `get`, the default | its keywords where the URI is (`**`): `info/get haiccing/base-package-boot/deploy` | none |
| `extract` | `.`, the mrepo itself | none |

`get`: nothing asked, the top page and the keywords below it; a keyword
path, its page and each keyword below it with its one-liner; a keyword
with several meanings, each a choice. `extract`: the info layer written
again from the linked packages, with its problems; run by a hook as the
mrepo is made ready.

## Package

- `protocol.js`: the `info` protocol, its config and its actions, from
  `mrepo-base-info`.
- `main.js`: the dispatcher, the bundle's main, generated.
