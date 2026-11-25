// mrepo-base-howto: its documented methods, a directory each (README.md beside each).
//   external/   the howto protocol's actions: run, step, report, reset
//   internal/   script (a how-to's steps.haicc read, a line's answer and
//               checks), scene (where it runs: a line sent, the scene
//               thrown away, the runner's records)
export { run } from './external/run/index.js'
export { step, nextOf } from './external/step/index.js'
export { report, seriesOf, markdownOf } from './external/report/index.js'
export { reset } from './external/reset/index.js'
export { parse, keyOf, partsOf, answerOf, checksOf, FILE, NEEDS } from './internal/script/index.js'
