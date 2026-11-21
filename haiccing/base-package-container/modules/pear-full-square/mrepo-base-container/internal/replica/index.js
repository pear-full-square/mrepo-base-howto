// replica: the replica a container action is about, this mrepo's own in a
// container (README.md beside it).
import { join, dirname, relative } from 'bare-path'
import crypto from 'bare-crypto'
import { shortcutOf, shortcutsAt, linked, linkPath, NODE } from 'mrepo-base-xpath'

// The position the replica is linked at, in main.
export const AT = 'container'
// Where the replicas' folders are, under the work folder, by unique URI.
export const CONTAINERS = 'containers'
// Where a replica's folder is seen inside its container.
export const MOUNT = '/mrepo'

// log: debug, the replica named (its callers say what they did with it)
export function replica (exec) {
  const dir = exec.runtime.dir
  if (!dir) throw new Error('no directory in the context')
  const uri = exec.runtime.uri
  if (typeof uri !== 'string' || !/^[a-z][a-z0-9-]*(\/[a-z][a-z0-9-]*)+$/.test(uri)) throw new Error(`no unique URI to make a replica by: ${uri} (<swarm>/<name>, a path)`)
  // (a replica's own: its node's with the position behind it)
  if (uri.endsWith(`/${AT}`)) throw new Error(`a replica makes no replica of its own: ${uri}`)
  // its own unique URI: this mrepo's, with its position behind it (two
  // mrepos, each addressed: a request and its answer name both)
  const mrepo = `${uri}/${AT}`
  // beside the mrepos, by this mrepo's unique URI (beside this mrepo,
  // where there is no work folder)
  const placed = join(exec.runtime.work ?? dirname(dir), CONTAINERS, uri)
  // its container's name: the URI, and the folder's hash: two installs on
  // one machine do not meet
  const name = `haicc-${uri.replace(/\//g, '-')}-${crypto.createHash('sha256').update(placed).digest('hex').slice(0, 8)}`
  const shortcut = async () => (await shortcutsAt(exec, AT)).find(l => l.mrepo === mrepo) ?? null
  exec.log('debug', 'replica', { at: AT, mrepo, dir: placed, container: name })
  return {
    at: AT,
    mrepo,
    dir: placed,
    folder: relative(dir, placed),
    name,
    node: `main/${AT}/${NODE}`,
    links: shortcutOf(AT),
    local: linkPath,
    recorded: async () => { const l = await shortcut(); return l ? { ...l, ...(await linked(exec, l.link) ?? {}) } : null },
    refuse: async () => { if ((await exec.select(`main/${AT}`)).length > 0 && !(await shortcut())) throw new Error(`${AT} exists locally: the container protocol cannot use it`) }
  }
}
