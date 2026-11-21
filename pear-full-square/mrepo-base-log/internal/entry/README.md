# entry

Makes a log record of a completed request, as an mrepo's outbox holds it.

## Signature

`recordOf(envelope)`: the outbox's record: in it the record as it was
sent, in that its completed form.

## Returns

`{ key, timestamp, value }`: the request's key; when it was completed;
the value `{ request, sent, ms, from, command, ok, error }`. `null` for
what is no completed record.
