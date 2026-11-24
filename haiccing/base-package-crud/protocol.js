// base-package-crud's protocol: crud, the generic actions on an mrepo's
// data: its nodes created, read and deleted by URI. Linked into an mrepo,
// its config is loaded by the runtime and its actions run.
// The work is mrepo-base-crud's; here the mounting (its
// delete is the module's remove: delete is a word of the language).
import { create, read, remove } from './modules/pear-full-square/mrepo-base-crud/index.js'

// The crud protocol's config, the package's: create, read and delete, anywhere in main.
// create and delete need a target: the root is not made or removed. There
// is no update: asking for it is answered with the actions there are.
export const protocols = {
  crud: {
    package: 'haiccing/base-package-crud',
    description: 'An mrepo\'s nodes created, read and deleted by URI.',
    actions: {
      create: { uris: ['**'], target: true, args: ['value?'], description: 'A node made sure to exist, its parents too; its document the value given, {} when none. A node there already is left as it is.' },
      read: { uris: ['**'], description: 'The nodes a URI selects, each with its document and its children\'s names; a * selects every child, a filter the nodes whose document it holds for.' },
      delete: { uris: ['**'], target: true, args: ['recurse?'], description: 'The nodes a URI selects made sure to be gone; one that has children only with recurse.' }
    }
  }
}

export const actions = {
  crud: { create, read, delete: remove }
}
