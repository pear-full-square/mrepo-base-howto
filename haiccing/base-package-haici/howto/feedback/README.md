# feedback

Feedback given on a command: the feedback flag on it, recorded, read back.

The command is not run: the mrepo it would run in records the text and
the command in its request's record, and answers with the request's id
and the command that reads it back.

## Steps

```sh
# any command, the flag last, the text after it: recorded, not run
haicc host crud/read swarms --flags feedback the list is empty, a swarm was expected
# the same, asked directly: the text, then the command's <protocol>/<action> and arguments after the URI
haicc host haici/feedback swarms "the list is empty" crud/read
# read back: the record by the id answered, in the request layer
haicc host crud/read "done/*[@offset=<id>]" --flags layer=request
# all the feedback recorded there
haicc host crud/read "done/*[value/value/protocol='haici']" --flags layer=request
```
