// deploy(exec, { uri, args: [package] }): the boot protocol's deploy (README.md beside it).
import fs, { existsSync, rmSync } from 'bare-fs'
import { openRepo, p2pgitBackend } from 'mycelium-git'
import { join } from 'bare-path'
import { start, stop, commissioned, decommission } from 'mrepo-base-runtime'
import { guid } from 'mrepo-base-request'
import { install, origin, targetOf } from '../../internal/install/index.js'
import { child } from '../../internal/child.js'
import { deployPair } from '../../internal/pair/index.js'

// (link: the key of the link, when it has one already: a redeploy keeps it)
export async function deploy (exec, { uri, args = [], flags = {} }, { link: kept = null } = {}) {
  const c = await child(exec, uri)
  if (await c.recorded()) throw new Error(`deployed already: ${c.at}`)
  // a position that exists locally (data in main there): not a target
  await c.refuse()
  await c.above()
  // the rule: a unique URI never a prefix of another's
  await c.free()
  // into a container (the flag: container): its own haicc install there
  // runs it, this mrepo links it (internal/pair)
  const pair = flags.container === true
  if (!pair && existsSync(c.dir)) throw new Error(`in the way: ${c.dir}`)
  if (!args[0]) throw new Error('missing argument: package')
  const target = targetOf(args[0])
  // The store and the sources: the mapping the parent's packages manifest records.
  const { store, sources } = await origin(exec)
  const link = kept ?? guid()
  // A pair: the container made, the child deployed in it by its own
  // platform; here only its link, as below, its folder the one in the
  // container's home that this host forwards to.
  if (pair) {
    const { folder, ...made } = await deployPair(exec, c, { target, sources })
    const entry = () => ({ key: link, uri: c.mrepo, at: c.at, how: 'container', folder, package: target, ...made })
    exec.put(c.node, Buffer.from('{}\n'))
    exec.put(c.links, Buffer.from(JSON.stringify([{ mrepo: c.mrepo, link }], null, 2) + '\n'))
    exec.put(c.local(link), Buffer.from(JSON.stringify(entry(), null, 2) + '\n'))
    if (await c.registers()) {
      for (const r of c.ranks) if (await exec.find(r) === null) exec.put(r, Buffer.from('{}\n'))
      exec.put(c.registry, Buffer.from(JSON.stringify(entry(), null, 2) + '\n'))
    }
    exec.log('info', 'deployed', { at: c.at, mrepo: c.mrepo, package: target, container: made.container.name })
    return { deployed: c.at, mrepo: c.mrepo, package: target, container: made.container }
  }
  // The target's list laid in, built at its own place, by its unique URI,
  // its packages placed.
  const record = await install(exec, { store, sources, target, dir: c.dir, uri: c.mrepo })
  // What is local to this machine about it (not in main, which replicates):
  // its link's record says besides which mrepo, linked where, how, placed where.
  const entry = () => ({ key: link, uri: c.mrepo, at: c.at, how: 'deployed', folder: c.folder, ...record })
  // Its runtime started, from its own packages/ (its pinned runtime), by
  // its directory: its inbox operational. Not when it has no runtime.
  const runtime = join(c.dir, 'packages', 'haiccing', 'base-package-runtime.bundle')
  if (existsSync(runtime)) {
    const s = await exec.step('runtime', r => ({ started: Boolean(r), pid: r?.pid ?? null }), () => start({ repo: c.dir, bundle: runtime }))
    if (!s) throw new Error(`its runtime did not start: ${c.dir}`)
    record.runtime = { pid: s.pid }
    // Its commission, fired by its runtime as it starts, waited for: what
    // its package does once it is deployed (its components deployed, its
    // service initialised, started). Failed: nothing of it left (what it
    // deployed so far decommissioned, as it can be; its runtime stopped,
    // its folder removed), the line that failed said.
    const done = await exec.step('commission', r => ({ state: r?.state ?? null, ...(r?.error ? { error: r.error } : {}) }), () => commissioned({ repo: c.dir }))
    if (!done || done.state === 'failed') {
      await exec.step('undone', { dir: c.dir }, async () => {
        // catch: what is left of it goes, whatever its decommission says
        await decommission({ repo: c.dir }).catch(() => null)
        // catch: and whatever its stop says
        await stop({ repo: c.dir, pid: s.pid }).catch(() => null)
        rmSync(c.dir, { recursive: true, force: true })
      })
      throw new Error(`its commission failed: ${done?.error ?? 'its runtime gone'} (${target}, nothing of it left)`)
    }
    record.commission = done.state
    // its service's state as its commission left it, said with the deploy
    // catch: no service state there: none to say
    record.service = await openRepo(p2pgitBackend(join(c.dir, '.git'), { fs })).read('/runtime/service.json').then(b => JSON.parse(b.toString()).state ?? null, () => null)
  } else exec.log('verbose', 'no runtime', { package: target })
  // Its node, in main, and beside it its shortcuts: which mrepo, and the
  // link's key: what is needed to show it. The rest in the links layer.
  exec.put(c.node, Buffer.from('{}\n'))
  exec.put(c.links, Buffer.from(JSON.stringify([{ mrepo: c.mrepo, link }], null, 2) + '\n'))
  exec.put(c.local(link), Buffer.from(JSON.stringify(entry(), null, 2) + '\n'))
  // The mrepo registry, where this mrepo keeps one (the boot mrepo): the
  // mrepo's node there, by its unique URI, with the same record.
  if (await c.registers()) {
    for (const r of c.ranks) if (await exec.find(r) === null) exec.put(r, Buffer.from('{}\n'))
    exec.put(c.registry, Buffer.from(JSON.stringify(entry(), null, 2) + '\n'))
  }
  exec.log('info', 'deployed', { at: c.at, mrepo: c.mrepo, package: target, commission: record.commission ?? null })
  return { deployed: c.at, mrepo: c.mrepo, ...record }
}
