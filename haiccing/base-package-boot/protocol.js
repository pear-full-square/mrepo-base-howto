// base-package-boot's protocols: the boot protocol, mounted by every mrepo that deploys
// others. Linked into an mrepo, its config and its actions are loaded by
// the runtime; a hook activates it for the outside.
//   protocols   the configs: each protocol's actions, the URIs, the service
//               states each is allowed in, the package that implements it
//   actions     the actions, by protocol: (exec, form) -> output, or throws
// The work is mrepo-base-boot's; here only what the package offers.
import { deploy, teardown, redeploy } from './modules/pear-full-square/mrepo-base-boot/index.js'

// A target is needed: / is the mrepo itself, which one cannot deploy or
// tear down. Any position below main: what a position means (a swarm) its
// documents say, not this config.
const CHILD = { uris: ['**'], target: true }

export const protocols = {
  boot: {
    package: 'haiccing/base-package-boot',
    description: 'Deploys and tears down child mrepos; executed by the parent.',
    actions: {
      deploy: { ...CHILD, args: ['package'], description: 'A child mrepo built from a target package at a position below main, placed by its unique URI (in the swarm of the nearest node above it whose document says it is one), its packages linked, its runtime started, its shortcut and its link recorded first, its packages\' scripts placed in the work folder\'s scripts/; its argument the package. Again, from the same package: a warning, nothing done.' },
      teardown: { ...CHILD, description: 'The child\'s decommission, its runtime stopped, the child and its records removed. Again, nothing deployed there: a warning, nothing done.' },
      redeploy: { ...CHILD, args: ['package?'], description: 'Teardown, then deploy.' }
    }
  }
}

export const actions = {
  boot: { deploy, teardown, redeploy }
}
