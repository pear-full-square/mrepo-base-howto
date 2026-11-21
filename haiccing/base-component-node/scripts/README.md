# scripts/

The scripts of base-component-node: scripts to go on with after a deploy, their lines simple commands.

Asked for with the deploy, by name, a script is answered as the deploy's
continuation, and the `haicc` command sends it on, `haicc/script`, to
the deployed mrepo.

| script | |
|---|---|
| `start.haicc` | the mrepo brought into service: `service/initialise`, then `service/start` |

A swarm's node needs none: `swarm/deploy` brings it into service.
