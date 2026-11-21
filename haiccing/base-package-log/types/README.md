# types/

The core types the log package registers, an AVRO schema each.

| type | |
|---|---|
| `log-entry.avsc` | `haiccing.basePackageLog.logEntry`. A node's log record: one completed request, as `log/read` answers it. |

Each is the type's base schema, named `<org>.<package>.<name>` in data
names, a `doc` on it and on every field. What is written today is JSON
in these shapes; the encoding is a value handler's, so AVRO is another
handler.
