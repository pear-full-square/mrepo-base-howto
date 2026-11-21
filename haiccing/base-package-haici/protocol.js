// base-package-haici's protocol: haici, human ai continuous improvement:
// feedback on a command, recorded in the request log. Linked into an
// mrepo, its config is loaded by the runtime and its actions run. The
// config is the package's; the work is mrepo-base-haici's.
import { feedback } from './modules/pear-full-square/mrepo-base-haici/index.js'

export const protocols = {
  haici: {
    package: 'haiccing/base-package-haici',
    description: 'Human ai continuous improvement: feedback on a command, recorded in the request log, the command not executed.',
    default: 'feedback',
    actions: {
      feedback: { uris: ['**'], args: ['text', 'command', 'arguments?'], description: 'Feedback on a command at its URI, recorded, the command not executed (--flags feedback <text> on a command is it): its request\'s record the store, its id answered, read back with layer=request.' }
    }
  }
}

export const actions = {
  haici: { feedback }
}
