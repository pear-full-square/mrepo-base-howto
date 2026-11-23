# docs

The docs mrepo deployed in the boot mrepo: the install's documentation, read with info.

The docs mrepo documents every package the sources offer
(`base-component-docs`). It is not deployed with the boot: one command
deploys it at `docs`, beside the host.

## Steps

```sh
# the docs mrepo, from the docs component
haicc . boot/deploy docs haiccing/base-component-docs
# its front page, and a page by its keywords
haicc docs info/get
haicc docs info/get haiccing/base-package-boot/deploy
# torn down when it is no longer wanted
haicc . boot/teardown docs
```
