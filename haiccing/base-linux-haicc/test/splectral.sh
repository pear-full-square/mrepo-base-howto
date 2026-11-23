#!/bin/sh
# Splectral as an app platform, end to end: an install with the docs
# mrepo and Splectral; a component, the help viewer, installed in two
# halves (boot/deploy, then splectral/install), its service started, its
# pages asked over HTTP as a browser asks them; what it refuses; stopped,
# torn down; nothing left. Then the workbench on a fresh install, one
# command: the docs mrepo, the host and Splectral in service. Each step
# timed, the pages too.
#   sh test/splectral.sh [--keep]
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
for f in "$HAICC_ORG/$APP_PACKAGE.bundle" "$HAICC_ORG/base-package-splectral.bundle" "$HAICC_ORG/base-solution-workbench.bundle" splectral/base-component-help-viewer.bundle "$BARE_FILE"; do
  [ -f "$SOURCES/$f" ] || { echo "skipped: no $f in $SOURCES (SOURCES: a sources folder)"; exit 0; }
done
SOURCES=$(cd "$SOURCES" && pwd)
n=0; failed=0
ok () { n=$((n + 1)); echo "ok $n - $1"; }
no () { n=$((n + 1)); failed=$((failed + 1)); echo "not ok $n - $1"; [ -z "${2:-}" ] || echo "  # $2"; }
is () { if [ "$1" = "$2" ]; then ok "$3"; else no "$3" "got: $1; expected: $2"; fi; }
hasnt () { case "$1" in *"$2"*) no "$3" "got in it: $2" ;; *) ok "$3" ;; esac; }
has () { case "$1" in *"$2"*) ok "$3" ;; *) no "$3" "got: $(printf '%s' "$1" | head -c 400); expected in it: $2" ;; esac; }
ms () { echo $(( $(date +%s%N) / 1000000 )); }
T=$(mktemp -d "${TMPDIR:-/tmp}/haicc-splectral.XXXXXX")
H=$T/home
TIMES=$T/times
cleanup () {
  if [ "$keep" = yes ]; then echo "kept: $T"; return; fi
  PATH=$T/bin:$PATH HAICC_HOME=$H haicc boot/teardown >/dev/null 2>&1
  [ -x "$T/bin2/haicc" ] && PATH=$T/bin2:$PATH HAICC_HOME=$T/home2 "$T/bin2/haicc" boot/teardown >/dev/null 2>&1
  case "$T" in "${TMPDIR:-/tmp}"/haicc-splectral.*) rm -rf "$T" ;; esac
}
trap cleanup EXIT
haicc () { PATH=$T/bin:$PATH HAICC_HOME=$H HAICC_TIMEOUT=240 "$T/bin/haicc" "$@" 2>&1; }
step () { s=$(ms); out=$(haicc "$@"); r=$?; echo "$label $(( $(ms) - s ))" >> "$TIMES"; return $r; }
# a page as a browser asks it: its status, then its body (PAGE), timed
get () { s=$(ms); code=$(curl -s -o "$T/page" -w '%{http_code}' --max-time 60 "$URL$1"); echo "page $(( $(ms) - s ))" >> "$TIMES"; PAGE=$(cat "$T/page" 2>/dev/null); }

sh "$pkg/haicc-install.sh" --home="$H" --bin="$T/bin" >/dev/null
haicc sources link "$SOURCES" >/dev/null; haicc prereq >/dev/null
label=boot; step boot/deploy; is $? 0 "haicc boot/deploy"
label=docs; step --output . boot/deploy docs haiccing/base-component-docs; has "$out" '"deployed":"docs"' "the docs mrepo deployed"
label=splectral; step --output . boot/deploy splectral haiccing/base-package-splectral; has "$out" '"service":"started"' "Splectral deployed and in service"
out=$(haicc --output splectral splectral/status)
URL=$(printf '%s' "$out" | sed -n 's/.*"url":"\([^"]*\)".*/\1/p')
has "$URL" "http://127.0.0.1:" "its server: $URL"

# the component, the first half: haicc's, a plain service-managed mrepo deployed by Splectral
label=base; step --output splectral boot/deploy help haiccing/base-package-service; has "$out" '"mrepo":"local/help"' "the first half: a plain mrepo deployed by Splectral, local/help"
# the second half: Splectral's, the component's packages laid on top
label=install; step --output splectral splectral/install help splectral/base-component-help-viewer; has "$out" '"installed":"help"' "the second half: the component installed"
has "$out" '"laid":["runtime/hooks/start.haicc","runtime/hooks/stop.haicc"]' "its start and stop hooks laid by the mrepo itself"
has "$out" '"packages":["splectral/base-component-help-viewer"]' "its package, splectral's: itself only"
F=$H/work/mrepos/local/help
[ -f "$F/splectral/component.json" ] && [ -d "$F/splectral/inbox" ] && [ -d "$F/splectral/outbox" ] && ok "Splectral's side of its folder: its record, its inbox and outbox" || no "Splectral's side of its folder"
is "$(ls "$F/packages/splectral" 2>/dev/null)" "" "none of its packages in the mrepo's own packages: no haiccing runtime loads them"
out=$(haicc --output splectral/help runtime/run . packages/splectral/base-component-help-viewer 2>&1)
has "$out" "not a package of this mrepo: splectral/base-component-help-viewer" "the runtime knows none of them"

# what it refuses
out=$(haicc --output splectral splectral/install help splectral/base-component-help-viewer); has "$out" '"again":true' "installed again: idempotent, allowed, nothing done"
out=$(haicc --output splectral splectral/install help splectral/base-component-log-viewer); has "$out" "a component there already: help, splectral/base-component-help-viewer" "another component there: refused (deploy and teardown)"
out=$(haicc --output splectral splectral/install other splectral/base-component-help-viewer); has "$out" "not deployed: other" "nothing deployed there: refused"
haicc --output splectral boot/deploy other haiccing/base-package-service >/dev/null
out=$(haicc --output splectral splectral/install other haiccing/base-component-docs); has "$out" "not a Splectral component: haiccing/base-component-docs" "a haiccing package: not a Splectral component"
haicc --output splectral boot/teardown other >/dev/null
out=$(haicc --output splectral splectral/install stream splectral/base-component-help-viewer); has "$out" "not a position for a component: stream" "a position that is the server's own path: refused"

# not started: said at once
get /help/; is "$code" 503 "its pages before its service started: not running, said at once"
# its service, through haicc's hops: its program started by its start hook
label=initialise; step --output splectral/help service/initialise; has "$out" '"state":"initialised"' "its service initialised, through Splectral"
label=start; step --output splectral/help service/start; has "$out" '"state":"started"' "started: its program started by its hook"
[ -f "$F/splectral/packages/splectral/base-component-help-viewer.state.json" ] && ok "its program's state, beside its bundle" || no "its program's state"

# its pages, as a browser asks them
get /help/; is "$code" 200 "its top page"
has "$PAGE" "<title>docs</title>" "the docs mrepo's top"
has "$PAGE" '<a href="/help/" class="on" aria-current="page">help</a>' "in the site: its tab, shown"
has "$PAGE" '<a href=&quot;haiccing&quot;>haiccing</a>' "the keywords below (the organisations), links to the same view, relative to its section"
has "$PAGE" '<base href=&quot;/help/&quot; target=&quot;_top&quot;>' "its page embedded in the site, its base its section's own address"
get /help/haiccing/base-docs-hdlc/validation; is "$code" 200 "a page by its keywords"
has "$PAGE" "Before every commit" "as haicc docs info/get haiccing/base-docs-hdlc/validation answers it, drawn"
has "$PAGE" '<code>haicc docs info/get haiccing/base-docs-hdlc/validation</code>' "the command it shows"
get "/help/?at=splectral"; has "$PAGE" "<title>splectral</title>" "another mrepo, by its position: Splectral answering about itself"
get "/help/?at=."; has "$PAGE" '<code>haicc . info/get</code>' "the root, as the command line names it"
# the navigation: a drop-down the mrepo, the install's as the server knows them; one a level, its choices its parent's answer
get /help/haiccing/base-docs-hdlc/validation
has "$PAGE" '<option value=&quot;./?at=splectral%2Fhelp&quot;>' "the mrepo's drop-down: the install's mrepos, the component's own among them"
has "$PAGE" '<option value=&quot;haiccing/base-docs-hdlc/validation&quot; selected>validation</option>' "a level a keyword: validation chosen, among haiccing/base-docs-hdlc's below"
# raw, like for like: the response as the terminal prints it (no terminal: to 80), the same output
cli=$(haicc docs info/get haiccing/base-docs-hdlc/validation)
get "/help/haiccing/base-docs-hdlc/validation?raw"; is "$code" 200 "raw: the command's response whole"
# (the page's text: in the site's srcdoc, escaped twice, the site's then the page's)
raw=$(awk '{ a = a $0 "\n" } END { o = "<pre class=&quot;raw&quot;><code>"; s = index(a, o); e = index(a, "</code></pre>"); if (s && e) printf "%s", substr(a, s + length(o), e - s - length(o)) }' "$T/page" \
  | sed -e 's/&quot;/"/g' -e 's/&amp;/\&/g' -e 's/&lt;/</g' -e 's/&gt;/>/g' -e 's/&quot;/"/g' -e "s/&#39;/'/g" -e 's/&amp;/\&/g')
tail_of () { printf '%s\n' "$1" | sed -n '/^      "output": /,$p'; }
[ -n "$(tail_of "$cli")" ] && [ "$(tail_of "$cli")" = "$(tail_of "$raw")" ] && ok "raw: its output printed line for line as the command line prints it" || no "raw: like for like" "$(printf '%s' "$raw" | head -c 300)"
has "$(printf '%s' "$raw" | tr -d ' \n')" '"command":["haicc","docs","info/get","haiccing/base-docs-hdlc/validation"]' "raw: the command as a terminal sends it (its line breaks and spaces taken off)"
# the command box: a command as typed after haicc, answered with help where it would run, not run
get "/help/?cmd=docs%20info%2Fget%20hdlc"; is "$code" 200 "a command typed: a page"
has "$PAGE" 'taken here, now' "its help: the door's answer here and now"
has "$PAGE" '<code>haicc docs info/get hdlc</code></dd>' "the command to run it, its position in front"
has "$PAGE" '<code>haicc docs info/get hdlc --flags help</code>' "sent with the help flag: nothing of it run"
get "/help/?cmd=.%20boot%2Fteardown%20docs"; has "$PAGE" 'taken here, now' "a teardown typed: answered"
get /help/; is "$code" 200 "and the docs mrepo still there: nothing run"
# the site: the URI chopped, the site serving /, Splectral's own page its first tab
get /; has "$PAGE" '<a href="/install" class="on" aria-current="page">install</a><a href="/help/">help</a>' "the site: its own page shown, the component a tab"
has "$PAGE" "srcdoc=" "its own page embedded in the content area"
get /install; has "$PAGE" '<a href="/install" class="on"' "its own page at its own URI"
get /help/no/such/thing; is "$code" 200 "a keyword that is not there: a page all the same"
has "$PAGE" 'class=&quot;error&quot;' "its error said on it"
for i in 1 2 3; do get /help/haiccing/base-docs-hdlc/validation; done
get /records; has "$PAGE" '"command":"haicc docs info/get haiccing/base-docs-hdlc/validation"' "its data requests: commands in the install's record, as a terminal's"
is "$(ls "$F/splectral/inbox" "$F/splectral/outbox" | grep -c json)" 0 "its boxes empty: each record taken removed"

# stopped, torn down
label=stop; step --output splectral/help service/stop; has "$out" '"service":"stopped"' "its service stopped"
[ -f "$F/splectral/packages/splectral/base-component-help-viewer.state.json" ] && no "its program ended" || ok "its program ended by its stop hook"
get /help/; is "$code" 503 "its pages: not running"
label=teardown; step --output splectral boot/teardown help; has "$out" '"tornDown":"help"' "the component torn down, as any mrepo"
[ -e "$F" ] && no "its folder removed" || ok "its folder removed"
get /help/; is "$code" 404 "its pages: not deployed"
label=machine; step boot/teardown; is $? 0 "haicc boot/teardown"
is "$(pgrep -f -- "[/]bin/bare $T/home/" | wc -l | tr -d ' ')" 0 "nothing of the install left running"

# the workbench: a fresh install, one command at the root. Its commission
# deploys its components below it (the docs mrepo, Splectral), each
# commissioned by its own, then brings it into service; its decommission
# tears them down with it
H2=$T/home2
sh "$pkg/haicc-install.sh" --home="$H2" --bin="$T/bin2" >/dev/null
wb () { PATH=$T/bin2:$PATH HAICC_HOME=$H2 HAICC_TIMEOUT=600 "$T/bin2/haicc" "$@" 2>&1; }
running2 () { pgrep -f -- "[/]bin/bare $T/home2/" ; }
wb sources link "$SOURCES" >/dev/null; wb prereq >/dev/null
wb boot/deploy >/dev/null; is $? 0 "a fresh install: haicc boot/deploy"
s=$(ms); out=$(wb --output . boot/deploy workbench haiccing/base-solution-workbench); r=$?; echo "workbench $(( $(ms) - s ))" >> "$TIMES"
is $r 0 "haicc . boot/deploy workbench haiccing/base-solution-workbench: deployed and commissioned, one command"
has "$out" '"mrepo":"local/workbench"' "the workbench at workbench, local/workbench"
has "$out" '"commission":"done","service":"started"' "its commission done: its components deployed, then itself in service"
for m in workbench docs splectral; do [ -d "$H2/work/mrepos/local/$m/.git" ] && ok "the install's registry, mrepos/: local/$m" || no "the install's registry, mrepos/: local/$m"; done
out=$(wb --output . crud/read '*')
has "$out" '"shortcuts":[{"mrepo":"local/workbench"' "the boot mrepo links the workbench"
hasnt "$out" '"mrepo":"local/docs"' "and not its components: they are the workbench's"
out=$(wb --output workbench crud/read '*')
for m in docs splectral; do has "$out" "\"shortcuts\":[{\"mrepo\":\"local/$m\"" "local/$m: linked in the workbench, at workbench/$m: forward visibility"; done
is "$(wb --output workbench/docs service/start)" '{"service":"started","state":"started","again":true}' "the docs mrepo in service: its own commission (a start again: a repeat)"
out=$(wb --output workbench/splectral splectral/status)
URL=$(printf '%s' "$out" | sed -n 's/.*"url":"\([^"]*\)".*/\1/p')
has "$URL" "http://127.0.0.1:" "Splectral in service, its server: $URL"
get /install; is "$code" 200 "its site answers"
has "$(wb workbench/docs info/get haiccing/base-docs-hdlc/validation)" "Before every commit" "the docs mrepo answers, its info extracted at its initialise"
has "$(wb --output workbench crud/read howtos)" '"value":{"kind":"howtos"}' "in the workbench: its howtos namespace, made at its initialise"
has "$(wb --output . haicc/mrepos local/docs)" '"uri":"local/docs","position":"workbench/docs","package":"haiccing/base-component-docs","running":true' "haicc . haicc/mrepos local/docs: the registry consulted, the docs mrepo where it is from the root"
has "$(wb --output . haicc/mrepos "local/*")" '"uri":"local/help","position":"workbench/splectral/help"' "the help viewer's mrepo, deployed by the workbench's Splectral, two links down"
get /help/; is "$code" 200 "the workbench's help view: its help viewer in service, installed by its commission"
has "$PAGE" '<code>haicc workbench/docs info/get</code>' "it reads the docs mrepo by its unique URI, found by the server where it is: workbench/docs"
get /help/haiccing/base-docs-hdlc/validation; has "$PAGE" "Before every commit" "a page by its keywords, from the workbench's docs mrepo"
is "$(running2 | wc -l | tr -d ' ')" 7 "seven processes: the runtimes of the boot mrepo, the workbench, docs, Splectral, the help viewer's mrepo, Splectral's server and the help viewer's program"
out=$(wb . boot/deploy bench-2 haiccing/base-solution-workbench); has "$out" "its commission failed: line 7: boot/deploy docs haiccing/base-component-docs: in the way" "a second on the same install: its components' places taken, its commission failed, the line of its file said"
[ ! -e "$H2/work/mrepos/local/bench-2" ] && ok "nothing of it left" || no "nothing of it left"
s=$(ms); out=$(wb --output . boot/teardown workbench); r=$?; echo "teardown2 $(( $(ms) - s ))" >> "$TIMES"
is "$out" '{"tornDown":"workbench"}' "haicc . boot/teardown workbench: its decommission first"
[ ! -e "$H2/work/mrepos/local/docs" ] && [ ! -e "$H2/work/mrepos/local/splectral" ] && [ ! -e "$H2/work/mrepos/local/help" ] && ok "its components torn down by its decommission, the help viewer's too, their folders gone" || no "its components torn down by its decommission"
is "$(running2 | wc -l | tr -d ' ')" 1 "the boot mrepo's runtime alone left"
label=machine2; s=$(ms); wb boot/teardown >/dev/null; r=$?; echo "machine2 $(( $(ms) - s ))" >> "$TIMES"; is $r 0 "haicc boot/teardown: the workbench's install"
is "$(pgrep -f -- "[/]bin/bare $T/" | wc -l | tr -d ' ')" 0 "nothing of either install left running"

echo "# timing (ms)"
for s in boot docs splectral base install initialise start stop teardown machine workbench teardown2 machine2; do echo "# $s $(sed -n "s/^$s //p" "$TIMES")"; done
echo "# pages $(sed -n 's/^page //p' "$TIMES" | tr '\n' ' ')"
echo "# checks = $((n - failed))/$n pass"
[ "$failed" -eq 0 ] && { echo "# ok"; exit 0; }
echo "# not ok"; exit 1
