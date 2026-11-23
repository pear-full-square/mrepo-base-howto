// The package's protocol as it is mounted: its protocol.js, what a runtime
// loads through the dispatcher's /protocol entry (imported here directly:
// this test is itself run by the dispatcher), its config value by value,
// the layer it brings, and each action run on a minimal execution: the
// layer extracted from small bundles written for the test, then read. No
// mrepo is built. Every action the config names must be run here: the
// last test fails when one was left out.
import test from '../../modules/node_modules/brittle/index.js'
import os from '../../modules/node_modules/bare-os/index.js'
import Bundle from '../../modules/node_modules/bare-bundle/index.js'
import { readFileSync, mkdtempSync, mkdirSync, writeFileSync, rmSync } from '../../modules/node_modules/bare-fs/index.js'
import { join, dirname } from '../../modules/node_modules/bare-path/index.js'
import { fileURLToPath } from '../../modules/node_modules/bare-url/index.js'
import * as mounted from '../../protocol.js'

const pkg = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const B = v => Buffer.from(typeof v === 'string' ? v : JSON.stringify(v))
const J = b => JSON.parse(b.toString())
const page = (title, line, menu = []) => `# ${title}\n\n${line}\n${menu.length ? `\n## Links\n\n${menu.map(([l, t]) => `- [${l}](${t})`).join('\n')}\n` : ''}`

// An execution as an action sees it: its files by path, its writes
// applied at once; the mrepo's folder, its packages' bundles in it.
function execution (files = {}, dir = null) {
  const abs = p => (p.startsWith('/') ? p : `/${p}`)
  const writes = []
  const exec = {
    runtime: { dir },
    read: async p => { if (!(abs(p) in files)) throw new Error(`nothing at ${p}`); return files[abs(p)] },
    find: async function (p) { try { return await this.read(p) } catch { return null } },
    log: function (level, event, data = {}) { (this.entries ??= []).push({ level, event, ...data }) },
    step: async function (event, data, fn, level = 'verbose') { const r = await fn(); (this.entries ??= []).push({ level, event, ...(typeof data === 'function' ? data(r) : data) }); return r },
    put: (p, bytes) => { writes.push(['put', abs(p)]); files[abs(p)] = Buffer.from(bytes) },
    remove: p => { writes.push(['remove', abs(p)]); delete files[abs(p)] }
  }
  return { exec, files, writes }
}
function bundle (dir, name, files) {
  const b = new Bundle()
  for (const [p, text] of Object.entries(files)) b.write(p, B(text))
  mkdirSync(join(dir, 'packages', name.split('/')[0]), { recursive: true })
  writeFileSync(join(dir, 'packages', `${name}.bundle`), b.toBuffer())
}
const ran = new Set()
// an action that wrote into the execution's log as it ran: every one must
const logged = new Set()
const act = async (name, exec, form) => {
  ran.add(name)
  const before = exec.entries?.length ?? 0
  try { return await mounted.actions.info[name](exec, form) } finally { if ((exec.entries?.length ?? 0) > before) logged.add(name) }
}

test('loaded as a runtime loads it: one protocol, info, its config and its actions', (t) => {
  t.alike(Object.keys(mounted.protocols), ['info'], 'the package provides the info protocol, and no other')
  t.alike(Object.keys(mounted.actions), ['info'])
  t.alike(Object.keys(mounted.actions.info).sort(), Object.keys(mounted.protocols.info.actions).sort(), 'a function for every action configured, and no other')
})

test('its config, value by value; the layer it brings', (t) => {
  const cfg = mounted.protocols.info
  t.is(cfg.package, 'haiccing/base-package-info', 'the package that brings it')
  t.ok(cfg.description, 'its description')
  t.alike(Object.keys(cfg).sort(), ['actions', 'default', 'description', 'package'], 'nothing else: not behind a state')
  t.is(cfg.default, 'get', 'its default action: info alone is info/get')
  t.alike(Object.keys(cfg.actions).sort(), ['clear', 'extract', 'get'])
  t.alike([cfg.actions.get.uris, cfg.actions.extract.uris, cfg.actions.clear.uris], [['**'], ['.'], ['.']], 'get: its keywords where the URI is; extract and clear: at the mrepo itself')
  for (const [name, a] of Object.entries(cfg.actions)) {
    t.ok(a.description, `${name}: its description`)
    t.absent('states' in a || 'target' in a, `${name}: no states, no target`)
  }
  t.alike(['args' in cfg.actions.get, 'args' in cfg.actions.extract, 'args' in cfg.actions.clear], [false, false, false], 'no argument asked for: get\'s keywords are its URI, none the top')
  const layer = JSON.parse(readFileSync(join(pkg, 'mrepo', 'info', 'layer.json'), 'utf8'))
  t.alike([layer.mode, Boolean(layer.description)], ['atomic', true], 'its structure: the info layer, atomic')
})

test('extract, then get, then clear: the layer from the packages, read by keywords in a package\'s context, its build removed', async (t) => {
  const dir = mkdtempSync(join(os.tmpdir(), 'info-mounted-'))
  try {
    bundle(dir, 'haiccing/base-package-one', {
      '/README.md': page('base-package-one', 'The one protocol.', [['go', 'modules/pear-full-square/mrepo-base-one/external/go/']]),
      '/modules/pear-full-square/mrepo-base-one/README.md': page('mrepo-base-one', 'The one module.', [['external', 'external/']]),
      '/modules/pear-full-square/mrepo-base-one/external/README.md': page('external/', 'Its actions.', [['go', 'go/']]),
      '/modules/pear-full-square/mrepo-base-one/external/go/README.md': page('go', 'Goes.')
    })
    bundle(dir, 'haiccing/base-component-two', {
      '/README.md': page('base-component-two', 'The two component.') + '\n## Included packages\n\n- [base-package-one](../base-package-one/)\n',
      '/mrepo/packages/layer.json': { packages: ['haiccing/base-package-one', 'haiccing/base-component-two'] }
    })
    const { exec, files, writes } = execution({ '/packages/manifest.json': B({ packages: { 'haiccing/base-package-one': {}, 'haiccing/base-component-two': {} } }) }, dir)
    await t.exception(act('get', exec, {}), /no info extracted in this mrepo yet \(info\/extract\)/, 'get before any extraction: said')
    const r = await act('extract', exec, { uri: ['.'] })
    t.alike([r.changed, r.problems], [true, 0], 'extract: written, no problem')
    t.ok(files['/info/index.json'] && files['/info/problems.json'] && files['/info/layer.json'], 'the layer: its index, its problems, its config when it had none')
    t.ok(J(files['/info/index.json'])['modules/mrepo-base-one/external/go'], 'the module once, under modules')
    const n = writes.length
    t.alike([(await act('extract', exec, { uri: ['.'] })).changed, writes.length], [false, n], 'again: nothing changed, nothing written')
    await t.exception(act('extract', exec, { uri: ['main', 'x'] }), /info extract: the whole mrepo only/)
    const top = await act('get', exec, {})
    t.alike([top.choices[0].title, top.choices[0].below.map(b => b.keyword)], ['base-component-two', ['haiccing', 'modules', 'third-party', 'schemas']], 'the top: the mrepo\'s own package, its organisation, the pages made here')
    const org = await act('get', exec, { uri: ['main', 'haiccing'] })
    t.alike(org.choices[0].below.map(b => b.keyword), ['haiccing/base-component-two', 'haiccing/base-package-one'], 'its organisation: its packages, each by its name fully qualified, the mrepo\'s own first')
    const go = await act('get', exec, { uri: ['main', 'haiccing/base-package-one/go'] })
    t.alike([go.choices[0].title, go.choices[0].oneliner], ['go', 'Goes.'], 'an action, reached by a jump into its module')
    await t.exception(act('get', exec, { uri: ['main', 'haiccing/base-package-one/stop'] }), /no haiccing\/base-package-one\/stop here: nearest haiccing\/base-package-one, below it go/, 'not there: the nearest, and what is below it')
    t.is((await act('get', exec, { uri: ['main', 'go'] })).context, 'haiccing/base-package-one', 'a short keyword: the package that has it, its context said')
    t.ok((await act('clear', exec, { uri: ['.'] })).removed > 0, 'clear: the build removed')
    await t.exception(act('get', exec, {}), /no info extracted in this mrepo yet/, 'nothing to read after it')
  } finally { rmSync(dir, { recursive: true, force: true }) }
})

test('every action the config names was run here', (t) => {
  t.alike([...ran].sort(), Object.keys(mounted.protocols.info.actions).sort(), 'extract, get and clear')
  t.alike([...logged].sort(), Object.keys(mounted.protocols.info.actions).sort(), 'and each wrote into the request\'s log as it ran: an action that logs nothing fails this')
})
