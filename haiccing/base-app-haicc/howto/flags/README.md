# flags

Flags given to a command: how much its log holds, the layer it reads, a script to go on with.

Flags belong to a step of the command: after the last command's URI,
the last command's, to the end of the line; after a URI followed by
`--`, that step's, holding down the chain until changed.

## Steps

```sh
# more in the request's log
haicc host crud/read . --flags log=verbose
# a step's own: at the host, debug, for the hop and what follows
haicc host --flags log=debug -- haicc node-1 crud/read .
# another layer read: the requests done
haicc . crud/read "done/*[value/value/protocol='boot']" --flags layer=request
# into a container: the node deployed on its own haicc install there
haicc host boot/deploy swarms/swarm-1/node-1 haiccing/base-component-haicc --flags container
```

## Notes

- **`log`**: `info` (without it), `verbose`, `debug`. **`layer`**:
  `main` without it. **`container`**: on a deploy, the child on its own
  haicc install in a Docker container.
