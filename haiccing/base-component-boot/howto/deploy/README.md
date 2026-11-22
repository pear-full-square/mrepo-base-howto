# deploy

Deploys the host, the mrepo a machine is managed with, and brings it into service.

## Steps

```sh
# the host: an mrepo of its own, built from the haicc component and linked
# here at host; its commission, run by its runtime as it starts, makes it
# ready (its info extracted) and opens its door (it can deploy mrepos and
# hold structure in its main) before the deploy answers
haicc . boot/deploy host haiccing/base-component-haicc
# the check: the host answers with its root
haicc host crud/read .
```

## Then

Once the host is deployed (the steps above), what can be done in it is
its own to say: `haicc host info/get`. Before that, `host` is no node
there.
