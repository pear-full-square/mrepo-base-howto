# docs

The docs mrepo deployed in the boot mrepo: the install's documentation, read with info.

The docs mrepo documents every package in the install's store
(`base-component-docs`), split on package. It is not deployed with the
boot: one command deploys it at `docs`, beside the host.

## Steps

```sh
# the docs mrepo, from the docs component
haicc . boot/deploy docs haiccing/base-component-docs
# its front page; a page in a package's context; a short keyword, a choice of packages
haicc docs info/get
haicc docs info/get haiccing/base-package-boot/deploy
haicc docs info/get deploy
# the store's new packages added; the build removed, built again
haicc docs service/initialise
haicc docs service/stop
haicc docs service/shutdown
# torn down when it is no longer wanted
haicc . boot/teardown docs
```
