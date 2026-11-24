# service

A service-managed mrepo: its state booted, initialised, started, moved by the service protocol.

Pattern: service

Every mrepo is service managed (the boot mrepo, the root, the one
exception): `mrepo/runtime/service.json`, the service package in its
list. It starts `booted`; `service/initialise`, `start`, `stop`,
`shutdown` move it, each running its transition's hooks first. Its setup
is its `initialise` hook; what sits behind its door is activated at
`start`. Its `commission` brings it into service after its deploy.

## Steps

```sh
# its state as it starts
echo '{ "state": "booted" }' > haiccing/<pkg>/mrepo/runtime/service.json
# the service protocol in its list, before the package that defines it
$EDITOR haiccing/<pkg>/mrepo/packages/.layer.json
# its setup in its initialise hook, not at its runtime's start
$EDITOR haiccing/<pkg>/mrepo/runtime/hooks/initialise.haicc
# brought into service by its commission, after its deploy
printf 'service/initialise\nservice/start\n' > haiccing/<pkg>/mrepo/runtime/hooks/commission.haicc
# deployed: its commission done before the deploy answers
haicc . boot/deploy <name> <pkg>
# the check: started, its door open (initialise again: not now)
haicc <name> service/initialise
```

## Notes

- **The service's own actions** are each allowed in a state: their
  config's `states`.
