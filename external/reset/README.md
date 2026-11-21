# reset

The scene thrown away: what the steps deployed torn down, what they made removed; stepping starts again.

## Signature

`reset(exec, { args })`: requested as `howto/reset . [<org>/<package>/<name>]`.

## Arguments

1. The how-to, optional: recorded with the reset. Every how-to's stepping
   starts again either way: the scene is one.

## Returns

`{ reset, howto, cleared: { torn, removed }, answer }`: the positions
torn down (from the runner, `host/node-1` before `host`), the nodes
removed from main.

## Errors

- A key that is not one: `not a how-to: ...`.
- A teardown or a removal that fails: the command, and its error.

## Design

- **From the inside out, by the links**: a teardown does not take a
  child's own children with it (the cascade is not built), so each
  mrepo's links layer is read first and what it linked torn down before
  it. An mrepo whose links cannot be read (no crud, as Splectral, or
  not in service) is taken to have linked nothing: what it deployed is
  the how-to's to tear down, in its last step. A container a step made
  is the step's to remove.
