// base-package-info's protocol: info, an mrepo's pages extracted from its
// packages and read by keywords from the top down. Linked into an mrepo,
// its config is loaded by the runtime and its actions run; its structure
// part brings the info layer. The config is the package's; the work is
// mrepo-base-info's.
import { get, extractAction } from './modules/pear-full-square/mrepo-base-info/index.js'

export const protocols = {
  info: {
    package: 'haiccing/base-package-info',
    description: 'The mrepo\'s pages, read by keywords from the top down.',
    default: 'get',
    actions: {
      get: { uris: ['**'], description: 'A page and the keywords below it, by its keywords from the top, written where the URI is (info/get haiccing/base-package-boot/deploy, a package by its name fully qualified; none: the top page); a keyword with several meanings, each a choice.' },
      extract: { uris: ['.'], description: 'The info layer extracted from the linked packages: each page once, the index from keyword to page, the problems.' }
    }
  }
}

export const actions = {
  info: { get, extract: extractAction }
}
