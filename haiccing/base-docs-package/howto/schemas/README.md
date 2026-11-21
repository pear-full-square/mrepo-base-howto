# schemas

A package's schemas: AVRO, a file each in schemas/, named by its URI, registered when it is deployed.

Pattern: schemas

A schema is a type a package's data has where it is written in binary:
a record in a topic, an answer streamed to a viewer. The package carries
it in `schemas/<name>.json`, its AVRO name the fullname of its URI.
Deploying the package registers it in the install's registry, by
fingerprint and by URI; a binary record names its schema by fingerprint,
and is read by whoever has the registry, as written or as the reader
needs (is-like).

## Steps

The steps, as typed after `haicc`, are `steps.haicc` beside this page:

```sh
# the schema: its AVRO name the fullname of <org>/<package>/<name>
cat > haiccing/<pkg>/schemas/<name>.json <<'END'
{ "type": "record", "name": "haiccing.<pkgCamel>.<NameCamel>", "fields": [ ... ] }
END
# its README: schemas/, each schema with what it is
$EDITOR haiccing/<pkg>/schemas/README.md
# deployed: registered; every schema an mrepo's packages carry, by URI and fingerprint
haicc host info/get schemas
# a binary record decoded, every level, by the install's registry
haicc host crud/read <layer path>.avro --flags layer=<layer>
```

## Notes

- **A new version is a new schema**: change it and its fingerprint
  changes; records written with the old one still name it, and still
  read.
- **Where nothing is typed yet**, the `json` type
  (`pear-full-square/mycelium-value-avro/json`) carries the value.
