# types/

The core types the swarm package registers, an AVRO schema each.

| type | |
|---|---|
| `swarm.avsc` | `haiccing.basePackageSwarm.swarm`. The swarm's node: the document `swarm/create` writes at the swarm's position. |

Each is the type's base schema, named `<org>.<package>.<name>` in data
names, a `doc` on it and on every field. What is written today is JSON
in these shapes; the encoding is a value handler's, so AVRO is another
handler.
