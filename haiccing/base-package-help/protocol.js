// base-package-help's protocol: help, a command explained where it would
// run, not executed. Linked into an mrepo, its config is loaded by the
// runtime and its actions run. The config is the package's; the work is
// mrepo-base-help's.
import { annotate } from './modules/pear-full-square/mrepo-base-help/index.js'

export const protocols = {
  help: {
    package: 'haiccing/base-package-help',
    description: 'A command explained where it would run, not executed: what it does, whether it is taken here and now, its arguments.',
    default: 'annotate',
    actions: {
      annotate: { uris: ['**'], args: ['command', 'arguments?'], description: 'A command explained at its URI, not executed (--flags help on a command is it): what it does, the door\'s answer here and now, its arguments against those its action names, the command to run it, where to read more.' }
    }
  }
}

export const actions = {
  help: { annotate }
}
