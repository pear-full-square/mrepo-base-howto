# /info

The mrepo's pages, extracted from the packages it links: each page once, addressed by keywords from the top down.

There where the mrepo links `base-package-info`, which brings the layer
and the `info` protocol.

```
/info/packages/<org>/<package>/...   a package's pages, its READMEs
/info/modules/<org>/<module>/...     a module's pages, once
/info/modules/README.md              every module once, made here
/info/third-party/README.md          the third-party code, made here
/info/index.json                     { "<keyword path>": [{ page, section?, see?, oneliner, below, generated? }] }
/info/problems.json                  [{ keyword?, page?, check, detail }]
```

## Usage

- **Written by `info/extract`**, an ordinary action, run by a hook where
  the mrepo is made ready: at `boot` where the mrepo has no service, at
  the service's `initialise` where it has one.
- **Read with `info`**, or `info/get [<keywords>]`: the top page, the
  README of the mrepo's own package, and the keywords below it, its
  organisations; each package below its organisation by its name fully
  qualified (`info/get haiccing/base-package-boot/deploy`); a
  keyword path, its page and its keywords.
- **The keywords come from the menus**: a README's `## Links`, its
  sections, a package's `## Included packages`, each included package
  by its name without the prefix.
- **What does not fit is in `problems.json`**: a link to nothing, a
  README no menu leads to, the old form, the included packages against
  the list.
