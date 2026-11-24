#!/bin/sh
# The haicc command, tested end to end as it is installed: from the installer
# to a started host and its teardown, in a temporary folder, removed after.
# It leaves nothing running.
#   sh test/run.sh [--keep]
#     --keep    the temporary folder and its runtimes left as they are, to
#               inspect (its path printed)
#   SOURCES     the sources folder it links: the packages' bundles (the
#               app's among them) and Bare's tarball (a sources folder, as
#               the packages' build writes it); else ../../../sources from here;
#               without one: skipped
#   Docker      its daemon answering: the cluster's nodes get their
#               containers (section 12); without it those checks fail
# One line a check (ok, not ok), the count last; exit 0 passed, 1 failed.
set -u
here=$(cd "$(dirname "$0")" && pwd)
pkg=$(cd "$here/.." && pwd)
keep=no
[ "${1:-}" = --keep ] && keep=yes
HAICC_HOME=$pkg . "$pkg/bin/haicc-lib.sh"   # the pins, this machine's Bare chosen
SOURCES=${SOURCES:-$pkg/../../sources}
for f in "$HAICC_ORG/$APP_PACKAGE.bundle" "$HAICC_ORG/base-component-boot.bundle" "$HAICC_ORG/base-component-haicc.bundle" "$HAICC_ORG/manifest.json" "$BARE_FILE"; do
  [ -f "$SOURCES/$f" ] || { echo "skipped: no $f in $SOURCES (SOURCES: a sources folder)"; exit 0; }
done
SOURCES=$(cd "$SOURCES" && pwd)

n=0; failed=0
ok () { n=$((n + 1)); echo "ok $n - $1"; }
no () { n=$((n + 1)); failed=$((failed + 1)); echo "not ok $n - $1"; [ -z "${2:-}" ] || echo "  # $2"; }
is () { if [ "$1" = "$2" ]; then ok "$3"; else no "$3" "got: $1; expected: $2"; fi; }
has () { case "$1" in *"$2"*) ok "$3" ;; *) no "$3" "got: $1; expected in it: $2" ;; esac; }
hasnt () { case "$1" in *"$2"*) no "$3" "got: $1; not expected in it: $2" ;; *) ok "$3" ;; esac; }

T=$(mktemp -d "${TMPDIR:-/tmp}/haicc-test.XXXXXX")
running () { pgrep -f -- "[/]bin/bare $T/" 2>/dev/null; }
# the containers of this install: the replicas', labelled with their folder
containers () { docker ps -aq --filter label=haicc.folder 2>/dev/null | while read -r id; do case "$(docker inspect --format '{{index .Config.Labels "haicc.folder"}}' "$id" 2>/dev/null)" in "$T"/*) echo "$id" ;; esac; done; }
cleanup () {
  if [ "$keep" = yes ]; then echo "kept: $T"; return; fi
  for id in $(containers); do docker rm -f "$id" >/dev/null 2>&1; done
  for pid in $(running); do kill "$pid" 2>/dev/null; done
  i=0; while [ -n "$(running)" ] && [ "$i" -lt 100 ]; do sleep 0.1 2>/dev/null || sleep 1; i=$((i + 1)); done
  for pid in $(running); do kill -9 "$pid" 2>/dev/null; done
  case "$T" in */haicc-test.*) rm -rf "$T" ;; esac
}
trap cleanup EXIT
trap 'exit 130' INT TERM

# 1. the installer: the one build.sh writes; installed
sh "$pkg/build.sh" "$T/built.sh" >/dev/null
if cmp -s "$T/built.sh" "$pkg/haicc-install.sh"; then ok "the installer is the one build.sh writes"; else no "the installer is the one build.sh writes" "run: sh build.sh"; fi
out=$(sh "$pkg/haicc-install.sh" --home="$T/home" --bin="$T/bin" 2>&1)
is $? 0 "installed: sh haicc-install.sh --home --bin"
[ -x "$T/bin/haicc" ] && [ -f "$T/home/pins" ] && ok "the command registered in the bin folder, its scripts and pins in its own" || no "the command registered" "$out"
PATH=$T/bin:$PATH; export PATH
unset HAICC_HOME HAICC_WORK HAICC_OUTPUT HAICC_RAW 2>/dev/null
HAICC_TIMEOUT=180; export HAICC_TIMEOUT

# 2. before Bare is there: the first step's own commands, in sh; anything
# else is the app's, and says what is missing
out=$(haicc --help); is $? 0 "haicc --help"
has "$out" "haicc sources link <folder>" "its usage: the script commands and the form of an mrepo command"
has "$out" "once haicc prereq says all is there" "before Bare: the first step's commands, the rest pointed to"

# 3. nothing there yet: the prerequisites say what is missing; no boot
is "$(cat "$T/home/sources.list")" "github:$HAICC_ORG" "the sources at first: https, the backup, by default"
out=$(haicc prereq --check); is $? 3 "haicc prereq --check, nothing linked: exit 3"
has "$out" "missing  sources:" "the sources missing, said"
has "$out" "missing  bare:" "Bare missing, said"
out=$(haicc boot/deploy 2>&1); is $? 3 "haicc boot/deploy without its prerequisites: exit 3, pointing to haicc prereq"
has "$out" "haicc: a prerequisite is missing: haicc prereq" "said, with what is missing"
[ ! -e "$T/home/work/mrepos" ] && ok "nothing written" || no "nothing written"
haicc sources >/dev/null 2>&1; is $? 3 "the app's other commands the same: haicc sources, exit 3"

# 4. the sources: a folder linked, in sh (Bare and the app come from it)
out=$(haicc sources link "$SOURCES")
is "$out" "folder:$SOURCES
github:$HAICC_ORG" "haicc sources link <folder>: the folder first, https the backup after it"
haicc sources link "$T/nowhere" >/dev/null 2>&1; is $? 2 "a folder that is not there: not linked"

# 5. the prerequisites: Bare unpacked from the sources, as pinned
out=$(haicc prereq --check); is $? 3 "haicc prereq --check: Bare not in place yet, nothing changed"
[ ! -e "$T/home/bare" ] && ok "nothing put in place by a check" || no "nothing put in place by a check"
out=$(haicc prereq); is $? 0 "haicc prereq: all there"
has "$out" "ok       bare: $BARE_VERSION, put in place from $SOURCES/$BARE_FILE" "Bare put in place from the sources"
is "$("$T/home/bare/bin/bare" --version 2>/dev/null)" "v$BARE_VERSION" "the pinned Bare, running"
is "$(cat "$T/home/bare/tarball.sha512")" "$BARE_SHA512" "its tarball's sha512 recorded: the pin"
out=$(haicc prereq --check); is $? 0 "haicc prereq --check: all there now"
has "$out" "ok       bare: $BARE_VERSION, as pinned" "Bare there, as pinned: kept"

# Bare chosen by machine: a build a platform pinned, each in the sources; a
# machine of another platform (uname answering as it would) chooses its own,
# one not pinned is said
for p in $BARE_PLATFORMS; do
  eval "f=\${BARE_$(printf '%s' "$p" | tr - _)_FILE:-}"
  [ -n "$f" ] && [ -f "$SOURCES/$f" ] && ok "Bare for $p: pinned, in the sources" || no "Bare for $p: pinned, in the sources" "$f"
done
mkdir -p "$T/uname"
printf '#!/bin/sh\ncase "$1" in -m) echo "$UNAME_M" ;; *) echo Linux ;; esac\n' > "$T/uname/uname"; chmod +x "$T/uname/uname"
out=$(UNAME_M=aarch64 PATH=$T/uname:$PATH haicc prereq --check)
has "$out" "ok       platform: linux-arm64" "an aarch64 machine: linux-arm64, pinned"
has "$out" "missing  bare: not put in place yet" "its own Bare chosen: in the sources, not the one in place"
out=$(UNAME_M=riscv64 PATH=$T/uname:$PATH haicc prereq --check); is $? 3 "a machine of a platform not pinned: exit 3"
has "$out" "missing  platform: this is linux-riscv64, Bare is pinned for $BARE_PLATFORMS" "said, with the platforms pinned"

# from here the command is the app, run with the Bare just put in place
out=$(haicc --help); is $? 0 "haicc --help, Bare there"
has "$out" "haicc sources link <folder>" "the usage whole: the first step's commands"
has "$out" "haicc <URI> <protocol>/<action> <argument>..." "and the app's: the form of an mrepo command"
haicc nosuch >/dev/null 2>&1; is $? 2 "no such script command: exit 2"
out=$(haicc . 2>&1); is $? 2 "a URI with no command after it: exit 2"
out=$(haicc boot 2>&1); is $? 2 "haicc boot alone: exit 2 (the machine level is boot/deploy, boot/teardown)"
has "$out" "haicc boot/deploy, haicc boot/teardown" "said"
haicc boot/nosuch >/dev/null 2>&1; is $? 2 "no such action at the machine level: exit 2"
out=$(haicc --output 2>&1); is $? 2 "haicc --output without a URI: exit 2"
out=$(haicc --raw 2>&1); is $? 2 "haicc --raw without a URI: exit 2"
out=$(haicc boot/teardown 2>&1 >/dev/null); is $? 0 "haicc boot/teardown with no boot mrepo: a repeat, exit 0"
has "$out" "haicc: warning: no boot mrepo" "a warning on stderr: nothing to tear down"
out=$(haicc host service/start 2>&1); is $? 3 "an mrepo command before the boot: exit 3"
has "$out" "no boot mrepo" "said: no boot mrepo (haicc boot/deploy)"
[ ! -e "$T/home/work/mrepos" ] && ok "nothing written by any of it" || no "nothing written by any of it"
is "$(haicc sources no-https)" "folder:$SOURCES" "haicc sources no-https: the backup off"
haicc sources https >/dev/null; haicc sources link "$SOURCES" >/dev/null
is "$(haicc sources | wc -l | tr -d ' ')" 2 "https back on; a folder linked twice is listed once"
# our packages downloaded from their releases, in sh, into another
# install: a copy of the releases' layout made from the sources
# (HAICC_RELEASES, file://), <org>/<repository>; an organisation's manifest
# an asset of its documentation package's latest release (haiccing's
# base-docs-haicc, splectral's base-docs-splectral), each package at its
# own release, r-<its commit>; its addons, all of them
rel=$T/releases
(cd "$SOURCES" && tar -cf "$T/addons.tar" addons)
: > "$T/released"
for org in "$HAICC_ORG" splectral; do
  case "$org" in "$HAICC_ORG") docs=base-docs-haicc ;; *) docs=base-docs-$org ;; esac
  mkdir -p "$rel/$org/$docs/releases/latest/download"
  cp "$SOURCES/$org/manifest.json" "$rel/$org/$docs/releases/latest/download/"
  sed -n 's/^      "file": "\(.*\)",$/\1/p; s/^      "commit": "\(.......\).*/\1/p' "$SOURCES/$org/manifest.json" | paste - - >> "$T/released"
done
while read -r f c; do
  p=$(basename "$f" .bundle); d=$rel/$(dirname "$f")/$p/releases/download/r-$c
  mkdir -p "$d"; cp "$SOURCES/$f" "$d/"; cp "$T/addons.tar" "$d/$p-addons.tar"
done < "$T/released"
tag=r-$(sed -n "s|^$HAICC_ORG/$APP_PACKAGE.bundle\t||p" "$T/released")
app=$rel/$HAICC_ORG/$APP_PACKAGE/releases/download/$tag/$APP_PACKAGE.bundle
sh "$pkg/haicc-install.sh" --home="$T/dl" --bin="$T/dlbin" >/dev/null 2>&1
out=$(HAICC_RELEASES=file://$rel "$T/dlbin/haicc" sources download "$HAICC_ORG" splectral 2>&1)
is $? 0 "haicc sources download $HAICC_ORG splectral: two organisations' packages fetched from their releases"
has "$out" "$HAICC_ORG/$APP_PACKAGE: fetched ($tag)" "each from its own release, r-<commit>"
has "$out" "splectral: downloaded, as its manifest says" "a platform's organisation as haicc's own"
for org in "$HAICC_ORG" splectral; do
  cmp -s "$T/dl/sources/$org/manifest.json" "$SOURCES/$org/manifest.json" && ok "$org's manifest written, as published" || no "$org's manifest written, as published"
done
same=yes; while read -r f c; do cmp -s "$SOURCES/$f" "$T/dl/sources/$f" || same=no; done < "$T/released"
is "$same" yes "every bundle there, as in the sources"
is "$(ls "$T/dl/sources/addons" | wc -l | tr -d ' ')" "$(cat "$SOURCES/$HAICC_ORG/manifest.json" "$SOURCES/splectral/manifest.json" | sed -n 's/^        "\([0-9a-f]\{64\}\)",\{0,1\}$/\1/p' | sort -u | wc -l | tr -d ' ')" "every addon the manifests name there"
has "$(cat "$T/dl/sources.list")" "github:splectral" "each organisation downloaded: its https registered"
has "$("$T/dlbin/haicc" prereq --check)" "ok       sources: $T/dl/sources" "the folder registered: it holds the app"
out=$(HAICC_RELEASES=file://$rel "$T/dlbin/haicc" sources download "$HAICC_ORG" 2>&1)
is $? 0 "again: nothing fetched twice"
has "$out" "$HAICC_ORG/$APP_PACKAGE: there" "said: there"
out=$(haicc sources download "$HAICC_ORG/$APP_PACKAGE" 2>&1)
is $? 3 "a package alone: not downloaded, exit 3"
has "$out" "its organisation is (haicc sources download $HAICC_ORG)" "said: its organisation is"
rm "$T/dl/sources/$HAICC_ORG/$APP_PACKAGE.bundle"
printf x >> "$app"
out=$(HAICC_RELEASES=file://$rel "$T/dlbin/haicc" sources download "$HAICC_ORG" 2>&1)
is $? 3 "a bundle not as its manifest says: exit 3"
has "$out" "not as the manifest says (sha256)" "said"
[ ! -e "$T/dl/sources/$HAICC_ORG/$APP_PACKAGE.bundle" ] && ok "and not kept" || no "and not kept"
out=$(HAICC_RELEASES=file://$T/nowhere "$T/dlbin/haicc" sources download "$HAICC_ORG" 2>&1)
is $? 3 "no manifest to fetch: exit 3"
has "$out" "could not fetch the manifest" "said"
HAICC_RELEASES=file://$T/nowhere haicc sources download nosuch >/dev/null 2>&1; is $? 3 "nothing to download by that name: exit 3"

# 6. the boot: the boot mrepo at the root, its runtime started, nothing deployed
out=$(haicc boot/deploy 2>&1); is $? 0 "haicc boot/deploy"
has "$out" '"protocol":"boot","action":"deploy","uri":["boot"]' "its request printed, completed: boot deploy boot"
has "$out" '"repository":"boot"' "its runtime started"
[ -d "$T/home/work/mrepos/boot/inbox" ] && ok "the boot mrepo in the work folder" || no "the boot mrepo in the work folder"
[ ! -e "$T/home/work/mrepos/local" ] && ok "nothing deployed by the boot" || no "nothing deployed by the boot"
is "$(running | wc -l | tr -d ' ')" 1 "one runtime running: the boot mrepo's"

# 7. commands: the host deployed at the root; passed through to it. The
# response record is printed whole, unpacked across lines; --raw: as it is
# stored, one line; --output: the output alone
out=$(haicc --raw . boot/deploy host haiccing/base-component-haicc 2>&1); is $? 0 "haicc --raw . boot/deploy host haiccing/base-component-haicc"
has "$out" '"deployed":"host","mrepo":"local/host","package":"haiccing/base-component-haicc"' "its output: the haicc mrepo deployed at host, its unique URI local/host"
has "$out" '"commission":"done","service":"started"' "its commission done before the deploy answered: its service initialised and started, as its package says"
has "$out" '"topic":"/haicc/terminal"' "--raw: the response record as it is stored, the core addressed back to the terminal"
is "$(printf '%s\n' "$out" | wc -l | tr -d ' ')" 1 "one line"
out=$(haicc . info/get 2>&1); is $? 0 "haicc . info/get: by default the record unpacked"
has "$out" '    "topic": "/haicc/terminal", "offset": ' "across lines, indented, its entries packed on a line up to the width: the core two deep"
has "$out" '      "command": ["info/get"], "protocol": "info",' "the form three deep, packed too"
has "$out" '"keyword": "."' "and its output, opened below: an entry that does not fit a line of its own"
[ "$(printf '%s\n' "$out" | wc -l | tr -d ' ')" -gt 5 ] && ok "several lines" || no "several lines" "$out"
has "$(haicc --output host info/get 2>&1)" '"title":"base-component-haicc"' "the host, commissioned: its info extracted by its initialise hook"
# nothing of a record changed by the unpacking: what is printed, its line
# breaks and spaces taken off, is the record as it is stored in the outbox
# (a streaming folder: under its offset, in its buckets),
# its spaces taken off the same way (an output, an error; the exact check,
# strings minded, is the app's own test)
back=yes
for c in ". info/get" ". info/get haiccing" ". boot/deploy host haiccing/base-component-haicc"; do
  out=$(haicc $c 2>/dev/null)
  key=$(printf '%s\n' "$out" | sed -n 's/^  "topic": "[^"]*", "offset": \([0-9]*\),.*$/\1/p')
  packed=$(printf '%s\n' "$out" | tr -d ' \n')
  [ -n "$key" ] && [ "$packed" = "$(tr -d ' \n' < "$T/home/work/mrepos/boot/outbox/${key%????????}/${key%???????}/$key.json")" ] || { no "unpacked and packed again: the record as stored" "haicc $c"; back=''; break; }
done
[ -z "$back" ] || ok "unpacked and packed again: every record in the outbox as stored"
is "$(haicc output 2>&1)" "auto: 80 (the output is no terminal)" "haicc output: the width in force: auto, 80 here"
is "$(haicc output 100000 2>&1)" "100000 (set: haicc output auto for the terminal's width)" "haicc output 100000: set"
is "$(haicc . info/get haiccing | wc -l | tr -d ' ')" 1 "a record that fits the width set: left on one line"
is "$(cat "$T/home/output.width")" "100000" "kept, in haicc's own folder"
out=$(haicc output wide 2>&1 >/dev/null); is "$?" "2" "haicc output wide: no width, exit 2"
is "$(haicc output auto 2>&1)" "auto: 80 (the output is no terminal)" "haicc output auto: back to the default"
out=$(haicc --output . boot/deploy host haiccing/base-component-haicc 2>&1); is $? 0 "deployed again: idempotent, allowed, exit 0"
has "$out" '"again":true' "said: a repeat, nothing done, what is there answered"
out=$(haicc . boot/deploy host haiccing/base-package-runtime 2>&1 >/dev/null); is $? 1 "deployed again from another package: refused, exit 1"
is "$out" "haicc: deployed already: host, from haiccing/base-component-haicc (not haiccing/base-package-runtime)" "its error on stderr: what is there, from which package"
is "$(haicc --output host service/initialise 2>&1)" '{"service":"initialised","state":"started","again":true}' "initialised and started by its commission: initialise again runs its hook again, the state as it is"
is "$(haicc --output host service/stop 2>&1)" '{"service":"stopped","state":"initialised"}' "haicc --output host service/stop: passed through to the haicc mrepo; what was done, the state now"
out=$(haicc host boot/deploy node-1 haiccing/base-package-runtime 2>&1 >/dev/null); is $? 1 "the host stopped: its boot protocol behind the service's door"
is "$out" "haicc: not now: boot deploy (boot is not active; the service is initialised)" "said: boot is activated by the service's start"
is "$(running | wc -l | tr -d ' ')" 2 "stopped, its runtime still running: only a teardown stops it"
is "$(haicc --output host service/start 2>&1)" '{"service":"started","state":"started"}' "haicc host service/start"

# 8. what is missing is said: an argument, a protocol
out=$(haicc . boot/deploy 2>&1 >/dev/null); is $? 1 "haicc . boot/deploy, nothing after it: exit 1"
is "$out" "haicc: missing argument: target" "missing argument: target"
out=$(haicc . boot/teardown 2>&1 >/dev/null); is "$out" "haicc: missing argument: target" "haicc . boot/teardown: the same (one cannot tear down the mrepo itself)"
out=$(haicc . boot/teardown . 2>&1 >/dev/null); is "$out" "haicc: missing argument: target" "a target of . written out: still missing"
out=$(haicc . boot/deploy other 2>&1 >/dev/null); is "$out" "haicc: missing argument: package" "haicc . boot/deploy other: missing argument: package"
out=$(haicc host boot/deploy 2>&1 >/dev/null); is "$out" "haicc: missing argument: target" "and passed through: said by the mrepo it lands in"
out=$(haicc host 2>&1); is $? 2 "haicc host, no command: exit 2 at the command line"
is "$(haicc --output . protocol/activate . crud 2>&1)" '{"activated":"crud"}' "the protocol protocol open from outside: the restrictions lifted for base"
out=$(haicc . deploy/teardown host 2>&1 >/dev/null); is $? 1 "a protocol that is not there: exit 1"
is "$out" "haicc: no protocol: deploy (boot, crud, haicc, haici, help, info, protocol, runtime)" "said, with the protocols there"
out=$(haicc . boot/remove host 2>&1 >/dev/null); is "$out" "haicc: no action: boot remove (deploy, redeploy, teardown)" "an action that is not there: said, with the protocol's actions"

# 9. a node inside the host; commands chained through both
out=$(haicc --raw host boot/deploy node-1 haiccing/base-package-runtime 2>&1); is $? 0 "haicc host boot/deploy node-1: executed by the haicc mrepo"
has "$out" '"deployed":"node-1","mrepo":"local/node-1"' "the node deployed inside it"
[ -d "$T/home/work/mrepos/local/node-1/inbox" ] && ok "placed by its unique URI, side by side with the others: mrepos/local/node-1" || no "placed by its unique URI"
[ ! -e "$T/home/work/mrepos/local/host/main" ] && [ ! -e "$T/home/work/mrepos/boot/main" ] && ok "nothing of an mrepo inside the one that deployed it" || no "nothing of an mrepo inside the one that deployed it"
is "$(running | wc -l | tr -d ' ')" 3 "three runtimes running: the boot mrepo's, the host's, the node's"
out=$(haicc --raw host haicc node-1 info/get 2>&1); is $? 0 "haicc host haicc node-1 info/get: chained through two shortcuts"
has "$out" '"title":"base-package-runtime"' "answered by the node: its own top page"
case "$out" in *base-component-haicc*) no "the node's, not the host's" "$out" ;; *) ok "the node's, not the host's" ;; esac
out=$(haicc --raw host/node-1 info/get 2>&1); is $? 0 "haicc host/node-1 info/get: a URI running through shortcuts: from one local root to the next"
has "$out" '"title":"base-package-runtime"' "answered by the node: what is left of the URI went on with the command"
case "$out" in *base-component-haicc*) no "the node's, by the one URI" "$out" ;; *) ok "the node's, by the one URI" ;; esac
out=$(haicc nowhere info/get 2>&1 >/dev/null); is "$out" "haicc: haicc nowhere: no node there" "a position that is not there: said, exit 1"
out=$(haicc . info/get haiccing 'no "such" keyword' 2>&1 >/dev/null); is $? 1 "an argument with spaces and quotes: sent whole"
has "$out" 'no haiccing/no-such-keyword here' "and back in the error: one keyword, not three"
out=$(haicc /host info/get 2>&1 >/dev/null); is $? 1 "a URI with a leading slash: refused, exit 1"
is "$out" "haicc: not a relative URI: /host (no leading slash: host)" "said, with the URI as it is written now"
is "$(haicc --output ./host service/start 2>&1)" '{"service":"started","state":"started","again":true}' "./host is host: a position written with ./ in front (started again: a repeat)"
out=$(haicc --output host info/get haiccing 2>&1); is $? 0 "haicc --output: the output alone"
case "$out" in *'"topic":'*) no "no record around it" "$out" ;; *) ok "no record around it" ;; esac
out=$(HAICC_OUTPUT=1 haicc host info/get haiccing 2>&1); is $? 0 "HAICC_OUTPUT=1: the same"
case "$out" in *'"topic":'*) no "no record around it, HAICC_OUTPUT=1" "$out" ;; *) ok "no record around it, HAICC_OUTPUT=1" ;; esac

# 9a. flags: --flags help on a command answers it where it would run,
# nothing of it executed; a flag that is none, or help not on the last
# command: nothing run, exit 1, said why
out=$(haicc --output host crud/read swarms --flags help 2>&1); is $? 0 "haicc host crud/read swarms --flags help: answered, exit 0"
has "$out" '"help":"crud/read swarms"' "the command as understood"
has "$out" '"door":"taken here, now"' "the door's answer, here and now"
has "$out" '"more":"info/get haiccing/base-package-crud/read"' "where to read more: its page, its keywords in full form"
out=$(haicc --output . boot/teardown host --flags help 2>&1); has "$out" '"door":"taken here, now"' "haicc . boot/teardown host --flags help: answered"
is "$(running | wc -l | tr -d ' ')" 3 "nothing of it executed: the host and its node still running"
out=$(haicc --output host haicc node-1 crud/read . --flags help 2>&1); has "$out" '"door":"refused here: no protocol: crud' "through a chain: answered by the node, where it would run (no crud there)"
out=$(haicc host crud/read swarms --flags nope 2>&1 >/dev/null); is $? 1 "a flag that is none: not run, exit 1"
is "$out" "haicc: not run: no flag: nope (container, feedback, help, layer, log, logical, physical)" "said why"
out=$(haicc host --flags help -- crud/read swarms 2>&1 >/dev/null); is "$out" "haicc: not run: help: on the last command only (it rewrites the command it is on)" "help on a command that passes its words on: not the last, not run"
out=$(haicc host crud/read swarms --flags help 2>&1); has "$out" "To run it: crud/read swarms" "by default its answer in natural language, a line each"
hasnt "$out" '"topic":' "not the record (--raw for it)"
# feedback: --flags feedback <text> on any command records it where the
# command would run, nothing of it executed, answered with its request's
# id; read back from the request layer (the store), through the chain
out=$(haicc host crud/read swarms --flags feedback the list is empty, a swarm was expected 2>&1); is $? 0 "haicc host crud/read swarms --flags feedback <text>: recorded, exit 0"
id=$(printf '%s\n' "$out" | sed -n 's/^Feedback on crud\/read swarms recorded: request \([0-9a-f-]*\)\.$/\1/p')
[ -n "$id" ] && ok "answered in natural language: the command as understood, its request's id" || no "answered in natural language: the command as understood, its request's id" "$out"
# (where its record is in request/done, a streaming layer: under its offset,
# in its buckets; the query reads the layer as it is stored: logical = physical)
at="${id%????????}/${id%???????}/$id"
has "$out" "To read it back: crud/read done/$at.json --flags layer=request" "the command to read it back, as typed after the position"
out=$(haicc --output host crud/read "done/$at.json" --flags layer=request 2>&1); is $? 0 "read back: haicc host crud/read done/<buckets>/<id>.json --flags layer=request"
has "$out" '"protocol":"haici","action":"feedback","uri":["main","swarms"],"args":["the list is empty, a swarm was expected","crud/read"]' "its record: haici/feedback at the command's URI, the text, then the command"
has "$out" '"rewritten":"feedback"' "made by the flag"
has "$out" "\"output\":{\"feedback\":\"recorded\",\"on\":\"crud/read swarms\",\"id\":\"$id\"" "its answer kept with it"
out=$(haicc --output host crud/read "done/*/*/*[value/value/protocol='haici']" --flags layer=request 2>&1); has "$out" "\"offset\":$id" "all the feedback there: the request layer read by protocol"
out=$(haicc --output . boot/teardown host --flags feedback do not, it is in use 2>&1); has "$out" '"on":"boot/teardown host"' "haicc . boot/teardown host --flags feedback <text>: recorded at the root"
is "$(running | wc -l | tr -d ' ')" 3 "nothing of it executed: the host and its node still running"
out=$(haicc --output host haici/feedback swarms "asked directly" crud/read 2>&1); has "$out" '"on":"crud/read swarms"' "asked directly: haicc host haici/feedback swarms <text> crud/read"
out=$(haicc host crud/read swarms --flags feedback 2>&1 >/dev/null); is $? 1 "feedback with no text: not run, exit 1"
is "$out" "haicc: not run: feedback: its text follows it (--flags feedback <text>)" "said why"
out=$(haicc host haicc node-1 crud/read . --flags feedback hm 2>&1 >/dev/null); is "$out" "haicc: not run: feedback: no protocol haici here" "through a chain to an mrepo without haici (the runtime alone): not run, said"

# 9b. structure in main: nodes created, read and deleted with crud; at the
# root (the boot mrepo: crud active from its boot) and in the host (behind
# its service's door, open while started). Every one can be repeated
is "$(haicc --output . crud/create swarms/swarm-1 '{"size":3}' 2>&1)" '[{"uri":["main","swarms"],"value":{},"children":["swarm-1"],"outcome":"created"},{"uri":["main","swarms/swarm-1"],"value":{"size":3},"children":[],"outcome":"created"}]' "haicc . crud/create swarms/swarm-1 <value>: the node and the one above it made, each answered: its URI as held inside, its document, its children, what happened"
is "$(haicc --output . crud/create swarms/swarm-1 '{"size":9}' 2>&1)" '[{"uri":["main","swarms"],"value":{},"children":["swarm-1"],"outcome":"there"},{"uri":["main","swarms/swarm-1"],"value":{"size":3},"children":[],"outcome":"there"}]' "again, with another value: there already, left as it is"
is "$(haicc --output . crud/create swarms/swarm-2 2>&1)" '[{"uri":["main","swarms"],"value":{},"children":["swarm-1","swarm-2"],"outcome":"there"},{"uri":["main","swarms/swarm-2"],"value":{},"children":[],"outcome":"created"}]' "a sibling, no value: an empty document"
is "$(haicc --output . crud/read swarms 2>&1)" '[{"uri":["main","swarms"],"value":{},"children":["swarm-1","swarm-2"]}]' "haicc . crud/read swarms: an array of one node, its children by name"
is "$(haicc --output . crud/read 'swarms/*' 2>&1)" '[{"uri":["main","swarms/swarm-1"],"value":{"size":3},"children":[]},{"uri":["main","swarms/swarm-2"],"value":{},"children":[]}]' "haicc . crud/read swarms/*: its children, each a node"
is "$(haicc --output . crud/read swarmz 2>&1)" '[]' "nothing there (a typo): an empty array, exit 0"
out=$(haicc --output . crud/read host 2>&1)
has "$out" '[{"uri":["main","host"],"value":{},"children":[],"shortcuts":[{"mrepo":"local/host","link":"' "the host read as a node: a shortcut, with the mrepo its data comes from and its link's key: what is needed to show it"
is "$(haicc --output . crud/read . 2>&1)" '[{"uri":["main","."],"value":{},"children":["host","swarms"]}]' "the root: a node, its children the host and what was created (no registry in it: the install's is mrepos/)"
out=$(haicc . crud/read host/swarms 2>&1 >/dev/null); is "$out" "haicc: host is a shortcut: a URI does not run through it (haicc host haicc swarms ...)" "below a shortcut: not read here, the way across said"
# a query: a filter on the nodes' documents; a command at a position inside
# main, and at each position a query selects
is "$(haicc --output . crud/read 'swarms/*[size>2]' 2>&1)" '[{"uri":["main","swarms/swarm-1"],"value":{"size":3},"children":[]}]' "haicc . crud/read 'swarms/*[size>2]': the nodes the filter holds for"
is "$(haicc --output . crud/read "swarms/*[size='none' or not(size)]" 2>&1)" '[{"uri":["main","swarms/swarm-2"],"value":{},"children":[]}]' "or, not(), a quoted value: sent whole"
is "$(haicc --output . crud/read swarms/swarm-1/size 2>&1)" '[{"uri":["main","swarms/swarm-1/size"],"value":3}]' "inside a node's document: the value there"
is "$(haicc --output swarms/swarm-1 crud/read . 2>&1)" '[{"uri":["main","swarms/swarm-1","."],"value":{"size":3},"children":[]}]' "haicc swarms/swarm-1 crud/read .: executed at the position, the command's URI read behind it"
is "$(haicc --output 'swarms/*[size=3]' crud/read . 2>&1)" '[{"at":"swarms/swarm-1","value":[{"uri":["main","swarms/swarm-1","."],"value":{"size":3},"children":[]}]}]' "haicc 'swarms/*[size=3]' crud/read .: at each position selected, a list of what each gave"
is "$(haicc --output 'swarms/*[size>100]' crud/read . 2>&1)" '[]' "nothing selected: an empty list, exit 0"
out=$(haicc '*' crud/read . 2>&1 >/dev/null); has "$out" "not yet: it reaches a shortcut (host) among 2 positions; a command goes on from one shortcut at a time" "a shortcut beside other positions: not yet, said so"
is "$(haicc --output . crud/read 'swarms/*[2]' 2>&1)" '[{"uri":["main","swarms/swarm-2"],"value":{},"children":[]}]' "a position, from 1: the second"
out=$(haicc . crud/read 'swarms/*[count(*)>1]' 2>&1 >/dev/null); has "$out" "not a function of this phase: count" "what the query does not read yet: said"
out=$(haicc . crud/read "swarms/*[Size>2]" 2>&1 >/dev/null); has "$out" "bad filter" "a name in a filter that is no URI's: refused as a URI"
out=$(haicc . crud/delete swarms 2>&1 >/dev/null); is "$out" "haicc: swarms has children: not deleted (crud/delete swarms recurse)" "haicc . crud/delete swarms: it has children, refused, saying how"
out=$(haicc . crud/update swarms '{}' 2>&1 >/dev/null); is "$out" "haicc: no action: crud update (create, delete, read)" "there is no update: said, with the actions there are"
out=$(haicc . crud/create . 2>&1 >/dev/null); is "$out" "haicc: missing argument: target" "the root itself is not created"
is "$(haicc --output . crud/delete swarms recurse 2>&1)" '[{"uri":["main","swarms"],"value":{},"children":["swarm-1","swarm-2"],"outcome":"deleted"}]' "with recurse: deleted, answered as it was"
is "$(haicc --output . crud/delete swarms recurse 2>&1)" '[]' "again: nothing there, nothing selected, exit 0"
is "$(haicc --output . crud/read . 2>&1)" '[{"uri":["main","."],"value":{},"children":["host"]}]' "gone with everything below it; the host untouched"
is "$(haicc --output host crud/create swarms/swarm-1 2>&1)" '[{"uri":["main","swarms"],"value":{},"children":["swarm-1"],"outcome":"created"},{"uri":["main","swarms/swarm-1"],"value":{},"children":[],"outcome":"created"}]' "haicc host crud/create swarms/swarm-1: in the host, started: its own main"
is "$(haicc --output host crud/read . 2>&1)" '[{"uri":["main","."],"value":{},"children":["node-1","swarms"]}]' "the host's root: its node, a shortcut, and what was created there"
is "$(haicc --output host/swarms/swarm-1 crud/read . 2>&1)" '[{"uri":["main","swarms/swarm-1","."],"value":{},"children":[]}]' "haicc host/swarms/swarm-1 crud/read .: through the shortcut, then at the position in the host"
is "$(haicc --output 'host/swarms/*' crud/read . 2>&1)" '[{"at":"swarms/swarm-1","value":[{"uri":["main","swarms/swarm-1","."],"value":{},"children":[]}]}]' "a query through the shortcut: selected in the host"
is "$(haicc --output . crud/read swarms 2>&1)" '[]' "nothing of it in the boot mrepo: each mrepo its own main"

# 9a. scripts: haicc/script, its lines run where the haicc points, each
# after the one before; a heredoc on stdin; the install's scripts by name
# (haicc/file, haicc scripts: the work folder's scripts/, a package's
# placed by its deploy); a line that fails
out=$(haicc --output host haicc/script . 'crud/create notes/s
crud/read notes/s' 2>&1); is $? 0 "haicc host haicc/script . '<lines>': two lines run at the host"
has "$out" '"line":"crud/read notes/s"' "each line with what it answered"
has "$out" '"uri":["main","notes/s"]' "the second saw what the first made: one after the other"
out=$(printf 'crud/read notes/s\n' | haicc --output host haicc/script . 2>&1); has "$out" '"line":"crud/read notes/s"' "haicc host haicc/script . with a heredoc: the lines from stdin"
out=$(haicc --output host haicc/script notes 'crud/read s' 2>&1); has "$out" '"uri":["main","notes","s"]' "haicc host haicc/script notes '...': its lines run at notes in the host (the position its own segment)"
is "$(haicc scripts 2>&1)" "haiccing/base-component-haicc/cluster" "haicc scripts: the host's package's, placed by its deploy in the work folder's scripts/"
[ -f "$T/home/work/scripts/haiccing/base-component-haicc/cluster.haicc" ] && ok "at <work>/scripts/<org>/<package>/<name>.haicc" || no "at <work>/scripts/<org>/<package>/<name>.haicc"
printf '# a check\ncrud/read notes/s\n' > "$T/home/work/scripts/check.haicc"
is "$(haicc scripts 2>&1 | tr '\n' ' ')" "check haiccing/base-component-haicc/cluster " "haicc scripts: the user's by name first, then each package's"
out=$(haicc --output host haicc/file . check 2>&1); is $? 0 "haicc host haicc/file . check: the install's script, read here, run at the host"
has "$out" '"line":"crud/read notes/s"' "its lines sent as haicc/script"
out=$(haicc host haicc/file . nope 2>&1 >/dev/null); is $? 3 "a script the install has not: exit 3"
out=$(haicc host haicc/script . 'crud/read notes/s
nosuch/thing' 2>&1 >/dev/null); is $? 1 "a line that fails: exit 1"
has "$out" "line 2: nosuch/thing" "said, which line"
haicc host crud/delete notes recurse >/dev/null 2>&1

# 9b. a request's log, and its flags: info unasked; --flags log=verbose,
# log=debug, after a URI: that step's, held down the chain; a flag that is
# none
out=$(haicc --raw host crud/read . 2>&1)
has "$out" '"event":"request.metrics"' "a request's log, without a flag: its metrics, at info"
has "$out" '"event":"request.sent"' "and where it was sent on"
hasnt "$out" '"event":"crud.read.query"' "no steps: those are verbose"
out=$(haicc --raw host crud/read . --flags log=verbose 2>&1)
has "$out" '"args":["crud/read",".","--flags","log=verbose"]' "haicc host crud/read . --flags log=verbose: at the end of the line, the last command's: passed on as written"
has "$out" '"event":"crud.read.query"' "the read's steps, from the host"
has "$out" '"jump":["host"]' "each entry of the host's under its jump"
hasnt "$out" '"event":"haicc.goto.sent on"' "the boot mrepo's own hop still at info: the flag was the last command's"
out=$(haicc --raw host --flags log=verbose -- crud/read . 2>&1)
has "$out" '"event":"haicc.goto.sent on"' "haicc host --flags log=verbose -- crud/read .: after the URI, that step's: the hop at host"
has "$out" '"event":"crud.read.query"' "and it held down the chain: the host's steps too"
has "$out" '"args":["crud/read","."]' "-- says where the next command starts: the command as it is"
out=$(haicc --raw host --flags log=debug -- haicc node-1 info/get 2>&1)
has "$out" '"event":"info.get.asked"' "log=debug through two hops: the node's internals"
has "$out" '"jump":["host","node-1"]' "under both jumps, in order"
out=$(haicc --raw . --flags log=verbose -- crud/read . 2>&1)
has "$out" '"event":"crud.read.query"' "haicc . --flags log=verbose -- crud/read .: at the root too"
out=$(haicc --raw . crud/read . --flags nope log=loud 2>&1); is "$?" "1" "a flag that is none, a value its flag does not take: nothing of it run, exit 1 (strict)"
has "$out" '"run":false' "completed, not failed: not run"
has "$out" '"event":"request.flag"' "each reason a warning in its log"
hasnt "$out" '"event":"crud.read.' "nothing of the command executed"
out=$(haicc --raw host --flags nope log=verbose -- crud/read . 2>&1); is "$?" "1" "a flag there is none of, before the --: that step not run, exit 1"
has "$out" '"why":["no flag: nope (container, feedback, help, layer, log, logical, physical)"]' "said why"
hasnt "$out" '"event":"crud.read.' "the command after it not sent on"
out=$(haicc host --flags log=debug crud/read . 2>&1 >/dev/null); is "$?" "1" "a list not closed where a command follows: exit 1"
has "$out" "no command after the flags of haicc (-- closes a flag list, the command follows it)" "said: only -- or the end of the command closes a list"
# the registry: the work folder's mrepos/, a folder each mrepo by its
# unique URI; in the mrepo that deployed it, its link only
[ -d "$T/home/work/mrepos/local/host/.git" ] && [ -d "$T/home/work/mrepos/boot/.git" ] && ok "the install's registry: mrepos/, the host at local/host" || no "the install's registry: mrepos/"
out=$(haicc --output . crud/read '*' --flags layer=links 2>&1)
has "$out" '"uri":"local/host","at":"host","how":"deployed","folder":"../local/host","package":"haiccing/base-component-haicc"' "its link's record, the boot mrepo's: which mrepo, linked where, how it came, where it is, what it came from"
# the registry consulted: haicc/mrepos, each mrepo where it is from the mrepo asked
out=$(haicc --output . haicc/mrepos 2>&1)
has "$out" '{"uri":"local/boot","position":".","package":"haiccing/base-component-boot","running":true}' "haicc . haicc/mrepos: the boot mrepo, itself"
has "$out" '{"uri":"local/host","position":"host","package":"haiccing/base-component-haicc","running":true}' "the host, linked at host"
is "$(haicc --output . haicc/mrepos "*/*[package='haiccing/base-component-haicc']" 2>&1)" '[{"uri":"local/host","position":"host","package":"haiccing/base-component-haicc","running":true}]' "an xpath: filtered on what the records say"
has "$(haicc --output host haicc/mrepos local/boot 2>&1)" '"position":null' "asked of the host: the boot mrepo not forward of it, no position"
# commission and decommission: what a package does once deployed, run by
# the mrepo's runtime as it starts, the deploy waiting for it; and before
# its teardown. Each a hook of the package's, its lines the mrepo's own
out=$(haicc --output . boot/deploy demo haiccing/base-component-haicc 2>&1); is $? 0 "haicc . boot/deploy demo haiccing/base-component-haicc: deployed and commissioned in one command"
has "$out" '"commission":"done","service":"started"' "its commission done: in service"
is "$(haicc --output demo crud/read . 2>&1)" '[{"uri":["main","."],"value":{},"children":[]}]' "the mrepo brought into service by it: its crud answering"
out=$(haicc . boot/deploy demo-2 haiccing/base-component-haicc --flags continuation=start 2>&1 >/dev/null); is $? 1 "a deploy asked for a continuation: no such flag any more"
has "$out" "no flag: continuation" "said: what the package does once deployed is its commission"
[ ! -e "$T/home/work/mrepos/local/demo-2" ] && ok "nothing built for it" || no "nothing built for it"
is "$(haicc --output . boot/teardown demo 2>&1)" '{"tornDown":"demo"}' "torn down again"
is "$(haicc --output . boot/teardown demo 2>&1)" '{"tornDown":"demo","again":true}' "and once more: not deployed, idempotent, allowed"
haicc . boot/deploy extra-1 haiccing/base-package-runtime >/dev/null 2>&1; haicc . boot/deploy extra-2 haiccing/base-package-runtime >/dev/null 2>&1
[ -d "$T/home/work/mrepos/local/extra-1/inbox" ] && [ -d "$T/home/work/mrepos/local/extra-2/inbox" ] && ok "two more deployed, each at its place" || no "two more deployed"
is "$(haicc --output . boot/teardown extra-1 2>&1)$(haicc --output . boot/teardown extra-2 2>&1)" '{"tornDown":"extra-1"}{"tornDown":"extra-2"}' "each torn down at its position"
[ ! -e "$T/home/work/mrepos/local/extra-1" ] && [ ! -e "$T/home/work/mrepos/local/extra-2" ] && [ -d "$T/home/work/mrepos/local/host" ] && ok "their folders removed, the host left" || no "their folders removed, the host left"
is "$(running | wc -l | tr -d ' ')" 3 "three runtimes running again"
# main is the default layer; layer=<name> changes it: the request records read
out=$(haicc --output . crud/read "done/*/*/*[value/value/protocol='boot']" --flags layer=request 2>&1); is "$?" "0" "haicc . crud/read \"done/*/*/*[...]\" --flags layer=request: the request layer read"
has "$out" '"uri":["request","done/' "records, each a file answered with its document, its URI at that layer"
has "$out" '"protocol":"boot"' "those the filter holds for"
hasnt "$out" '"protocol":"service"' "and no others"
out=$(haicc --output . --flags layer=request -- crud/read "done/*/*/*[value/value/protocol='boot']" 2>&1)
has "$out" '"uri":["request","done/' "the flag at the step: held for the command that follows"
is "$(haicc --output . crud/read 'done/*' 2>&1)" '[]' "without the flag: main, where there is no done"
out=$(haicc --output host crud/read 'done/*/*/*' --flags layer=request 2>&1)
has "$out" '"uri":["request","done/' "through a shortcut: the host's records, the routing still in main"
# a batch, read as the layer is stored: the latest folder, the latest of it,
# by positions; then the ones before an offset, by name: no record opened
# to choose them (each record's offset asked: a record's own output may
# hold other records)
out=$(haicc --output . crud/read 'done/*[last()]/*[last()]/*[position()>last()-2]/offset' --flags layer=request 2>&1)
is "$(printf '%s' "$out" | grep -o 'done/[0-9]*/[0-9]*/[0-9]*\.json/offset' | wc -l | tr -d ' ')" 2 "a batch: the latest two records of the latest folder, by position"
last=$(printf '%s' "$out" | grep -o 'done/[0-9]*/[0-9]*/[0-9]*\.json' | tail -1); name=${last##*/}; folder=${last%/*}
out=$(haicc --output . crud/read "$folder/*[name()<'$name'][position()>last()-1]/offset" --flags layer=request 2>&1)
is "$(printf '%s' "$out" | grep -o "$folder/[0-9]*\.json/offset" | wc -l | tr -d ' ')" 1 "the batch before an offset: by its name, in its folder"
hasnt "$out" "$name" "the offset itself not in it"
# the same topic read logically (--flags logical): its records, the latest
# first, each by its address; nothing of how it is stored in the answer;
# an address read back
out=$(haicc --output . crud/read 'done/*/offset' --flags layer=request logical 2>&1)
has "$out" '"uri":["request","done/*[@offset=' "logical: the topic's records, each by its address"
hasnt "$out" '.json' "nothing of its storage in it: no folder, no file's name"
nl=$(printf '%s' "$out" | grep -o '@offset=[0-9]*' | wc -l | tr -d ' ')
a1=$(printf '%s' "$out" | grep -o '@offset=[0-9]*' | sed -n 1p); a2=$(printf '%s' "$out" | grep -o '@offset=[0-9]*' | sed -n 2p)
[ "${a1#@offset=}" -gt "${a2#@offset=}" ] && ok "the latest first" || no "the latest first" "$a1 $a2"
np=$(haicc --output . crud/read 'done/*/*/*/offset' --flags layer=request physical 2>&1 | grep -o '\.json/offset' | wc -l | tr -d ' ')
is "$np" "$((nl + 1))" "every record of it: as many as are stored (and the read itself, done since)"
out=$(haicc --output . crud/read "done/*[$a2]" --flags layer=request logical 2>&1)
has "$out" "\"uri\":[\"request\",\"done/*[$a2]\"],\"value\":{\"topic\":\"/request/done\",\"offset\":${a2#@offset=}," "an address an answer gave: read back, its record"
out=$(haicc --output . crud/read "done/*[value/value/protocol='boot']/value/value/action" --flags layer=request logical 2>&1)
has "$out" '"value":"deploy"' "by its data, a field of each: the boot protocol's requests"
out=$(haicc --output . crud/read "done/*[${a2%=*}<${a2#@offset=}]/offset" --flags layer=request logical 2>&1)
has "$out" '@offset=' "logical: from an offset back: a bound on @offset"
hasnt "$out" "$a2" "below it: not the offset itself"
out=$(haicc . crud/read 'done/*[last()]' --flags layer=request logical 2>&1)
has "$out" "a position is no part of a topic's query" "a position in a topic's query: refused, said: a query says where, never how many"
# the physical log: what the physical side did for a request, in the xpath
# layer, a record under the request's offset: each physical query its
# logical ones stood for; committed at a checkpoint, apart from requests
out=$(haicc --output . crud/read "log/*[$a2]" --flags layer=xpath logical 2>&1)
has "$out" "\"request\":${a2#@offset=}," "the xpath layer's log: a request's record, under its offset"
has "$out" '"physical":"' "its physical queries, each with the logical one it stood for"
has "$out" '"logical":"' "and what was asked"
n1=$(haicc --output . crud/read 'log/*/offset' --flags layer=xpath logical 2>&1 | grep -o '@offset=[0-9]*' | wc -l | tr -d ' ')
n2=$(haicc --output . crud/read 'log/*/offset' --flags layer=xpath logical 2>&1 | grep -o '@offset=[0-9]*' | wc -l | tr -d ' ')
is "$n2" "$n1" "a read of the xpath layers is not logged there: the log does not feed itself"
out=$(haicc --flags log=debug -- host crud/read . 2>&1 >/dev/null); is "$?" "2" "flags in front of the URI: refused, exit 2"
has "$out" "flags follow a URI: they are that step's" "said"

# 9c. how-tos: pages of the package they are about, read with info
has "$(haicc --output . info/get haiccing/base-component-boot/howto/deploy 2>&1)" '"title":"deploy","oneliner":"Deploys the host' "haicc . info/get haiccing/base-component-boot/howto/deploy: the boot mrepo's how-to, a page of its component"
out=$(haicc --output host info/get haiccing/base-component-haicc/howto 2>&1)
has "$out" '{"keyword":"haiccing/base-component-haicc/howto/deploy","oneliner":"Deploys a node of a swarm' "haicc host info/get haiccing/base-component-haicc/howto: the host's how-tos, each a keyword"
has "$out" '{"keyword":"haiccing/base-component-haicc/howto/replica","oneliner":"' "and the replica's"
has "$(haicc --output host info/get haiccing base-component-haicc howto deploy steps 2>&1)" '"title":"Steps"' "a how-to's steps: a section of its page; the keywords as words"

# 9d. info: the pages by keywords from the top down, the keywords where the
# URI is, no dot
out=$(haicc --output . info 2>&1)
has "$out" '"keyword":".","choices":[{"title":"base-component-boot"' "haicc . info: the boot mrepo's top page, its own package's README (info alone is info/get)"
has "$out" '{"keyword":"haiccing","oneliner":"' "its keywords: the organisations"
has "$(haicc --output . info/get haiccing 2>&1)" '{"keyword":"haiccing/base-package-boot","oneliner":"' "an organisation: its packages, each by its name fully qualified"
out=$(haicc --output host info 2>&1)
has "$out" '"choices":[{"title":"base-component-haicc"' "haicc host info: the host's top page"
has "$(haicc --output host info/get haiccing 2>&1)" '{"keyword":"haiccing/base-package-container","oneliner":"' "its included packages, below their organisation"
has "$out" '{"keyword":"modules","oneliner":"' "and the pages made at extraction: modules"
has "$out" '{"keyword":"third-party","oneliner":"' "and third-party"
has "$(haicc --output host info/get haiccing/base-package-boot 2>&1)" '"title":"base-package-boot"' "haicc host info/get haiccing/base-package-boot: a protocol's page, its package's README"
out=$(haicc --output host info/get haiccing/base-package-info/extract 2>&1)
has "$out" '"title":"extract","oneliner":"Writes the mrepo' "haicc host info/get haiccing/base-package-info/extract: an action, a jump from its package into its module"
has "$out" '{"keyword":"haiccing/base-package-info/extract/signature"' "its sections below it"
has "$(haicc --output host info/get haiccing base-package-info extract signature 2>&1)" '"title":"Signature"' "a section; the keywords as words too"
has "$(haicc --output host info/get modules/mrepo-base-info 2>&1)" '"title":"mrepo-base-info"' "a module, once, under modules"
has "$(haicc --output host info/get third-party 2>&1)" '"generated":true' "third-party: made at extraction, marked so"
out=$(haicc --output host info/get nothing-here 2>&1); is $? 1 "a keyword that is not there: exit 1"
has "$out" "no nothing-here here: nearest ." "said, with the nearest and what is below it"
has "$(haicc --output host info/extract 2>&1)" '"changed":false' "haicc host info/extract: extracted already, by its hook"
# the docs mrepo: the platform's documentation, deployed in the boot mrepo
# (part of the boot install, a command until it does it)
out=$(haicc --raw . boot/deploy docs haiccing/base-component-docs 2>&1); is $? 0 "haicc . boot/deploy docs haiccing/base-component-docs: the docs mrepo"
out=$(haicc --output docs info/get 2>&1)
has "$out" '"choices":[{"title":"base-component-docs"' "haicc docs info/get: the platform's front page, the docs component's README"
out=$(haicc --output docs info/get haiccing 2>&1)
has "$out" '{"keyword":"haiccing/base-docs-hdlc","oneliner":"' "the documentation packages by name, below their organisation: hdlc"
has "$out" '{"keyword":"haiccing/base-docs-uri","oneliner":"' "uri"
has "$out" '{"keyword":"haiccing/base-docs-vision","oneliner":"' "vision"
has "$(haicc --output docs info/get haiccing/base-docs-hdlc/validation 2>&1)" '"title":"Validation"' "haicc docs info/get haiccing/base-docs-hdlc/validation: a section of how work is done"
has "$(haicc --output docs info/get haiccing/base-docs-package/mrepo/request 2>&1)" '"title":"/request"' "haiccing/base-docs-package/mrepo/request: a layer at run time, in the package specification"
has "$(haicc --output docs info/get haiccing/base-package-info/get 2>&1)" '"title":"get"' "haiccing/base-package-info/get: the info protocol's action, documented there too"
has "$(haicc --output docs info/get haiccing/base-package-boot/deploy 2>&1)" '"keyword":"haiccing/base-package-boot/deploy","context":"haiccing/base-package-boot"' "haiccing/base-package-boot/deploy: a package the docs mrepo does not run, documented from the install's store (documents: store), read in its context, said"
has "$(haicc --output docs info/get base-package-boot deploy 2>&1)" '"context":"haiccing/base-package-boot"' "its name alone, unique here: the same context"
out=$(haicc --output docs info/get config 2>&1)
has "$out" '"keyword":"config","choices":[' "a short keyword several packages have (not the docs mrepo's own): a choice each"
has "$out" '{"keyword":"haiccing/base-package-boot/config","title":"Config"' "each kept apart, the keyword to go on with in its context first"
has "$out" '"context":"haiccing/base-package-boot","packages":["haiccing/base-package-boot"]' "and its context said"
has "$out" '{"keyword":"haiccing/base-package-haicc/config"' "the host's protocol among them: in the store, documented"
has "$(haicc --output docs info/get howto 2>&1)" '"context":"haiccing/base-component-docs"' "a short keyword its own package has: its own, the docs mrepo answering about itself"
has "$(haicc --output host info/get howto 2>&1)" '"keyword":"haiccing/base-component-haicc/howto","context":"haiccing/base-component-haicc"' "the same short keyword asked of the host: its own package's, context help"
# feedback on the documentation, where it is read: recorded in the docs
# mrepo's own request log, read back there
out=$(haicc docs info/get haiccing/base-docs-hdlc/validation --flags feedback unclear: which state holds a request? 2>&1); is $? 0 "haicc docs info/get <keywords> --flags feedback <text>: recorded at the docs mrepo"
id=$(printf '%s\n' "$out" | sed -n 's/^Feedback on info\/get haiccing\/base-docs-hdlc\/validation recorded: request \([0-9a-f-]*\)\.$/\1/p')
[ -n "$id" ] && ok "answered with its request's id" || no "answered with its request's id" "$out"
out=$(haicc --output docs crud/read "done/${id%????????}/${id%???????}/$id.json" --flags layer=request 2>&1); has "$out" '"protocol":"haici","action":"feedback","uri":["main","haiccing/base-docs-hdlc/validation"]' "read back there: haici/feedback at the keywords' URI"
# its build: removed at shutdown, built again at initialise
haicc --output docs service/stop >/dev/null 2>&1; out=$(haicc --output docs service/shutdown 2>&1); has "$out" '"state":"booted"' "haicc docs service/shutdown: shut down, its shutdown hook run"
out=$(haicc --output docs info/get 2>&1 >/dev/null); has "$out" "no info extracted in this mrepo yet" "its build removed (info/clear)"
has "$(haicc --output docs service/initialise 2>&1)" '"state":"initialised"' "haicc docs service/initialise: built again"
has "$(haicc --output docs info/get haiccing/base-docs-hdlc/validation 2>&1)" '"title":"Validation"' "its pages back"
has "$(haicc --output docs service/initialise 2>&1)" '"again":true' "initialise again: a repeat, what is new added, nothing else"
is "$(haicc --output . boot/teardown docs 2>&1)" '{"tornDown":"docs"}' "haicc . boot/teardown docs: torn down again"

# 10. torn down: the node; the service stopped and shut down; the host
is "$(haicc --output host boot/teardown node-1 2>&1)" '{"tornDown":"node-1"}' "haicc host boot/teardown node-1"
is "$(haicc --output host service/stop 2>&1)" '{"service":"stopped","state":"initialised"}' "haicc host service/stop: stopped, the state initialised again"
out=$(haicc host boot/deploy node-2 haiccing/base-package-runtime 2>&1 >/dev/null); is "$out" "haicc: not now: boot deploy (boot is not active; the service is initialised)" "stopped: its boot protocol deactivated, the door closed again"
out=$(haicc host crud/read . 2>&1 >/dev/null); is "$out" "haicc: not now: crud read (crud is not active; the service is initialised)" "and its crud protocol with it: behind the same door"
is "$(haicc --output host service/shutdown 2>&1)" '{"service":"shut down","state":"booted"}' "haicc host service/shutdown: shut down, the state booted again"
is "$(haicc --output . boot/teardown host 2>&1)" '{"tornDown":"host"}' "haicc . boot/teardown host: at the root, about the shortcut as an item"
[ ! -e "$T/home/work/mrepos/local/host" ] && ok "the host's folder removed" || no "the host's folder removed"
is "$(running | wc -l | tr -d ' ')" 1 "one runtime left: the boot mrepo's"

# 11. the boot again: there already, kept
out=$(haicc boot/deploy 2>&1); is $? 0 "haicc boot/deploy again"
has "$out" '"already":true' "already built: kept"
is "$(running | wc -l | tr -d ' ')" 1 "still one runtime"

# 12. Splectral: an mrepo of its own beside the host, deployed by the
# boot mrepo; its server started with its service, following the boot
# mrepo's outbox folder: every command from here on a line of its page
out=$(haicc --output . boot/deploy splectral haiccing/base-package-splectral 2>&1); is $? 0 "haicc . boot/deploy splectral haiccing/base-package-splectral: Splectral deployed and brought into service by its commission"
has "$out" '"deployed":"splectral","mrepo":"local/splectral"' "an mrepo of its own, beside the host: local/splectral"
has "$out" '"commission":"done","service":"started"' "in service"
out=$(haicc --output splectral splectral/status 2>&1)
has "$out" '{"running":true,"url":"http://127.0.0.1:' "haicc splectral splectral/status: its server running, started by the service's start hook"
has "$out" "\"outbox\":\"$T/home/work/mrepos/boot/outbox\"" "following the boot mrepo's outbox folder"
splectral=$(printf '%s' "$out" | sed -n 's/.*"url":"\([^"]*\)".*/\1/p')
has "$(curl -s "$splectral/")" "<title>Splectral</title>" "its page served"
has "$(curl -s "$splectral/records")" '"command":"boot/deploy splectral haiccing/base-package-splectral","ok":true,"error":null,"through":[]' "its lines: the commands of the install so far, each with where it was sent on to"

# 12b. the cluster: the host deployed (in service by its commission), then
# the cluster script sent to it: a swarm in its main, two nodes deployed
# below it, each in service by its commission, each with its replica in a
# container, in service by its own as its container starts
docker version --format '{{.Server.Version}}' >/dev/null 2>&1 && ok "Docker answers: the nodes can have their containers" || no "Docker answers: the nodes can have their containers" "no Docker daemon answers: the container checks below fail"
haicc . boot/deploy host haiccing/base-component-haicc >/dev/null 2>&1; is $? 0 "haicc . boot/deploy host haiccing/base-component-haicc: the host again, in service"
out=$(haicc --output . haicc/file host haiccing/base-component-haicc/cluster 2>&1); is $? 0 "haicc . haicc/file host haiccing/base-component-haicc/cluster: its package's script, placed by its deploy, run at the host: its cluster, every command done"
has "$out" '"deployed":"swarms/swarm-1/node-1","mrepo":"swarm-1/node-1"' "node-1 deployed by the host at swarms/swarm-1/node-1: a swarm's node, its unique URI swarm-1/node-1"
has "$out" '"deployed":"swarms/swarm-1/node-2","mrepo":"swarm-1/node-2"' "node-2 too"
has "$out" '"created":"container","mrepo":"swarm-1/node-1/container"' "node-1's replica made: linked at container, its unique URI the node's with container behind it"
has "$out" '"created":"container","mrepo":"swarm-1/node-2/container"' "node-2's too"
has "$out" '"started":"container","container":"haicc-swarm-1-node-2-' "its container started"
has "$out" '[{"uri":["main","swarms/swarm-1/node-1"],"value":{},"children":[],"shortcuts":[{"mrepo":"swarm-1/node-1","link":"' "its last command: the swarm's nodes read: each a shortcut"
[ -d "$T/home/work/mrepos/swarm-1/node-1/inbox" ] && [ -d "$T/home/work/mrepos/swarm-1/node-2/inbox" ] && ok "each node at its place, by its unique URI: mrepos/swarm-1/<name>" || no "each node at its place"
[ -d "$T/home/work/containers/swarm-1/node-1/inbox" ] && [ -d "$T/home/work/containers/swarm-1/node-2/inbox" ] && ok "each replica at its place, beside the mrepos: containers/swarm-1/<name>" || no "each replica at its place"
is "$(running | wc -l | tr -d ' ')" 6 "six processes of the install on the host: five runtimes (the boot mrepo's, Splectral's, the host's, the two nodes') and Splectral's server"
is "$(containers | wc -l | tr -d ' ')" 2 "two containers: a replica's runtime in each"
is "$(haicc --output host/swarms/swarm-1/node-2 crud/read . 2>&1)" '[{"uri":["main","."],"value":{},"children":["container"]}]' "a node in service, answering through the host: its replica linked at container"
N="host haicc swarms/swarm-1/node-1"
out=$(haicc --output $N container/status 2>&1)
has "$out" '{"replica":"container","mrepo":"swarm-1/node-1/container","container":"haicc-swarm-1-node-1-' "haicc host haicc swarms/swarm-1/node-1 container/status: its replica, its container"
has "$out" '"state":"running"}' "running"
is "$(haicc --output $N haicc container service/start 2>&1)" '{"service":"started","state":"started","again":true}' "the replica in service already: its commission, as its container started (a start again: a repeat)"
has "$(haicc --output $N haicc container crud/create notes/a '{"x":1}' 2>&1)" '{"uri":["main","notes/a"],"value":{"x":1},"children":[],"outcome":"created"}' "a command sent on into the container: a node created in the replica's main"
is "$(haicc --output host/swarms/swarm-1/node-1/container crud/read notes/a 2>&1)" '[{"uri":["main","notes/a"],"value":{"x":1},"children":[]}]' "read back with one URI through three shortcuts: the host, the node, its container"
out=$(haicc $N haicc container container/create 2>&1 >/dev/null); is "$out" "haicc: a replica makes no replica of its own: swarm-1/node-1/container" "a replica makes no replica of its own"
has "$(haicc --output $N container/stop 2>&1)" '"stopped":"container"' "container/stop"
has "$(haicc --output $N container/status 2>&1)" '"state":"exited"}' "stopped: exited"
has "$(haicc --output $N container/start 2>&1)" '"state":"running","service":"started"}' "container/start: running again, the replica in service (its commission run again, idempotent)"
is "$(haicc --output $N haicc container crud/read notes/a 2>&1)" '[{"uri":["main","notes/a"],"value":{"x":1},"children":[]}]' "its data kept over a stop and a start: the replica's folder is on the host"
has "$(haicc --output $N container/remove 2>&1)" '{"removed":"container","container":"haicc-swarm-1-node-1-' "container/remove: while it runs"
is "$(haicc --output $N container/status 2>&1)" '{"replica":null,"state":"none"}' "removed: no replica"
[ ! -e "$T/home/work/containers/swarm-1/node-1" ] && ok "its folder removed" || no "its folder removed"
is "$(containers | wc -l | tr -d ' ')" 1 "one container left: node-2's"
is "$(haicc --output $N crud/read . 2>&1)" '[{"uri":["main","."],"value":{},"children":[]}]' "its link out of the node's main"
# on Splectral's page: the cluster's commands, each with the mrepos it went through
out=$(curl -s "$splectral/records")
has "$out" '"command":"haicc host haicc swarms/swarm-1/node-2 container/start","ok":true,"error":null,"through":["local/host","swarm-1/node-2"]' "Splectral: a command of the cluster script, sent on through the host to the node"
has "$out" '"through":["local/host","swarm-1/node-1","swarm-1/node-1/container"]' "one that went on into a container: all three"
has "$out" '"ok":false,"error":"a replica makes no replica of its own: swarm-1/node-1/container"' "one that failed: its error"
# and the install as those commands made it: a tree, a swarm node one node
tree=$(curl -s "$splectral/structure")
has "$tree" '"nodes":[{"uri":"local/boot","parent":null,"at":".","package":null,"service":null,"container":null,"depth":0},{"uri":"local/host","parent":"local/boot","at":"host","package":"haiccing/base-component-haicc","service":"started","container":null,"depth":1}' "Splectral: the install's structure, folded from the commands: the root, the host below it, started"
has "$tree" '{"uri":"swarm-1/node-1","parent":"local/host","at":"swarms/swarm-1/node-1","package":"haiccing/base-component-haicc","service":"started","container":null,"depth":2}' "a swarm's node below the host, started; its container removed: none"
has "$tree" '{"uri":"swarm-1/node-2","parent":"local/host","at":"swarms/swarm-1/node-2","package":"haiccing/base-component-haicc","service":"started","container":{"name":"haicc-swarm-1-node-2-' "the other: one node, its container part of it"
has "$tree" '"state":"running","service":"started"},"depth":2}' "its container running, the replica in it in service"
hasnt "$tree" '"uri":"swarm-1/node-2/container"' "a replica is no node of its own"
has "$tree" '{"uri":"local/splectral","parent":"local/boot","at":"splectral","package":"haiccing/base-package-splectral","service":"started","container":null,"depth":1}' "Splectral itself, beside the host"
key=$(printf '%s' "$out" | sed -n 's/.*{"key":"\([0-9a-f-]*\)"[^{]*"command":"haicc host haicc swarms\/swarm-1\/node-1 container\/remove".*/\1/p')
has "$(curl -s "$splectral/record/$key")" '"output":{"removed":"container","container":"haicc-swarm-1-node-1-' "a line's record whole: its output and its log"
is "$(haicc --output splectral service/stop 2>&1)" '{"service":"stopped","state":"initialised"}' "haicc splectral service/stop: its stop hook ends the server"
curl -s -o /dev/null "$splectral/"; is $? 7 "its page gone"
is "$(haicc --output splectral service/start 2>&1)" '{"service":"started","state":"started"}' "started again: the server back"
has "$(haicc --output splectral splectral/status 2>&1)" '{"running":true,' "running"

# 13. the machine level torn down: every runtime stopped, the replicas'
# containers removed, what boot/deploy put in place removed; Bare, the
# sources and the scripts stay
out=$(haicc boot/teardown 2>&1); is $? 0 "haicc boot/teardown"
has "$out" '"tornDown":".","runtimes":5,"containers":1' "said: the root torn down, five runtimes stopped, the nodes the host deployed among them, and the container left removed"
# (Splectral's server ends by itself, with its runtime: a moment later)
i=0; while [ -n "$(running)" ] && [ "$i" -lt 50 ]; do sleep 0.1 2>/dev/null || sleep 1; i=$((i + 1)); done
is "$(running | wc -l | tr -d ' ')" 0 "no process of the install left: every runtime stopped, Splectral's server ended with its own"
is "$(containers | wc -l | tr -d ' ')" 0 "no container left"
[ ! -e "$T/home/work/mrepos" ] && [ ! -e "$T/home/work/containers" ] && [ ! -e "$T/home/work/packages" ] && [ ! -e "$T/home/work/mrepo.json" ] && ok "the mrepos, the replicas, the package store and the setting removed" || no "what boot/deploy put in place removed" "$(ls "$T/home/work")"
[ -x "$T/home/bare/bin/bare" ] && [ -f "$T/home/sources.list" ] && [ -x "$T/home/bin/haicc" ] && ok "Bare, the sources list and the scripts kept" || no "Bare, the sources list and the scripts kept"
[ -f "$T/home/work/scripts/check.haicc" ] && ok "the user's scripts kept: <work>/scripts/" || no "the user's scripts kept"
[ ! -e "$T/home/work/scripts/haiccing" ] && ok "the packages' scripts removed: placed by the deploys" || no "the packages' scripts removed"
out=$(haicc boot/teardown 2>/dev/null); is $? 0 "torn down twice: a repeat, exit 0"
has "$out" '"again":true' "said: again, nothing done"
out=$(haicc boot/deploy 2>&1); is $? 0 "haicc boot/deploy after it: the boot mrepo back"
has "$out" '"repository":"boot"' "its runtime started"

if [ "$keep" != yes ]; then
  cleanup; trap - EXIT
  [ -z "$(running)" ] && [ -z "$(containers)" ] && ok "nothing left running" || no "nothing left running"
  [ ! -e "$T" ] && ok "its folder removed" || no "its folder removed"
fi
echo "# checks = $((n - failed))/$n pass"
if [ "$failed" -eq 0 ]; then echo "# ok"; exit 0; else echo "# not ok"; exit 1; fi
