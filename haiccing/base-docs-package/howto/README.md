# howto/

How each pattern of the base family is implemented: a how-to a pattern, its steps as typed commands.

A pattern done for the first time gets a how-to, from its proof of
concept, before the implementation; the code check fails on a pattern
implemented with no how-to naming it (`Pattern: <name>`).

## Links

- [package](package/)
- [protocol-package](protocol-package/)
- [component](component/)
- [documentation-package](documentation-package/)
- [app](app/)
- [mrepo-definition](mrepo-definition/)
- [layer](layer/)
- [hooks](hooks/)
- [service](service/)
- [continuation-script](continuation-script/)
- [solution](solution/)
- [documents](documents/)
- [program](program/)
- [platform](platform/)
- [schemas](schemas/)

## Written where

Not in an install: where the packages are built, a place of the moment
the packages do not name; ask whoever runs the install. How work is
done there: `hdlc`. The how-tos run its tools (`tools/package-template.sh`,
`tools/package-test.js`, `tools/release.js`, run with `tools/bare`); its
build writes a sources folder, what an install links (`haicc sources
link <folder>`).
