// entry: a completed request, as an mrepo's outbox holds it, made a log
// record (README.md beside it).
import { nameOf } from 'mrepo-base-request'

// envelope: the outbox's record: in it the record as it was sent, in that
// its completed form. -> { key, timestamp, value }: the log record's key
// (the request's), its time (when it was completed) and its value; null
// when it is none (a layer's own config, a record not completed).
export function recordOf (envelope) {
  const core = envelope?.value
  const form = core?.value
  if (!form || typeof form !== 'object' || Array.isArray(form) || !('output' in form || 'error' in form)) return null
  const ms = Date.parse(envelope.timestamp) - Date.parse(core.timestamp)
  return {
    key: nameOf(envelope.offset),
    timestamp: envelope.timestamp,
    value: {
      request: nameOf(envelope.offset),
      // when it was sent; how long until it was completed
      sent: core.timestamp ?? null,
      ms: Number.isFinite(ms) ? ms : null,
      // who asked: the topic the answer went to
      from: core.topic ?? null,
      command: Array.isArray(form.command) ? form.command.join(' ') : `${form.protocol}/${form.action}`,
      ok: !('error' in form),
      error: form.error ?? null
    }
  }
}
