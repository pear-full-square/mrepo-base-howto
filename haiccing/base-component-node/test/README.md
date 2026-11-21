# test/

The node component's tests: one of its own, `configured`, and the generic ones, a folder each.

## Links

- [configured](configured/)
- [info](info/)
- [code](code/)
- [mrepo](mrepo/)
- [package](package/)
- [modules](modules/)
- [info-in-situ](info-in-situ/)
- [mrepo-in-situ](mrepo-in-situ/)

## Sets

| set | tests |
|---|---|
| `validate` | `configured`, `info`, `code`, `mrepo`, `package` |
| `validate-in-situ` | `info-in-situ`, `mrepo-in-situ`: run in a running mrepo with `runtime run` |
| `full` | `configured`, `info`, `code`, `mrepo`, `package`, `modules` |
