# types/

The core types the rns package registers, an AVRO schema each.

| type | |
|---|---|
| `lookup-entry.avsc` | `haiccing.basePackageRns.lookupEntry`. The lookup db's entry: the record `rns`'s master appends, folded into who is registered and active. |

Each is the type's base schema, named `<org>.<package>.<name>` in data
names, a `doc` on it and on every field. What is written today is JSON
in these shapes; the encoding is a value handler's, so AVRO is another
handler.
