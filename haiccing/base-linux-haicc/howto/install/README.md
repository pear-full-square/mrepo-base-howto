# install

The haicc command installed on Linux, its sources and Bare in place, the boot mrepo and a host running.

The first four steps are the sh scripts'; from `haicc boot/deploy` on,
the app's. The sources come over https from the releases, or from a
local folder, which installs offline and repeats exactly.

## Steps

```sh
# the installer: the scripts and the pins
curl -fsSLO https://github.com/haiccing/base-linux-haicc/releases/latest/download/haicc-install.sh
sh haicc-install.sh
# the sources: Bare and the packages downloaded, each checked
haicc sources download bare haiccing
# Bare put in place from them
haicc prereq
# the boot mrepo, then the workbench: the local manager, its docs mrepo and Splectral, in service
haicc boot/deploy
haicc . boot/deploy workbench haiccing/base-solution-workbench
```

## Notes

- **Offline, from a sources folder**: `haicc sources link <folder>` in
  place of the download (a sources folder, as the packages' build writes
  it).
- **Elsewhere**: `sh haicc-install.sh --home=<folder> --bin=<folder>`.
