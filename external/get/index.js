// get: howto/get . [<activity> | <activity>/<name>], an mrepo's how-tos
// by activity (README.md beside it).
import { LAYER } from '../../internal/howto/index.js'

export async function get (exec, { args = [] }) {
  const bytes = await exec.find(`/${LAYER}/index.json`)
  if (bytes === null) throw new Error('no how-tos extracted in this mrepo yet (howto/extract)')
  const index = JSON.parse(bytes.toString())
  const all = () => Object.entries(index).map(([activity, howtos]) => ({ activity, howtos: howtos.map(h => ({ howto: h.howto, oneliner: h.oneliner })) }))
  const what = args[0] ?? null
  // nothing asked: what can be done here
  if (what === null) { exec.log('verbose', 'activities', { activities: Object.keys(index) }); return { activities: all() } }
  const [activity, name, ...more] = what.split('/')
  // a word that is no activity here, or a how-to that is not there: said,
  // with what there is; a warning, not an error
  const none = why => { exec.log('warn', 'not found', { asked: what, why, activities: Object.keys(index) }); return { asked: what, found: false, why, activities: all() } }
  if (more.length || !activity) return none(`not an activity or a how-to: ${what} (<activity>, or <activity>/<name>)`)
  if (!index[activity]) return none(`no activity ${activity} here`)
  if (name === undefined) { exec.log('verbose', 'activity', { activity, howtos: index[activity].length }); return { activity, howtos: index[activity] } }
  if (!index[activity].some(h => h.howto === what)) return none(`no how-to ${what} here (${index[activity].map(h => h.howto).join(', ')})`)
  const howto = JSON.parse((await exec.read(`/${LAYER}/${what}.json`)).toString())
  exec.log('verbose', 'howto', { howto: what, steps: howto.steps.length })
  return howto
}
