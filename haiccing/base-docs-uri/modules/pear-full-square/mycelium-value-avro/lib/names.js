// A schema's name is its URI, where it comes from (<org>/<package>/<name>,
// a module's <org>/<module>/<name>); its AVRO fullname by the data-name
// mapping (base-docs-uri, "Data names"), exact both ways: each segment of
// the namespace the data name of its URI form, the name's last segment the
// same with its first letter a capital.
//   haiccing/base-package-help/annotate-answer
//   haiccing.basePackageHelp.AnnotateAnswer
import { dataNameOf, uriFormOf, isDataName } from 'mycelium-uri'

// uri -> fullname; throws when a segment is not a data name's URI form.
export function fullnameOf (uri) {
  const parts = String(uri).split('/')
  if (parts.length < 2) throw new Error(`not a schema's URI: ${uri} (<org>/<package>/<name>)`)
  const names = parts.map(dataNameOf)
  const last = names.pop()
  return [...names, last[0].toUpperCase() + last.slice(1)].join('.')
}

// fullname -> uri; null when the name does not map (a schema from elsewhere:
// still valid, known by its fingerprint only).
export function uriOf (fullname) {
  const parts = String(fullname).split('.')
  if (parts.length < 2) return null
  const last = parts.pop()
  if (!/^[A-Z]/.test(last)) return null
  const name = last[0].toLowerCase() + last.slice(1)
  if (![...parts, name].every(isDataName)) return null
  return [...parts, name].map(uriFormOf).join('/')
}
