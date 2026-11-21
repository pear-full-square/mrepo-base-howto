#!/bin/sh
# The pair deploy tested against everything on the host: one scenario, a
# host with a swarm's node that deploys an mrepo of its own, run twice:
# the node deployed on the host, and the node deployed into a container
# on the container's own haicc install (--flags container), the host
# forwarding to it. The same commands and checks in both; the pair's own
# checks besides; each step timed, the two side by side at the end.
#   sh test/pair.sh [--keep]
#     --keep    the temporary folders left as they are (printed)
#   SOURCES     as for run.sh; without one: skipped
#   Docker      its daemon answering, debian:bookworm-slim there; else skipped
# One line a check (ok, not ok), the count last; exit 0 passed, 1 failed.
set -u
here=$(cd "$(dirname "$0")" && pwd)
pkg=$(cd "$here/.." && pwd)
keep=no
[ "${1:-}" = --keep ] && keep=yes
HAICC_HOME=$pkg . "$pkg/bin/haicc-lib.sh"   # the pins, this machine's Bare chosen
SOURCES=${SOURCES:-$pkg/../../sources}
for f in "$HAICC_ORG/$APP_PACKAGE.bundle" "$HAICC_ORG/base-component-boot.bundle" "$HAICC_ORG/base-component-haicc.bundle" "$BARE_FILE"; do
  [ -f "$SOURCES/$f" ] || { echo "skipped: no $f in $SOURCES (SOURCES: a sources folder)"; exit 0; }
done
SOURCES=$(cd "$SOURCES" && pwd)
v=$(docker version --format '{{.Server.Version}}' 2>/dev/null) && [ -n "$v" ] || { echo "skipped: Docker does not answer"; exit 0; }
docker image inspect debian:bookworm-slim >/dev/null 2>&1 || { echo "skipped: no debian:bookworm-slim (docker pull it first)"; exit 0; }
n=0; failed=0
ok () { n=$((n + 1)); echo "ok $n - $1"; }
no () { n=$((n + 1)); failed=$((failed + 1)); echo "not ok $n - $1"; [ -z "${2:-}" ] || echo "  # $2"; }
is () { if [ "$1" = "$2" ]; then ok "$3"; else no "$3" "got: $1; expected: $2"; fi; }
has () { case "$1" in *"$2"*) ok "$3" ;; *) no "$3" "got: $1; expected in it: $2" ;; esac; }
ms () { echo $(( $(date +%s%N) / 1000000 )); }
TIMES=$(mktemp)
FOLDERS=""
cleanup () {
  for T in $FOLDERS; do
    if [ "$keep" = yes ]; then echo "kept: $T"; continue; fi
    PATH=$T/bin:$PATH HAICC_HOME=$T/home haicc boot/teardown >/dev/null 2>&1
    for id in $(docker ps -aq --filter label=haicc.folder); do
      case "$(docker inspect --format '{{index .Config.Labels "haicc.folder"}}' "$id" 2>/dev/null)" in "$T"/*) docker rm -f "$id" >/dev/null 2>&1 ;; esac
    done
    case "$T" in "${TMPDIR:-/tmp}"/haicc-pair.*) rm -rf "$T" ;; esac
  done
  rm -f "$TIMES"
}
trap cleanup EXIT

# The scenario, in one mode: host (the node on the host) or pair (the node
# in a container). Each step timed into TIMES: <mode> <step> <ms>.
scenario () {
  mode=$1
  T=$(mktemp -d "${TMPDIR:-/tmp}/haicc-pair.XXXXXX")
  FOLDERS="$FOLDERS $T"
  H=$T/home
  sh "$pkg/haicc-install.sh" --home="$H" --bin="$T/bin" >/dev/null
  haicc () { PATH=$T/bin:$PATH HAICC_HOME=$H HAICC_TIMEOUT=240 "$T/bin/haicc" "$@" 2>&1; }
  step () { s=$(ms); out=$(haicc "$@"); r=$?; echo "$mode $label $(( $(ms) - s ))" >> "$TIMES"; return $r; }
  flag=""; [ "$mode" = pair ] && flag="--flags container"
  N=host/swarms/swarm-1/node-1
  echo "# $mode"
  haicc sources link "$SOURCES" >/dev/null; haicc prereq >/dev/null
  label=boot; step boot/deploy; is $? 0 "$mode: haicc boot/deploy"
  label=host; step --output . boot/deploy host haiccing/base-component-haicc --flags continuation=start; is $? 0 "$mode: the host deployed and started"
  label=swarm; step --output host crud/create swarms/swarm-1 '{"kind":"swarm"}'; is $? 0 "$mode: a swarm at the host"
  # shellcheck disable=SC2086
  label=deploy; step --output host boot/deploy swarms/swarm-1/node-1 haiccing/base-component-haicc $flag; is $? 0 "$mode: the node deployed${flag:+ ($flag)}"
  has "$out" '"mrepo":"swarm-1/node-1"' "$mode: by its unique URI"
  if [ "$mode" = pair ]; then
    has "$out" '"container":{"name":"haicc-pair-swarm-1-node-1-' "pair: in its container"
    is "$(docker ps -q --filter "label=haicc.folder=$H/work/containers/swarm-1/node-1" | wc -l | tr -d ' ')" 1 "pair: the container running, labelled with the pair's folder"
    is "$(ls "$H/work/mrepos/swarm-1" 2>/dev/null)" "" "pair: nothing of the node in the host's mrepos"
  fi
  label=initialise; step --output $N service/initialise; has "$out" '"state":"initialised"' "$mode: the node's service initialised, through the host"
  label=start; step --output $N service/start; has "$out" '"state":"started"' "$mode: started"
  label=create; step --output $N crud/create notes/a '{"x":1}'; has "$out" '"outcome":"created"' "$mode: a node made in the node's main"
  label=read; step --output $N crud/read notes/a; has "$out" '"value":{"x":1}' "$mode: read back"
  label=script; step --output $N haicc/script . 'crud/create notes/b
crud/read notes/b'; has "$out" '"line":"crud/read notes/b"' "$mode: a script's lines at the node"
  label=sub; step --output $N boot/deploy sub haiccing/base-component-haicc; has "$out" '"deployed":"sub"' "$mode: the node deploys an mrepo of its own"
  label=sub-init; step --output $N/sub service/initialise; out2=$out
  label=sub-start; step --output $N/sub service/start; has "$out2$out" '"state":"started"' "$mode: its service started, through the node"
  label=sub-read; step --output $N/sub crud/read .; has "$out" '"uri":["main","."]' "$mode: reached through the node"
  if [ "$mode" = pair ]; then
    is "$(ls "$H/work/mrepos/swarm-1" 2>/dev/null)" "" "pair: the node's mrepo is the container's: nothing of it in the host's mrepos"
  fi
  label=teardown; step --output host boot/teardown swarms/swarm-1/node-1; has "$out" '"tornDown":"swarms/swarm-1/node-1"' "$mode: the node torn down"
  if [ "$mode" = pair ]; then
    is "$(docker ps -aq --filter "label=haicc.folder=$H/work/containers/swarm-1/node-1" | wc -l | tr -d ' ')" 0 "pair: its container removed"
    [ -e "$H/work/containers/swarm-1/node-1" ] && no "pair: its folder removed" || ok "pair: its folder removed"
    # again, then the machine's teardown with the pair there
    label=deploy-again; step --output host boot/deploy swarms/swarm-1/node-1 haiccing/base-component-haicc $flag; is $? 0 "pair: deployed again"
  fi
  label=machine; step boot/teardown; is $? 0 "$mode: haicc boot/teardown"
  is "$(docker ps -aq --filter label=haicc.folder | while read -r id; do docker inspect --format '{{index .Config.Labels "haicc.folder"}}' "$id"; done | grep -c "^$T/")" 0 "$mode: no container of the install left"
  is "$(pgrep -f -- "[/]bin/bare $T/" | wc -l | tr -d ' ')" 0 "$mode: no runtime of the install left"
}

scenario host
scenario pair

echo "# timing (ms): step, the node on the host, the node as a pair"
for s in boot host swarm deploy initialise start create read script sub sub-init sub-start sub-read teardown machine; do
  a=$(sed -n "s/^host $s //p" "$TIMES"); b=$(sed -n "s/^pair $s //p" "$TIMES")
  echo "# $s ${a:--} ${b:--}"
done
echo "# checks = $((n - failed))/$n pass"
[ "$failed" -eq 0 ] && { echo "# ok"; exit 0; }
echo "# not ok"; exit 1
