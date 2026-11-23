// base-package-info's protocol: info, an mrepo's pages extracted from its
// packages and read by keywords from the top down. Linked into an mrepo,
// its config is loaded by the runtime and its actions run; its structure
// part brings the info layer. The config is the package's; the work is
// mrepo-base-info's.
import { get, extractAction, clear } from './modules/pear-full-square/mrepo-base-info/index.js'

export const protocols = {
  info: {
    package: 'haiccing/base-package-info',
    description: 'The mrepo\'s pages, read by keywords from the top down.',
    default: 'get',
    actions: {
      get: { uris: ['**'], description: 'A page and the keywords below it, by its keywords from the top, written where the URI is, in a package\'s context: a path that starts with its name (info/get haiccing/base-package-boot/deploy); a short keyword, the mrepo\'s own package\'s, else a choice of the packages that have it; none: the top page.' },
      extract: { uris: ['.'], description: 'The info layer extracted from the linked packages (and, where its list documents the store, every package in it), split on package: each page once, each package\'s index, the problems. Again: what is new added.' },
      clear: { uris: ['.'], description: 'The info layer\'s build removed: what an extraction wrote. Again: nothing to remove, a warning.' }
    }
  }
}

export const actions = {
  info: { get, extract: extractAction, clear }
}
