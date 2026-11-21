# Feedback note: the service, found unclear in the documentation

Raised 2026-11-21 with `haici/feedback` at the root of a transient
install (the docs mrepo has no `haici`), its records kept here,
`feedback.json` (the request layer's
`done/*[value/value/protocol='haici']`), as the install is gone. The
task and the human's words: `splectrum/roadmap-2`,
`tasks/service-every-mrepo/`. To be fixed in the packages, then this
note removed.

1. `haicc docs info/get service` (`base-package-service`): "An mrepo
   that links it is service managed" reads as optional. Settled: every
   mrepo implements the service protocol, the boot mrepo the one
   exception (nothing upstream manages it); not started, an mrepo
   receives requests and does not process them. The how-to `lifecycle`
   says "refused while it is not started" (`not now`), not the same.
2. `haicc docs info/get package mrepo runtime` (`base-docs-package`,
   "Service states"): says what each state allows, not what happens to
   a request a state does not allow yet: held until `start`, or refused.
3. `haicc docs info/get docs` (`base-component-docs`): "No service": an
   omission; its info extraction at runtime start belongs to
   `initialise`.
4. `haicc docs info/get boot` (`base-component-boot`): "No service":
   right as the exception, but it should say why.
5. The docs mrepo has no `haici`: feedback on the documentation cannot
   be given where it is read; the direct form records the command as
   `info/get docs <keywords>`, its URI as the first argument rather
   than its position.
6. `base-solution-workbench`: modelled on the boot mrepo, not service
   managed; it should be a service, its `registry` and `howtos` made at
   `initialise`.
