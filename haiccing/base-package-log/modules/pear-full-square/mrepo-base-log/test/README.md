# test/

The tests of mrepo-base-log, a section per file, each test by its name.

## `log.test.js`

- a completed request made a log record: its request, when, how long, who asked, the command, how it ended
- each node's log a topic of its own, written from its outbox; synced lazily to the master; read there in one view, by node
