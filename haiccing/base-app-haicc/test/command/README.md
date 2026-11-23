# test/command/

The package's own test: its program run as a command line, each run a process of its own.

The program is started through the package's dispatcher, as a platform's
`haicc` starts it, on a home folder made for the test. A folder stands in
for the root mrepo: the test answers what arrives in its inbox, as a
runtime would. No runtime is started.

## What it checks

- **The usage**: printed for `--help`, `help`, `-h` and nothing; every
  form of the command line is in it.
- **Not a command**: exit 2, said on stderr, nothing printed, for each
  way a command line can be wrong.
- **Nothing booted**: a command for the mrepos and `boot/deploy` with
  no source holding the boot component, each said, exit 3;
  `boot/teardown` a repeat, a warning, exit 0; nothing written.
- **`haicc sources`**: the list read with the folders first; `no-https`,
  `https`, `unlink` and a download, with the list as written after.
- **A command's record, value by value**: the envelope addressed to the
  root's inbox, the core addressed back to the terminal, one key, the
  parts as typed; plain at the root, the `haicc` command elsewhere; a
  first word `/run`, passed on as typed.
- **Its response**: unpacked by default, its entries packed on lines to
  the width, and packed again the record as stored; the width set with
  `haicc output` and back to `auto`; `--raw`, `--output` and their
  variables; an error, exit 1; a
  form not completed, exit 5; none in time, exit 4.
- **`boot/teardown`**: what the deploy put in place removed by name, the
  packages' scripts too, the user's and the rest of the work folder
  kept; twice, a repeat.
- **Nothing forgotten**: the last test fails when a kind of command line
  was not run here.

## Not here

The boot really run, a runtime really stopped, and commands answered by
running mrepos: they need Bare installed and the sources, so they are in
the end to end test of the platform's first step,
`haiccing/base-linux-haicc`.
