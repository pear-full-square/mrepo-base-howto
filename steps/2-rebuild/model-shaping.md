# Model shaping: small open models for specific tasks

A design in discussion (the human, 2026-11-20). The direction, and what
is settled, is the vision's (`base-docs-vision`, "Model shaping"); here
what is still being discussed: what it asks of the roadmap, and the
first steps. What settles moves into the packages and the vision, and
leaves this file.

## Asked

The human: "Start a new document stack on this? I think it should
determine roadmap priorities. The more AI autonomy we can have the
better. Small local models that take a set of specific task out of the
main loop are very useful and once we have the p2p swarms these can run
at specific side on specific platform but used throughout the swarm."

Settled: the first specialisation is `hc` as haicc's operator.

## Proposed (ours): the order, data first

A model is only as good as the data and the evaluation it is shaped
with, and data takes time to gather: the cheap steps that start the
gathering come first, the platform's pieces (streaming, AVRO, myctral,
myctrans, the swarm) replace the stopgaps as they land.

1. **The evaluation, first** (`runnable-howtos`, settled, not built):
   every how-to runnable, each step with what it answers. It is the
   benchmark: today's headless Claude measured on it gives the baseline
   any small model has to reach.
2. **The traces, recorded** (`help-mvp`, its remainder:
   `haici/feedback`): every command and its answer is in the request
   log already; the feedback flag adds a person's judgement on one. Then
   a stopgap tool exports an install's traces as a set (JSONL), our own
   installs only.
3. **The teacher and the slots** (`claude-headless`, P7; `howto/plan`
   and `howto/explore`): headless Claude in the slots makes the first
   traces of planning; whether its answers may be trained on is the
   provider's terms', checked first (or an open teacher).
4. **The first adapter, offline**: a small open model, tuned on the set,
   served locally by an inference runtime, measured against the
   baseline on the evaluation. Kept only if it does as well on what it
   is for.
5. **Into the platform**: the model a component on the node with the
   platform for it, asked from anywhere in the swarm (`swarm-cluster`,
   then distributed applications); the stopgaps replaced by myctral and
   myctrans as they are built.

What it moves (ours): `runnable-howtos`, `haici/feedback` and
`claude-headless` ahead of the rest of `tasks.md`; `swarm-cluster` as
it is, the next phase; the reporting back to `splectrum/roadmap-1`
once agreed.

## Open

- The order above.
- Where the training runs: the local machine's hardware (a GPU?), or
  elsewhere.
- The base models: open weights under a licence that allows it, small
  enough for the nodes that run them.
- Data beyond our own installs: consent, and what a record says of it.
