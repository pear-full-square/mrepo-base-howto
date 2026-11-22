# continuation-script

A package's scripts: lines of simple commands in scripts/, run where the haicc command points, by name.

Pattern: continuation-script

A package's `scripts/<name>.haicc` holds lines, each a simple command.
It is run with `haicc/script`, its lines sent as one command to the
root, `haicc . haicc/script <position> '<lines>'` (or on stdin): they run
at that position, one after the other. Nothing runs a script with a
deploy: what a package does once deployed is its `commission` hook (the
how-to `commission`).

## Steps

```sh
# the script: commands for where it will be run, from that place
cat > haiccing/<pkg>/scripts/cluster.haicc <<'END'
# cluster: a swarm and its nodes
crud/create swarms/swarm-1 '{"kind":"swarm"}'
boot/deploy swarms/swarm-1/node-1 haiccing/base-component-haicc
END
# its README: scripts/, each script with what it does
$EDITOR haiccing/<pkg>/scripts/README.md
# the check: run at a deployed mrepo, every line done
haicc . haicc/script <name> < haiccing/<pkg>/scripts/cluster.haicc
```

## Notes

- **The first line that fails** stops the script and fails the command,
  saying which line.
- **The deployed mrepo need not link the haicc protocol**: the root runs
  the script, each line a hop to it.
