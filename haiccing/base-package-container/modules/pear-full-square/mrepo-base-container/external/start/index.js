// start(exec): the container protocol's start (README.md beside it).
import fs, { existsSync, rmSync } from 'bare-fs'
import { openRepo, p2pgitBackend } from 'mycelium-git'
import { join } from 'bare-path'
import { docker, available, stateOf } from '../../internal/docker/index.js'
import { replica } from '../../internal/replica/index.js'
import { commissioned } from 'mrepo-base-runtime'

// The replica's runtime's socket, in its folder: there once it listens.
const SOCKET = 'runtime.sock'

export async function start (exec, { wait = 20000 } = {}) {
  const r = replica(exec)
  const recorded = await r.recorded()
  if (!recorded) throw new Error(`no replica: ${r.at} (container/create)`)
  available()
  const name = recorded.container?.name ?? r.name
  const was = stateOf(name)
  if (was === null) throw new Error(`its container is gone: ${name} (container/remove, then container/create)`)
  if (was === 'running') { exec.log('verbose', 'running already', { container: name }); return { started: r.at, container: name, state: was } }
  // a socket left by a runtime that did not stop: not this start's
  rmSync(join(r.dir, SOCKET), { force: true })
  const state = await exec.step('container', s => ({ container: name, state: s }), async () => {
    const s = docker('start', name)
    if (!s.ok) throw new Error(`its container did not start: ${name}: ${s.err.split('\n').pop()}`)
    // up when its runtime listens: its socket in the replica's folder
    // time: the wait for its runtime, bounded
    for (const end = Date.now() + wait; Date.now() < end;) {
      const now = stateOf(name)
      if (now === 'running' && existsSync(join(r.dir, SOCKET))) return now
      if (now !== 'running') break
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    const said = docker('logs', '--tail', '5', name)
    throw new Error(`its runtime did not start in its container: ${name} (${stateOf(name) ?? 'gone'})${said.out || said.err ? `: ${(said.err || said.out).split('\n').pop()}` : ''}`)
  })
  // its commission, run by its runtime as it starts (once: a restart does
  // not again), waited for: started means in service, as its package says
  const done = await exec.step('commission', c => ({ state: c?.state ?? null, ...(c?.error ? { error: c.error } : {}) }), () => commissioned({ repo: r.dir }))
  if (done?.state === 'failed') throw new Error(`its commission failed in its container: ${name}: ${done.error}`)
  // the replica's service state as its commission left it, said with the start
  // catch: no service state there: none to say
  const service = await openRepo(p2pgitBackend(join(r.dir, '.git'), { fs })).read('/runtime/service.json').then(b => JSON.parse(b.toString()).state ?? null, () => null)
  exec.log('info', 'started', { at: r.at, container: name, commission: done?.state ?? null })
  return { started: r.at, container: name, state, service }
}
