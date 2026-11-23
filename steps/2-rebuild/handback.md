# Handed back to the main stream: `service-every-mrepo`, closed

From the session that did `service-every-mrepo` (2026-11-21 to
2026-11-23), with the human. The task is closed: its folder removed from
`splectrum/roadmap-2` (in git's history there, up to `6bd4eed`), its
line out of the index. Remove this note once the main stream has taken
it up.

## Done

Built, documented in the packages, validated as agreed (scoped to each
change; the last full run `7b2995e9`), on `main`:

- Every mrepo a service, the boot mrepo the one exception; the runtime
  fires `commission` after `boot`; deploy and teardown idempotent.
- The registry, `<work>/mrepos/`; `haicc/mrepos [xpath]` (`uri`,
  `position`, `package`, `running`); scripts in `<work>/scripts`.
- The docs mrepo split on package (the context in the keywords' path),
  built from the store at `initialise`, removed at shutdown; `crud` and
  `haici` in it: feedback where the documentation is read.
- The workbench: its commission deploys the docs mrepo and Splectral,
  installs the help viewer; the help viewer reads `local/docs`.
- Feedback (the human, 2026-11-23): reported locally, picked up from any
  mrepo's request log; found twice (at the root too) is fine.
- Validation: scoped per change, the full test every so often
  (`base-docs-hdlc`, "Validation").

## Handed over

1. **The local run** (`local-note.md`, "The next run", 2026-11-23):
   `main` built and tested in full, then every product repository
   pushed from the commit tested (the human: "local will push the
   product repositories"). Waits for the local agent; its note says
   what it pushed and which repositories are missing.
2. **`haici-direct-form`** (roadmap-2, new): `haici/feedback` asked
   directly records the command with its position as its URI. Asked,
   not designed.
3. **The workbench from the releases** (roadmap-2,
   `base-solution-workbench`): waits for the human to create its
   product repository, then a release, then the command tried from it.
4. **The review** (roadmap-2, `tasks/review/`): still "not started";
   much of what it covers was redone or confirmed with the human in
   this substream, and the local run pushes all of `main`. Whether it is
   done is the main stream's to settle with the human, before the local
   agent pushes.
