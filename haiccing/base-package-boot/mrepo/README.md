# mrepo/

The boot protocol's part of an mrepo's structure: the links layer.

- **The `links` layer** (`links/.layer.json`): where `boot/deploy` records
  each mrepo it links, a document by the link's own key
  (`links/<key>.json`), and `boot/teardown` removes it. For the mrepo's
  own use. Empty until the first deploy.
