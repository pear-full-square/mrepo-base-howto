# solution

A solution: the mrepos an install is made of, deployed beside its own mrepo by its script.

Pattern: solution

A solution is a kind beside the package and the component: a list, its
own mrepo's packages, and `scripts/solution.haicc`, the install's other
mrepos deployed and brought into service. Deployed as any mrepo is, by
the segment it is deployed at (`workbench`, `local/workbench`), it
answers every deploy of it with that script as its continuation, unasked,
for the deployer's own position: the terminal sends it on, `haicc/script
.`, and what it deploys lands beside the solution's mrepo, not inside it.

## Steps

```sh
# cloned from the closest solution (the package how-to); its name base-solution-<name>
cp -a haiccing/base-solution-workbench haiccing/base-solution-<name>
# its own mrepo's list, mrepo/packages/layer.json: the packages in deploy order, itself last
$EDITOR haiccing/base-solution-<name>/mrepo/packages/layer.json
# its script, the install's mrepos: written from the deployer's place (a deploy, a hop to each)
cat > haiccing/base-solution-<name>/scripts/solution.haicc <<'END'
# solution: the install's mrepos, deployed beside it, each brought into service
boot/deploy docs haiccing/base-component-docs
boot/deploy host haiccing/base-component-haicc
haicc host service/initialise
haicc host service/start
END
# the check: deployed on a fresh install, one command, its script run after it
haicc . boot/deploy <name> haiccing/base-solution-<name>
haicc . crud/read registry/local/*
```

## Notes

- **No continuation besides**: a deploy of a solution with
  `--flags continuation=<script>` is refused, as is one into a
  container (`--flags container`): its script deploys beside it.
- **The first line that fails** stops the script and fails the command:
  a mrepo of it deployed already (`deployed already: host`) is said.
- **Torn down one by one**: its teardown is its own mrepo's; the mrepos
  it deployed are torn down each, or with the install (`haicc
  boot/teardown`). The cascade is not built yet.
- **Its own mrepo** is the install's environment: what the solution
  offers beyond the mrepos it deploys (the workbench: a `howtos` node).
