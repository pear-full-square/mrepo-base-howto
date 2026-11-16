# get

Answers what can be done here: the activities, an activity's how-tos, or one how-to's steps.

The default action: `howto` alone is `howto/get`.

## Signature

`get(exec, { args })`: requested as `howto/get . [<activity> |
<activity>/<name>]`, at the mrepo itself.

## Arguments

1. Optional. None: every activity here. `<activity>`: that activity's
   how-tos. `<activity>/<name>`: one how-to.

## Returns

- None asked: `{ activities: [{ activity, howtos: [{ howto, oneliner }] }] }`.
- An activity: `{ activity, howtos: [{ howto, oneliner, package }] }`.
- One how-to: `{ howto, title, oneliner, activity, package, help, steps:
  [{ why, command }] }`: each step a command as it is typed at this
  mrepo, with why; the last is the check. `help` is where its README is
  in the help layer (`help/get . <help>`).
- Not found: `{ asked, found: false, why, activities }`: what was asked,
  why it is not there, and what there is; a warning in the request's
  log, no error.

## Errors

No how-tos extracted in this mrepo yet: `howto/extract`.
