// The rns' program, this process: the node's lookup db served, its lease
// renewed, until it is ended (SIGTERM, SIGINT), its mrepo's folder is gone
// or its mrepo's runtime has ended. Started by the start hook of the
// mrepo that lists this package:
//   runtime/start . packages/haiccing/base-package-rns
//   (bare <bundle> --dir=<the mrepo's folder> --runtime=<pid> --state=<file>)
import process from './modules/node_modules/bare-process/index.js'
import { program } from './modules/pear-full-square/mrepo-base-rns/index.js'

await program(process.argv.slice(2))
process.exit(0) // ended: here (its signal handlers would hold the process open)
