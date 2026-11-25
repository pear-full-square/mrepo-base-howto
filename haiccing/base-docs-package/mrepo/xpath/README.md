# /xpath

The XPath machinery's own layers: what assists a query operationally, apart from the mrepo's data and its requests.

A namespace of its own (the human, 2026-11-24: "once we have a layer, we
can structure it as we see fit without getting it mixed in with other
concerns"). Non-atomic, on disk. Its first layer:

| layer | |
|---|---|
| `log` | the physical log: what the physical side did for each request, a record a request, under the request's offset |

## The log

- **A record of the log**: the request it is of, its command, and each
  physical query its logical ones stood for: the logical query, how it
  was read (`mode`, the storage's structure `type`), from where, the
  physical query's text, how many it gave, how long it took; `fixes`
  where it fixed a node set. Read as any topic:
  `crud/read 'log/*[@offset=<request's offset>]' --flags layer=xpath`.
- **Written as a file, committed at a checkpoint**: an execution writes
  its record into the layer's folder, `<dir>/xpath/log/`, when it ends:
  no commit, so a read stays a read. The runtime commits the folder's new
  records apart from any request: when it is idle, and at least every so
  many passes while it is busy. A commit there says nothing of one
  request: a record and its request are tied by their offset. Between
  checkpoints the newest records are in the folder, not yet in the layer.
- **Its own reads are not logged**: a request reading the `xpath`
  layers writes no record there.
- **To come, each under its own name**: indexes; what a query needs
  again and again, kept (nothing until a measurement asks for it).
