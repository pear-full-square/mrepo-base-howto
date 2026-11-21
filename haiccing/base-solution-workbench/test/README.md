# test/

The workbench's tests: two of its own, `configured` and `workbench`, and the generic ones, a folder each.

The generic ones come with the template: `info`, `code`, `mrepo`,
`package`, `modules`, `info-in-situ`, `mrepo-in-situ`.

## Links

- [configured](configured/)
- [workbench](workbench/)
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
| `validate` | `configured`, `workbench`, `info`, `code`, `mrepo`, `package` |
| `validate-in-situ` | `info-in-situ`, `mrepo-in-situ`: run in a running mrepo with `runtime run` |
| `full` | `configured`, `workbench`, `info`, `code`, `mrepo`, `package`, `modules` |
