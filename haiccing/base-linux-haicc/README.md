# base-linux-haicc

The first step of haicc on Linux: sh scripts that install the command, put Bare in place and start the app.

The `haicc` command is an app run with Bare, `haiccing/base-app-haicc`.
Bare cannot fetch itself, so what has to work before it is on the machine
is here, in plain POSIX sh: the installer, linking a sources folder,
putting Bare in place. From then on `haicc` starts the app for
everything else.

## Links

- [howto](howto/)
- [bin](bin/)
- [test](test/)

## Install

`haicc-install.sh` carries the scripts and the pins, nothing else:
`--home=<folder>` is haicc's own folder, `~/.haicc` by default;
`--bin=<folder>` is where the command is registered, not the install's
own `bin/`. Then the sources:
downloaded over https, or a sources folder linked. The how-to `install`.

## Commands

| its own, in sh | |
|---|---|
| `haicc sources link <folder>` | a local folder linked as a source, not copied: Bare's runtime and the packages come from it |
| `haicc sources download bare` | Bare's runtime fetched over https into haicc's own sources folder, checked against its pin |
| `haicc sources download <org>...` | an organisation's packages fetched over https into the same folder, haiccing's and each platform's (`base-docs-haicc`, "Platforms"): the manifest from the latest release of its documentation package (`<org>/base-docs-<platform>`, haiccing's `base-docs-haicc`), then each package's bundle and addons from its own release (`r-<commit>`), each checked against the manifest (sha256); the manifest written last, `github:<org>` registered. A package alone is not downloaded. `HAICC_RELEASES` names another base than `https://github.com` |
| `haicc prereq [--check]` | what the command needs to start, checked: the platform, the tools, a source holding the app, Bare; Bare unpacked from the sources |
| `haicc --help` | these, then the app's when it can be started |

Anything else goes to the app as it is typed: `<bare> <the app's bundle>
/run <arguments>`, the bundle taken from the first linked folder that
holds it. Until Bare and the app are there, it says what is missing and
exits 3.

## Folders

```
~/.haicc/
  bin/            the scripts
  pins            the pinned Bare (a build a platform), the organisation, the app's package
  sources.list    the sources registered, the app's list too
  sources/        what haicc sources download fetched: Bare, the packages
  bare/           Bare, unpacked by haicc prereq
  work/           the app's work folder
  scripts/        the install's scripts: <name>.haicc, <org>/<package>/<name>.haicc
```

`HAICC_HOME` names another folder.

## Network

Only `haicc sources download` reaches the network. An install from
a linked sources folder is offline and repeats exactly.

## Platforms

Two are pinned, `linux-x64` and `linux-arm64` (a Raspberry Pi, 64-bit):
`pins` holds Bare's build for each (`BARE_<os>_<arch>_FILE`, `_URL`,
`_SHA512`), and the scripts choose the machine's from `uname`
(`bin/haicc-lib.sh`). `haicc sources download bare` fetches this
machine's; `haicc prereq` puts it in place, or says the platform is not
pinned. The packages' bundles are the same on both: each carries every
pinned platform's native addons, and Bare loads its own.

## Not yet

- The app's bundle is taken from the sources as it is: not checked
  against its manifest.

## Package

- `bin/`: the scripts. `pins`: what they are pinned to.
- `build.sh`: writes `haicc-install.sh` from `bin/` and `pins`. Run it
  after a change to either.
- `haicc-install.sh`: the installer, generated.
