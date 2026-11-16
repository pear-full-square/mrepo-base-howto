// mrepo-base-howto: its documented methods, a directory each (README.md beside each).
//   external/   the howto protocol's actions: get, extract
//   internal/   howto: a how-to read from its README, the rules on it,
//               the howto layer from the packages' how-tos; config.js:
//               the protocol's config
export { get } from './external/get/index.js'
export { extractAction } from './external/extract/index.js'
export { parse, check, extract, FOLDER, LAYER } from './internal/howto/index.js'
export { CONFIG } from './internal/config.js'
