#!/bin/sh
# A swarm on one host, end to end: an install with a host in service; a
# swarm made with its master and its lookup db; two nodes deployed into
# it, each registered by the host; who is registered and active asked of
# the host, the master and a node; a node resolved; a node gone quiet
# when its service stops, active again when it starts; what is refused;
# each node's log synced lazily to the master and read there in one view,
# by node; a command dispatched from one node to another by its unique
# URI, through rns; the log viewer, a Splectral component, its page asked over
# HTTP; a node taken out; torn down, nothing left. Each step timed.
#   sh test/swarm.sh [--keep]
#     --keep    the temporary folder left as it is, its runtimes running (printed)
#   SOURCES     as for run.sh, the splectral packages' bundles in it too; without one: skipped
# One line a check (ok, not ok), the count last; exit 0 passed, 1 failed.
set -u
here=$(cd "$(dirname "$0")" && pwd)
pkg=$(cd "$here/.." && pwd)
keep=no
[ "${1:-}" = --keep ] && keep=yes
HAICC_HOME=$pkg . "$pkg/bin/haicc-lib.sh"   # the pins, this machine's Bare chosen
SOURCES=${SOURCES:-$pkg/../../sources}
for f in "$HAICC_ORG/$APP_PACKAGE.bundle" "$HAICC_ORG/base-component-haicc.bundle" "$HAICC_ORG/base-component-node.bundle" "$HAICC_ORG/base-package-swarm.bundle" "$HAICC_ORG/base-package-rns.bundle" "$HAICC_ORG/base-package-log.bundle" "$HAICC_ORG/base-package-dispatch.bundle" "$HAICC_ORG/base-package-splectral.bundle" splectral/base-component-log-viewer.bundle "$BARE_FILE"; do
  [ -f "$SOURCES/$f" ] || { echo "skipped: no $f in $SOURCES (SOURCES: a sources folder)"; exit 0; }
done
SOURCES=$(cd "$SOURCES" && pwd)
n=0; failed=0
ok () { n=$((n + 1)); echo "ok $n - $1"; }
no () { n=$((n + 1)); failed=$((failed + 1)); echo "not ok $n - $1"; [ -z "${2:-}" ] || echo "  # $2"; }
is () { if [ "$1" = "$2" ]; then ok "$3"; else no "$3" "got: $1; expected: $2"; fi; }
has () { case "$1" in *"$2"*) ok "$3" ;; *) no "$3" "got: $(printf '%s' "$1" | head -c 600); expected in it: $2" ;; esac; }
hasnt () { case "$1" in *"$2"*) no "$3" "got: $(printf '%s' "$1" | head -c 600); not expected in it: $2" ;; *) ok "$3" ;; esac; }
ms () { echo $(( $(date +%s%N) / 1000000 )); }
T=$(mktemp -d "${TMPDIR:-/tmp}/haicc-swarm.XXXXXX")
H=$T/home
TIMES=$T/times
running () { pgrep -f -- "[/]bin/bare $T/" 2>/dev/null; }
cleanup () {
  if [ "$keep" = yes ]; then echo "kept: $T"; return; fi
  PATH=$T/bin:$PATH HAICC_HOME=$H haicc boot/teardown >/dev/null 2>&1
  i=0; while [ -n "$(running)" ] && [ "$i" -lt 100 ]; do sleep 0.1 2>/dev/null || sleep 1; i=$((i + 1)); done
  for pid in $(running); do kill -9 "$pid" 2>/dev/null; done
  case "$T" in "${TMPDIR:-/tmp}"/haicc-swarm.*) rm -rf "$T" ;; esac
}
trap cleanup EXIT
trap 'exit 130' INT TERM
haicc () { PATH=$T/bin:$PATH HAICC_HOME=$H HAICC_TIMEOUT=240 "$T/bin/haicc" "$@" 2>&1; }
step () { s=$(ms); out=$(haicc "$@"); r=$?; echo "$label $(( $(ms) - s ))" >> "$TIMES"; return $r; }
# a command asked again until its answer has a fragment in it, at most a
# number of seconds: what a lease or a node's next turn brings about
until_has () { secs=$1; want=$2; shift 2; i=0; while :; do out=$(haicc "$@"); case "$out" in *"$want"*) return 0 ;; esac; i=$((i + 1)); [ "$i" -ge $((secs * 2)) ] && return 1; sleep 0.5 2>/dev/null || sleep 1; done; }
# the nodes of a status, each its unique URI and its state
states () { printf '%s' "$1" | grep -o '"uri":"[^"]*","role":"[a-z]*","state":"[a-z]*"' | sed 's/"uri":"\([^"]*\)","role":"[a-z]*","state":"\([a-z]*\)"/\1=\2/' | tr '\n' ' ' | sed 's/ $//'; }
S=host/swarms/swarm-1
W=$H/work/mrepos/swarm-1

sh "$pkg/haicc-install.sh" --home="$H" --bin="$T/bin" >/dev/null
haicc sources link "$SOURCES" >/dev/null; haicc prereq >/dev/null
label=boot; step boot/deploy; is $? 0 "haicc boot/deploy"
label=host; step --output . boot/deploy host haiccing/base-component-haicc; has "$out" '"service":"started"' "the host deployed and in service"

# 1. a swarm, its master, the lookup db
out=$(haicc --output host swarm/deploy swarms/swarm-1/node-1); has "$out" "not a swarm made here: swarms/swarm-1 (swarm/create swarms/swarm-1)" "a node below no swarm: refused, saying how one is made"
label=create; step --output host swarm/create swarms/swarm-1 3; is $? 0 "haicc host swarm/create swarms/swarm-1 3: a swarm made, its lease 3 seconds"
has "$out" '{"created":"swarms/swarm-1","swarm":"swarm-1","master":"swarm-1/master","lease":3000}' "answered: the swarm, its master's unique URI, the lease"
out=$(haicc --output host crud/read swarms/swarm-1)
has "$out" '"value":{"kind":"swarm","master":"master","lease":3000,"lookup":{"uri":"swarm-1/master","machine":"' "the swarm's node in the host's main: its kind, its master, where its lookup db is"
has "$out" "\"folder\":\"$W/master\",\"key\":\"" "the master's folder on this machine, its key"
has "$out" '"children":["master"]' "its master below it"
[ -d "$W/master/inbox" ] && [ -d "$W/master/rns/store" ] && [ -f "$W/master/rns/node.json" ] && ok "the master at its place, by its unique URI, its rns' side in its folder: its store, its config" || no "the master at its place, its rns' side in its folder"
is "$(running | wc -l | tr -d ' ')" 5 "five processes: the boot mrepo's runtime, the host's, the master's, and the master's rns and log"
out=$(haicc --output $S/master rns/status)
has "$out" '"joined":true,"swarm":"swarm-1","uri":"swarm-1/master","role":"master","master":"swarm-1/master","lease":3000' "haicc host/swarms/swarm-1/master rns/status: the master, of swarm-1"
is "$(states "$out")" "swarm-1/master=active" "itself registered in the lookup db, active"
out=$(haicc --output host swarm/create swarms/swarm-1); has "$out" "a swarm already: swarms/swarm-1" "made again: refused"

# 2. nodes deployed into it, each registered by its creator, the host
label=node-1; step --output host swarm/deploy swarms/swarm-1/node-1; is $? 0 "haicc host swarm/deploy swarms/swarm-1/node-1"
has "$out" '{"deployed":"swarms/swarm-1/node-1","mrepo":"swarm-1/node-1","package":"haiccing/base-component-node","registered":"swarm-1/master"}' "answered: deployed from the node component, registered at the master"
label=node-2; step --output host swarm/deploy swarms/swarm-1/node-2; has "$out" '"mrepo":"swarm-1/node-2"' "node-2 too"
is "$(running | wc -l | tr -d ' ')" 11 "eleven processes: each node its runtime, its rns and its log"
out=$(haicc --output $S/node-1 crud/read .); has "$out" '"uri":["main","."]' "a node in service, answering through the host"
out=$(haicc --output "$S/master" crud/read "done/*/*/*[value/value/action='register']" --flags layer=request)
has "$out" '\"by\":\"local/host\"' "the master's request log: each node registered by the host, its creator"

# 3. who is registered and active: asked of a node, the master, the host
until_has 10 '"uri":"swarm-1/node-2","role":"node","state":"active"' --output $S/node-1 rns/status
is "$(states "$out")" "swarm-1/master=active swarm-1/node-1=active swarm-1/node-2=active" "haicc host/swarms/swarm-1/node-1 rns/status: the master and both nodes, active, from its own replica of the lookup db"
has "$out" '"role":"node","master":"swarm-1/master"' "the node's own place in it: a node, its master"
has "$out" '"synced":"20' "when its replica was brought up to date"
is "$(states "$(haicc --output $S/node-2 rns)")" "swarm-1/master=active swarm-1/node-1=active swarm-1/node-2=active" "the other node, the same (rns alone is rns/status)"
is "$(states "$(haicc --output $S/master rns/status)")" "swarm-1/master=active swarm-1/node-1=active swarm-1/node-2=active" "the master, the same"
is "$(states "$(haicc --output host swarm/status swarms/swarm-1)")" "swarm-1/master=active swarm-1/node-1=active swarm-1/node-2=active" "haicc host swarm/status swarms/swarm-1: asked of the host, answered by the master"
out=$(haicc --output $S/node-1 rns/resolve . swarm-1/node-2)
has "$out" "{\"uri\":\"swarm-1/node-2\",\"role\":\"node\",\"state\":\"active\"" "haicc host/swarms/swarm-1/node-1 rns/resolve . swarm-1/node-2: resolved at a node"
has "$out" "\"folder\":\"$W/node-2\"}" "where it lives: its machine, its folder there"
out=$(haicc --output $S/node-1 rns/resolve . swarm-1/node-9); has "$out" "not registered: swarm-1/node-9 (swarm-1/master, swarm-1/node-1, swarm-1/node-2)" "one that is not registered: said, with those that are"
out=$(haicc --output $S/node-1 rns/register . '{"uri":"swarm-1/x","key":"'$(printf 'ab%.0s' 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28 29 30 31 32)'","machine":"m","folder":"/x"}'); has "$out" "not the master: rns register is asked of the swarm's master (swarm-1/master)" "registering asked of a node: refused, the master named"

# 3b. the logs: each node's a topic of its own, synced lazily to the
# master; read there in one view, by node
out=$(haicc --output $S/node-1 crud/create notes/a); has "$out" '"outcome":"created"' "a command at node-1: something for it to log"
out=$(haicc --output $S/node-1 crud/delete nowhere/x/y z); L1=$out
out=$(haicc --output $S/node-1 log/status . sync)
has "$out" '"uri":"swarm-1/node-1","role":"node","master":"swarm-1/master","synced":{"length":' "haicc host/swarms/swarm-1/node-1 log/status . sync: its log, a topic of its own, synced to its master now"
hasnt "$out" '"error"' "nothing that kept it from syncing"
[ -d "$W/node-1/log/store" ] && ok "its log's side in its folder: its store" || no "its log's side in its folder"
out=$(haicc --output $S/master log/read . swarm-1/node-1 200)
has "$out" '"nodes":[{"uri":"swarm-1/node-1","length":' "haicc host/swarms/swarm-1/master log/read . swarm-1/node-1: one node's log, at the master"
has "$out" '"command":"crud/create notes/a","ok":true,"error":null' "its record: the command, how it ended"
has "$out" '"node":"swarm-1/node-1","offset":' "each record with its node and its place in that node's log"
hasnt "$out" '"node":"swarm-1/master"' "no other node's records"
case "$L1" in *haicc:*) has "$out" '"ok":false,"error":"' "a command that failed: logged with its error" ;; *) ok "(the second command did not fail: nothing to check)" ;; esac
# lazily: node-2 is not asked to sync; its records are at the master some seconds later
haicc --output $S/node-2 crud/create notes/b >/dev/null
label=lazy; s=$(ms); until_has 20 '"command":"crud/create notes/b","ok":true' --output $S/master log/read . swarm-1/node-2 200; r=$?; echo "lazy $(( $(ms) - s ))" >> "$TIMES"
is $r 0 "node-2's record at the master without being asked for: synced lazily"
out=$(haicc --output $S/master log/read . 500)
has "$out" '"nodes":[{"uri":"swarm-1/master","length":' "haicc host/swarms/swarm-1/master log/read: every node's log, the master's own first"
has "$out" '{"uri":"swarm-1/node-1","length":' "node-1's"
has "$out" '{"uri":"swarm-1/node-2","length":' "node-2's"
has "$out" '"node":"swarm-1/master"' "in one view: the master's records"
has "$out" '"node":"swarm-1/node-2"' "and the nodes'"
out=$(haicc --output $S/node-1 log)
has "$out" '"nodes":[{"uri":"swarm-1/node-1","length":' "haicc host/swarms/swarm-1/node-1 log: at a node, its own log (log alone is log/read)"
hasnt "$out" '"node":"swarm-1/node-2"' "and no other's"
out=$(haicc --output $S/master log/status)
has "$out" '"role":"master","collected":[{"uri":"swarm-1/node-1","key":"' "haicc host/swarms/swarm-1/master log/status: the topics it collected, each by its node"
out=$(haicc --output $S/master log/read . swarm-1/node-9); has "$out" "no log held here for it: swarm-1/node-9 (swarm-1/master, swarm-1/node-1, swarm-1/node-2)" "a node no log is held for: said, with those that are"

# 3c. dispatch: a command from one node to another by its unique URI,
# resolved by rns, delivered into its inbox folder; the master not on the path
out=$(haicc --output $S/node-1 haicc swarm-1/node-2 crud/create notes/sent '{"from":"node-1"}')
has "$out" '{"uri":["main","notes/sent"],"value":{"from":"node-1"},"children":[],"outcome":"created"}' "haicc host/swarms/swarm-1/node-1 haicc swarm-1/node-2 crud/create notes/sent: answered by node-2"
is "$(haicc --output $S/node-2 crud/read notes/sent)" '[{"uri":["main","notes/sent"],"value":{"from":"node-1"},"children":[]}]' "in node-2's main"
is "$(haicc --output $S/node-1 crud/read notes/sent)" '[]' "not in node-1's"
is "$(haicc --output $S/node-1 dispatch/send swarm-1/node-2 crud/read notes/sent)" '[{"uri":["main","notes/sent"],"value":{"from":"node-1"},"children":[]}]' "the same asked of dispatch by name: haicc ... dispatch/send swarm-1/node-2 crud/read notes/sent"
is "$(haicc --output $S/node-1 haicc swarm-1/node-2/notes crud/read sent)" '[{"uri":["main","notes","sent"],"value":{"from":"node-1"},"children":[]}]' "a position below the node: what follows its unique URI goes on with the command"
out=$(haicc --raw $S/node-1 --flags log=verbose -- haicc swarm-1/node-2 crud/read notes/sent)
has "$out" '"event":"dispatch.send.resolved"' "its path, in the request's log (log=verbose at node-1's step): resolved by node-1's rns"
has "$out" '"to":"swarm-1/node-2","how":"folder"' "dispatched by the folder drop"
has "$out" '"jump":["host","swarms/swarm-1/node-1","swarm-1/node-2"]' "the entries of what node-2 did, under the jumps: the host, node-1, then node-2 by its unique URI"
hasnt "$out" '"mrepo":"swarm-1/master"' "the master not on the path"
out=$(haicc --output $S/node-2 haicc swarm-1/master rns/status); is "$(states "$out")" "swarm-1/master=active swarm-1/node-1=active swarm-1/node-2=active" "the master a node as any other: haicc ... node-2 haicc swarm-1/master rns/status"
out=$(haicc --output $S/node-1 haicc swarm-1/node-1 crud/read notes/a); has "$out" '"uri":["main","notes/a"]' "a node's own unique URI: executed there"
out=$(haicc --output $S/node-1 haicc swarm-1/node-9 crud/read .); has "$out" "haicc swarm-1/node-9: no node there, and no node of the swarm by that unique URI" "a unique URI no node has: said"
out=$(haicc --output host haicc swarm-1/node-2 crud/read .); has "$out" "haicc swarm-1/node-2: no node there" "at the host, which does not dispatch: a position that is not there"
out=$(haicc --output $S/master log/read . swarm-1/node-2 200); until_has 20 '"command":"crud/create notes/sent' --output $S/master log/read . swarm-1/node-2 200
has "$out" '"from":"/swarm-1/node-1/execute/' "node-2's log, at the master: the dispatched command, asked by node-1"

# 4. a node gone quiet: its service stopped, its rns ended, its lease run out
label=stop; step --output $S/node-2 service/stop; has "$out" '"state":"initialised"' "node-2's service stopped"
is "$(running | wc -l | tr -d ' ')" 9 "its rns and its log ended with it: nine processes"
out=$(haicc --output $S/node-2 rns/status); has "$out" "not now: rns status (rns is not active; the service is initialised)" "its rns behind its service's door"
label=quiet; s=$(ms); until_has 15 '"uri":"swarm-1/node-2","role":"node","state":"quiet"' --output $S/master rns/status; echo "quiet $(( $(ms) - s ))" >> "$TIMES"
is "$(states "$out")" "swarm-1/master=active swarm-1/node-1=active swarm-1/node-2=quiet" "the master: node-2 gone quiet once its lease ran out, node-1 active still"
until_has 10 '"uri":"swarm-1/node-2","role":"node","state":"quiet"' --output $S/node-1 rns/status
is "$(states "$out")" "swarm-1/master=active swarm-1/node-1=active swarm-1/node-2=quiet" "node-1: seen quiet there too, at its next turn"
label=start; step --output $S/node-2 service/start; has "$out" '"state":"started"' "node-2 started again"
until_has 10 '"uri":"swarm-1/node-2","role":"node","state":"active"' --output $S/node-1 rns/status
is "$(states "$out")" "swarm-1/master=active swarm-1/node-1=active swarm-1/node-2=active" "active again, seen at node-1"

# 5. a node taken out
out=$(haicc --output host swarm/leave swarms/swarm-1/master); has "$out" "is the swarm's master: it does not leave" "the master does not leave"
label=leave; step --output host swarm/leave swarms/swarm-1/node-2; has "$out" '{"left":"swarms/swarm-1/node-2","mrepo":"swarm-1/node-2"}' "haicc host swarm/leave swarms/swarm-1/node-2"
[ ! -e "$W/node-2" ] && ok "its folder removed" || no "its folder removed"
is "$(states "$(haicc --output $S/master rns/status)")" "swarm-1/master=active swarm-1/node-1=active" "out of the lookup db"
until_has 10 '"registry":{"key":"' --output $S/node-1 rns/status
i=0; while [ "$(states "$out")" != "swarm-1/master=active swarm-1/node-1=active" ] && [ "$i" -lt 20 ]; do sleep 0.5 2>/dev/null || sleep 1; out=$(haicc --output $S/node-1 rns/status); i=$((i + 1)); done
is "$(states "$out")" "swarm-1/master=active swarm-1/node-1=active" "and out of node-1's replica, at its next turn"
is "$(running | wc -l | tr -d ' ')" 8 "eight processes left"

# 6. the log viewer: a Splectral component, the master's logs in a browser
label=splectral; step --output . boot/deploy splectral haiccing/base-package-splectral; has "$out" '"service":"started"' "Splectral deployed and in service"
URL=$(haicc --output splectral splectral/status | sed -n 's/.*"url":"\([^"]*\)".*/\1/p')
has "$URL" "http://127.0.0.1:" "its server: $URL"
haicc --output splectral boot/deploy log haiccing/base-package-service >/dev/null
label=viewer; step --output splectral splectral/install log splectral/base-component-log-viewer; has "$out" '"installed":"log"' "the log viewer installed at log: haicc splectral splectral/install log splectral/base-component-log-viewer"
haicc --output splectral/log service/initialise >/dev/null
out=$(haicc --output splectral/log service/start); has "$out" '"state":"started"' "its service started: its program started by its hook"
# a page as a browser asks it, timed: its status, and the component's own
# page as it is embedded in the site's content area, read back (PAGE)
get () { s=$(ms); code=$(curl -s -o "$T/page" -w '%{http_code}' --max-time 60 "$URL$1"); echo "page $(( $(ms) - s ))" >> "$TIMES"; PAGE=$(sed 's/&lt;/</g; s/&gt;/>/g; s/&quot;/"/g; s/&amp;/\&/g' "$T/page" 2>/dev/null); }
get /log/; is "$code" 200 "its page: $URL/log/"
has "$PAGE" '<td>swarm-1/node-1</td><td class="cmd">crud/create notes/a</td>' "every node's log in one view: node-1's record"
has "$PAGE" '<td>swarm-1/master</td>' "the master's"
has "$PAGE" '<td>swarm-1/node-2</td><td class="cmd">crud/create notes/b</td>' "node-2's, kept at the master after it left"
has "$PAGE" '<option value="./?node=swarm-1%2Fnode-1">swarm-1/node-1 (' "its filter: a drop-down, each node whose log the master holds"
has "$PAGE" '<footer>haicc host/swarms/swarm-1/master log/read . 100</footer>' "the command it is, below"
get "/log/?node=swarm-1/node-1&limit=500"; is "$code" 200 "filtered by node: /log/?node=swarm-1/node-1"
has "$PAGE" '<td>swarm-1/node-1</td><td class="cmd">crud/create notes/a</td>' "that node's records"
hasnt "$PAGE" '<td>swarm-1/master</td>' "and no other's"
get "/log/?at=host/swarms/swarm-9/master"; has "$PAGE" '<p class="error">' "a master that is not there: said on the page"
is "$(running | wc -l | tr -d ' ')" 12 "twelve processes: Splectral's runtime and server, the viewer's runtime and program, with the eight"

if [ "$keep" != yes ]; then
  label=machine; step boot/teardown; is $? 0 "haicc boot/teardown"
  i=0; while [ -n "$(running)" ] && [ "$i" -lt 50 ]; do sleep 0.1 2>/dev/null || sleep 1; i=$((i + 1)); done
  is "$(running | wc -l | tr -d ' ')" 0 "nothing of the install left running: every runtime stopped, each rns ended with its own"
fi

echo "# timing (ms)"
for s in boot host create node-1 node-2 lazy stop quiet start leave splectral viewer machine; do echo "# $s $(sed -n "s/^$s //p" "$TIMES")"; done
echo "# pages $(sed -n 's/^page //p' "$TIMES" | tr '\n' ' ')"
echo "# checks = $((n - failed))/$n pass"
[ "$failed" -eq 0 ] && { echo "# ok"; exit 0; }
echo "# not ok"; exit 1
