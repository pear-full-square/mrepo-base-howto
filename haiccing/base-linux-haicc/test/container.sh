#!/bin/sh
# The haicc command installed in a container, as on a machine, from the
# host's sources: the prerequisite of a node run in its container. A plain
# Debian container, nothing of haicc in its image: the installer, the
# sources mounted read only at the same path as on the host and linked,
# Bare put in place from them, the boot, a host in service, commands, the
# teardown. Its home folder is a temporary one of the host's, removed after;
# the container removed after.
#   sh test/container.sh [--keep]
#     --keep    the container and its folder left as they are (printed)
#   SOURCES     as for run.sh; without one: skipped
#   Docker      its daemon answering; else skipped
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
n=0; failed=0
ok () { n=$((n + 1)); echo "ok $n - $1"; }
no () { n=$((n + 1)); failed=$((failed + 1)); echo "not ok $n - $1"; [ -z "${2:-}" ] || echo "  # $2"; }
is () { if [ "$1" = "$2" ]; then ok "$3"; else no "$3" "got: $1; expected: $2"; fi; }
has () { case "$1" in *"$2"*) ok "$3" ;; *) no "$3" "got: $1; expected in it: $2" ;; esac; }

# The image: a plain base, the one the nodes' containers are made from.
IMAGE=debian:bookworm-slim
T=$(mktemp -d "${TMPDIR:-/tmp}/haicc-container.XXXXXX")
chmod 777 "$T"
C=haicc-install-$(basename "$T" | tr 'A-Z.' 'a-z-')
cleanup () {
  if [ "$keep" = yes ]; then echo "kept: container $C, folder $T"; return; fi
  docker rm -f "$C" >/dev/null 2>&1
  # its files are the container user's, the host's own user: removable here
  case "$T" in "${TMPDIR:-/tmp}"/haicc-container.*) rm -rf "$T" ;; esac
}
trap cleanup EXIT

# 1. The container: haicc's home a folder of the host's, the sources read
# only where the host has them, the installer; as the host's user. --init:
# a process that reaps the runtimes started in the background once they
# end, as an init does on a machine (without one, a stopped runtime stays a
# zombie and counts as running).
docker run -d --init --name "$C" --label "haicc.folder=$T" \
  --user "$(id -u):$(id -g)" -e HOME=/haicc -e HAICC_HOME=/haicc -e HAICC_TIMEOUT=120 \
  -v "$T:/haicc" -v "$SOURCES:$SOURCES:ro" -v "$pkg/haicc-install.sh:/install/haicc-install.sh:ro" \
  --entrypoint sleep "$IMAGE" infinity >/dev/null 2>&1
is $? 0 "a plain container ($IMAGE), haicc's home a folder of the host's, the sources read only at the host's path"
in_c () { docker exec "$C" "$@" 2>&1; }
haicc () { in_c /haicc/cmd/haicc "$@"; }

# 2. The install, as on a machine
out=$(in_c sh /install/haicc-install.sh --home=/haicc --bin=/haicc/cmd); is $? 0 "the installer, in the container"
out=$(haicc sources link "$SOURCES"); is $? 0 "haicc sources link: the host's sources, at the same path"
out=$(haicc prereq); is $? 0 "haicc prereq: what it needs is there, Bare put in place from the sources"
is "$(echo "$out" | grep -vc '^ok')" 0 "every line of it ok"

# 3. The boot and a host in service
out=$(haicc boot/deploy); is $? 0 "haicc boot/deploy: the boot mrepo, its runtime running in the container"
out=$(haicc --output . boot/deploy host haiccing/base-component-haicc --flags continuation=start); is $? 0 "haicc . boot/deploy host haiccing/base-component-haicc --flags continuation=start"
has "$out" '"state":"started"' "the host in service: its continuation run"

# 4. Commands
out=$(haicc --output host haicc/script . 'crud/create notes
crud/create notes/a
crud/read notes/a'); is $? 0 "haicc host haicc/script: lines run at the host"
has "$out" '"uri":["main","notes/a"]' "what they made read back"
out=$(haicc --output registry/local/host crud/read notes/a); has "$out" '"uri":["main","notes/a"]' "the host by its registry reference"
out=$(haicc --output . info/get boot); has "$out" '"keyword":"boot"' "haicc . info/get boot: the install's info"
out=$(haicc --output host service/stop); has "$out" '"service":"stopped"' "haicc host service/stop"

# 5. The teardown: every runtime stopped, nothing left running in the
# container, the work folder emptied
out=$(haicc boot/teardown); is $? 0 "haicc boot/teardown"
has "$out" '"runtimes":2' "said: two runtimes stopped, the boot mrepo's and the host's"
left=$(in_c sh -c 'for p in /proc/[0-9]*; do tr "\0" " " < $p/cmdline 2>/dev/null; echo; done' | grep -c 'bin/bare')
is "$left" 0 "no runtime left in the container"
is "$(ls "$T/work" 2>/dev/null)" "" "the work folder emptied; Bare, the scripts and the sources list kept"
[ -x "$T/bare/bin/bare" ] && ok "Bare kept" || no "Bare kept"

echo "# checks = $((n - failed))/$n pass"
[ "$failed" -eq 0 ] && { echo "# ok"; exit 0; }
echo "# not ok"; exit 1
