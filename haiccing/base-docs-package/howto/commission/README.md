# commission

A package's commission and decommission: what its mrepo does once deployed, and before its teardown.

Pattern: commission

Two hooks of the lifecycle, the package's: `commission.haicc`, run by
the mrepo's runtime once, as it starts after its deploy, the deploy
waiting for it; `decommission.haicc`, run when a teardown asks, before
the runtime is stopped. Their lines are the mrepo's own (not held at its
door). The deploy names no service: the package decides, typically
`service/initialise` then `service/start`. A solution's commission
deploys its components first, each commissioned by its own (the
cascade), then brings itself into service; its decommission tears them
down.

## Steps

```sh
# what its mrepo does once deployed: its components, then its service
cat > haiccing/<pkg>/mrepo/runtime/hooks/commission.haicc <<'END'
# commission: run once by the runtime as it starts after the deploy
boot/deploy docs haiccing/base-component-docs
service/initialise
service/start
END
# what it does before it goes: what it deployed torn down
cat > haiccing/<pkg>/mrepo/runtime/hooks/decommission.haicc <<'END'
boot/teardown docs
END
# its configured test names both, line by line, and walks them
$EDITOR haiccing/<pkg>/test/configured/configured.test.js
# the check: deployed, its commission done before the deploy answers
haicc . boot/deploy <name> <pkg>
# torn down: its decommission first
haicc . boot/teardown <name>
```

## Notes

- **Idempotent**: the runtime runs the commission at every start (a
  deploy, a restart, a replica's with its container); nothing records it
  done. Each line is an idempotent action (`base-docs-hdlc`, "Every
  action is idempotent"): a deploy of what is there is a warning, a
  service in its state already runs its hook again, a node there is left
  as it is. Write the hook so that running it again changes nothing.
- **A line that fails** fails the deploy, the line said, nothing of the
  mrepo left (what it deployed so far decommissioned, as it can be); a
  decommission line that fails stops the teardown, nothing removed.
- **Bottom up**: a commission deploys its components before its own
  `service/initialise`; a component's own commission brings it into
  service before the deploy of it answers.
- **No commission**: a package deployed as a base to lay another on
  (`base-package-service`, under a Splectral component): what lays on
  it brings it into service.
