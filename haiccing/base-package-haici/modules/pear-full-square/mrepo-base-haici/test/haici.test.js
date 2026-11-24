import test from 'brittle'
import { feedback } from '../index.js'

// An mrepo as an execution reads it: its request's id, its runtime's view
// (the protocols loaded); nothing it may write.
function execution (protocols) {
  const logged = []
  const nope = () => { throw new Error('written') }
  return { id: '1795312345678', logged, runtime: { protocols }, put: nope, remove: nope, log: (level, event, data) => logged.push([level, event, data]) }
}
const PROTOCOLS = { crud: { default: 'read', actions: { read: { uris: ['**'] } } } }

test('feedback: recorded on an execution written for it: the command as understood, the request\'s id, the command to read it back, its answer; nothing written', async (t) => {
  const exec = execution(PROTOCOLS)
  const f = await feedback(exec, { uri: ['main', 'swarms'], args: ['the list is empty', 'crud/read'] })
  t.alike(f, {
    feedback: 'recorded',
    on: 'crud/read swarms',
    id: '1795312345678',
    read: 'crud/read done/17953/179531/1795312345678.json --flags layer=request',
    answer: ['Feedback on crud/read swarms recorded: request 1795312345678.', 'To read it back: crud/read done/17953/179531/1795312345678.json --flags layer=request']
  }, 'a fixed place each, and the answer in natural language')
  t.is((await feedback(exec, { uri: ['main', 'swarms'], args: ['x', 'crud'] })).on, 'crud/read swarms', 'the protocol alone: its default action')
  t.is((await feedback(exec, { uri: ['main', 'x'], args: ['x', 'crud/create', 'a b'], flags: { log: 'debug' } })).on, 'crud/create x "a b" --flags log=debug', 'its arguments as typed, its other flags kept')
  t.is((await feedback(exec, { uri: ['main', 'x'], args: ['x', 'nope/thing'] })).on, 'nope/thing x', 'a command the door would refuse: recorded all the same')
  t.ok(exec.logged.some(([level, event, d]) => level === 'verbose' && event === 'recorded' && d.id === '1795312345678'), 'what it did, logged')
})

test('feedback: no text, no command', async (t) => {
  const exec = execution(PROTOCOLS)
  await t.exception(feedback(exec, { uri: ['main', 'x'], args: [] }), /missing argument: text/)
  await t.exception(feedback(exec, { uri: ['main', 'x'], args: [' ', 'crud/read'] }), /missing argument: text/, 'a text of spaces')
  await t.exception(feedback(exec, { uri: ['main', 'x'], args: ['some text'] }), /missing argument: command/)
  await t.exception(feedback(exec, { uri: ['main', 'x'], args: ['some text', '--flags'] }), /missing argument: command/, 'a word that is no command')
})
