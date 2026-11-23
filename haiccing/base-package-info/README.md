# base-package-info

The info protocol: an mrepo's pages, extracted from the packages it links and read by keywords from the top down.

Every README of an mrepo's packages is a page, addressed by the menus
that lead to it from the top: the README of the mrepo's own package.
An mrepo that links this package has an `info` layer; `info/extract`
fills it, split on package, `info` answers a page in a package's
context and the keywords below it, `info/clear` removes the build.

## Links

- [get](modules/pear-full-square/mrepo-base-info/external/get/)
- [extract](modules/pear-full-square/mrepo-base-info/external/extract/)
- [clear](modules/pear-full-square/mrepo-base-info/external/clear/)
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
| `clear` | `.`, the mrepo itself | none |

`get`: nothing asked, the top page and the keywords below it; a keyword
path in a package's context, its name in front
(`haiccing/base-package-boot/deploy`), its page and each keyword below
it with its one-liner, written as it is asked; a short keyword, the
mrepo's own package's, else a choice of the packages that have it, kept
apart. `extract`: the info layer written again from the linked packages
(where its list documents the store, every package in it too), split on
package, with its problems; run by a hook as the mrepo is made ready,
again adding what is new. `clear`: what an extraction wrote removed;
again, a warning.

## Package

- `protocol.js`: the `info` protocol, its config and its actions, from
  `mrepo-base-info`.
- `main.js`: the dispatcher, the bundle's main, generated.
