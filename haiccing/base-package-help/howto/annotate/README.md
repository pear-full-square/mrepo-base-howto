# annotate

A command explained before it is run: the help flag on it, or help/annotate asked directly.

The command is answered by the mrepo it would run in, nothing of it
executed: what it does, whether it is taken there and now and if not
why, its arguments, the command to run it, where to read more.

## Steps

```sh
# any command, the flag last: answered, not run
haicc host crud/read swarms --flags help
# at the root, as the command line writes it there
haicc . boot/deploy docs haiccing/base-component-docs --flags help
# the same, asked directly: the command's <protocol>/<action> and arguments after the URI
haicc host help/annotate swarms crud/read
# its page, to read more
haicc host info/get crud/read
```
