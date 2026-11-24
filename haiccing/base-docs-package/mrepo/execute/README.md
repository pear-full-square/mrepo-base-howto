# /execute/<offset>/<target>

Execution branches: a request's own, by its offset, holding its work until it is squashed into its target.

A request is processed on branches of its own, never in a shared place.
Each is made from its target's head, squashed into that target only,
then removed. A failed request's branches are discarded, nothing
squashed. No history is kept here: `request/done` has it.

```
/execute/<key>/main              its writes to main
/execute/<key>/runtime           its writes to the runtime layer
/execute/<key>/request/execute   its own record: the principal
```

Derived, not a layer of its own.

## Squashed

At the request's end each branch that moved becomes one commit on its
target, the request's, its only parent the target's head. What the
request did on its branch, commit by commit, stays out of the target's
history.

## Principal

The request a branch is named after is its principal: the branch id is
the request's key. A request goes from `request/pending` straight onto
`execute/<key>/request/execute`, and that branch only ever adds: the
principal, what it waits for, a child's response, its completion. Then it
is merged into `request/execute`, a plain merge: the request's record
keeps its steps.

## Waiting

A request branch that is not being processed has a waiting principal: it
has passed its command on to another mrepo and says which child it waits
for. The branch is the address the other mrepo answers to,
`/<mrepo>/execute/<key>`, and where the response is added, a record of its
own beside the principal.
