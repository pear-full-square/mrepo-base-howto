# send

Routes a command to the node of the swarm its unique URI names and answers with what that node answered.

## Signature

`send(exec, { uri, args })`: requested as `dispatch/send <unique URI>
<command>`. `uri` is the node's unique URI as written, `swarm-1/node-2`;
what follows it is a position in that node.

## Arguments

The command, as typed: `<protocol>/<action> [<URI>] [<argument>...]`.
Required.

## Returns

What the command answered at that node. The request waits for it: sent
on, as to a linked mrepo.

## Errors

- No unique URI: `missing argument: target`; one name only, or a name
  that is none: `not a unique URI`. No command: `missing argument:
  command`.
- No node registered by it: `no node of the swarm by that unique URI`.
- A node on another machine: `not reachable yet`, with the machine.
- The node in no swarm, or its rns not running: as its rns says it.
