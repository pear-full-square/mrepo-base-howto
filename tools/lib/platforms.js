// The platforms a release is for, as Bare names them (<os>-<arch>): one
// list, read by every tool. Each package's bundle carries every one's
// native addons (its prebuilds kept at assembly, its addons resolved for
// each at bundling: bare-pack's hosts); the sources carry Bare's runtime
// for each, its pin written for each into the haicc scripts' pins.
// The development tools themselves run on linux-x64 (tools/bare).
export const PLATFORMS = ['linux-x64', 'linux-arm64']
