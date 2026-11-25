# haiccing (folder)

The `haiccing` organisation's repositories, as they are developed here,
each at `haiccing/<repo>`, in the package structure
(`base-docs-package/`):

- Packages, each one protocol: `base-package-runtime/`, the runtime;
  `base-package-protocol/`, the activation of protocols;
  `base-package-info/`, an mrepo's pages by keywords; `base-package-boot/`, the boot protocol;
  `base-package-service/`, the service; `base-package-haicc/`, haicc;
  `base-package-crud/`, structure in `main`; `base-package-container/`,
  an mrepo's replica in a container; `base-package-swarm/`, a host's
  node management: swarms, their masters and nodes; `base-package-rns/`,
  a swarm's lookup db on every node; `base-package-dispatch/`, a command
  routed to a node of the swarm by its unique URI; `base-package-splectral/`,
  Splectral: the commands of an install shown in a browser, an mrepo of
  its own beside the host.
- Components, several packages deployed together: `base-component-boot/`,
  the initial boot mrepo and the program that puts it in place;
  `base-component-haicc/`, the haicc mrepo; `base-component-node/`, a
  swarm's node: the haicc mrepo with its swarm's lookup
  and dispatch on it.
- `base-app-haicc/`: the `haicc` command, an app run with Bare.
- `base-linux-haicc/`: the first step on Linux, sh scripts: Bare put in
  place and the `haicc` that starts the app.
- `base-docs-package/`, `base-docs-hdlc/`, `base-docs-vision/`,
  `base-docs-uri/`, `base-docs-xpath/`, `base-docs-haicc/`: the
  documentation packages; `base-component-docs/`, the mrepo they are
  read from.

Their `modules/` are assembled by `tools/package-assemble.js`, their
bundles written into `sources/` by `tools/package-bundle.js`; all of it
by `tools/release.js`. Each is written to its repository from here.
