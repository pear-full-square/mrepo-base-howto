# script

A how-to's script, `steps.haicc`, read into its scene and its steps; a line's answer and its checks.

## Functions

- `keyOf(key)`: a how-to's key, `<org>/<package>/<name>`: its package
  and its script's place in it, `/howto/<name>/steps.haicc`; anything
  else an error.
- `parse(text)`: `{ needs, scene, steps }`; a line `{ n, line, at,
  words, expects }`, `at` its position. An error says the line: one
  before the first step, a line with no command, an option of the haicc
  command first (`--raw`: a line is a request), an expect under no line,
  a scene after a step, a step with no line, an unknown need.
- `partsOf(line)`: what it is sent as from `.`: the command at `.`, else
  `haicc <position> ...`, a hop.
- `answerOf(form)`: the text checked, its output as one line of JSON,
  or `error: <message>`.
- `checksOf(line, answer, failed)`: `{ ok, checks, failed? }`, each
  fragment in the answer; a failed request passes only with an expect
  starting `error:`.
- `excerptOf(answer)`, `said(lines)`: an answer cut to its start, and
  what lines that did not pass say, for an answer in natural language.

## Design

- **A fact once**: the script is what the page shows (its `## Steps`,
  filled at info extraction) and what a run runs.
- **Each line as typed after `haicc`**: read by the request module's
  `words`, as the shell splits it; one line a command, no variables.
