#!/bin/sh
# haicc-install.sh: installs the haicc command on this machine. Generated
# (haiccing/base-linux-haicc: build.sh); not edited.
#   sh haicc-install.sh [--home=<folder>] [--bin=<folder>]
#     --home   haicc's own folder: its scripts, its pins, its sources list,
#              later its sources, Bare and the work folder
#              ($HAICC_HOME, else ~/.haicc)
#     --bin    where the command is registered, a folder on the PATH
#              (/usr/local/bin when it can be written, else ~/.local/bin)
# It carries the scripts and the pins only. Nothing is fetched: the sources
# and Bare come next (haicc sources ..., haicc prereq). Run again, it
# replaces the scripts and the pins and keeps everything else.
set -eu
home=${HAICC_HOME:-$HOME/.haicc}
bin=
for a in "$@"; do
  case "$a" in
    --home=*) home=${a#--home=} ;;
    --bin=*) bin=${a#--bin=} ;;
    *) echo "sh haicc-install.sh [--home=<folder>] [--bin=<folder>]" >&2; exit 2 ;;
  esac
done
if [ -z "$bin" ]; then
  if [ -d /usr/local/bin ] && [ -w /usr/local/bin ]; then bin=/usr/local/bin; else bin=$HOME/.local/bin; fi
fi
mkdir -p "$home/bin" "$bin"
home=$(cd "$home" && pwd)
bin=$(cd "$bin" && pwd)
# the command registered in the install's own bin/ would replace the script
# it starts, and start itself for ever
[ "$bin" != "$home/bin" ] || { echo "haicc-install.sh: --bin is the install's own folder, $home/bin: name another" >&2; exit 2; }
cat > "$home/bin/haicc" <<'HAICC_INSTALL_FILE_END'
#!/bin/sh
# haicc: the command, on Linux. The command itself is an app, run with Bare
# (the package $APP_PACKAGE, its bundle in the sources); this script is the
# first step: what has to work before Bare is on the machine, then the
# app's start.
#   haicc sources link <folder>     its own: a folder linked as a source
#   haicc sources download bare     its own: Bare fetched over https
#   haicc sources download <org>... its own: an organisation's packages
#                                   fetched over https, from their releases
#   haicc prereq [--check]          its own: what the app needs to start,
#                                   checked; Bare put in place
#   haicc --help                    its own commands said, then the app's
#   haicc <anything else>           the app: <bare> <app's bundle> /run
#                                   <anything else>. Not startable yet:
#                                   what is missing said, exit 3
set -u
here=$(cd "$(dirname "$0")" && pwd)
HAICC_HOME=${HAICC_HOME:-$(cd "$here/.." && pwd)}
export HAICC_HOME
. "$here/haicc-lib.sh"

usage () {
  cat <<USAGE
Before anything else, Bare and the sources:
haicc sources link <folder>                     a local folder linked as a
                                                source: Bare's runtime and
                                                the packages come from it
haicc sources download bare                     Bare's runtime fetched over
                                                https, checked against its pin
haicc sources download <org>...                 an organisation's packages
                                                fetched over https from their
                                                releases, checked against its
                                                manifest ($HAICC_ORG, and each
                                                platform's)
haicc prereq [--check]                          what the command needs to
                                                start, checked; Bare put in
                                                place from the sources
                                                (--check: only checked)
USAGE
}

# The app, when it can be started: its bundle's path; else nothing.
app () {
  [ -x "$HAICC_BARE" ] || return 0
  in_sources "$HAICC_ORG/$APP_PACKAGE.bundle"
}
# Is every part after the first one of bare, third-party, an organisation
# (and one there)? Those are fetched before the app can start.
only_own () {
  [ $# -gt 0 ] || return 1
  for _w in "$@"; do is_download "$_w" || return 1; done
}

case "${1:-}" in
  prereq) shift; exec sh "$here/haicc-prereq" "$@" ;;
  sources)
    case "${2:-}" in
      link) shift; exec sh "$here/haicc-sources" "$@" ;;
      download) if (shift 2; only_own "$@"); then shift; exec sh "$here/haicc-sources" "$@"; fi ;;
    esac ;;
  ''|help|--help|-h)
    usage
    bundle=$(app)
    if [ -n "$bundle" ]; then echo; echo "Then:"; exec "$HAICC_BARE" "$bundle" /run --help; fi
    echo
    echo "Then, once haicc prereq says all is there: haicc --help says the rest."
    exit 0 ;;
esac
bundle=$(app)
if [ -z "$bundle" ]; then
  sh "$here/haicc-prereq" --check | grep '^missing' >&2
  fail "a prerequisite is missing: haicc prereq" 3
fi
exec "$HAICC_BARE" "$bundle" /run "$@"
HAICC_INSTALL_FILE_END
cat > "$home/bin/haicc-lib.sh" <<'HAICC_INSTALL_FILE_END'
# haicc-lib.sh: what the haicc scripts share; sourced, never run.
#   HAICC_HOME   haicc's own folder: bin/, pins, sources.list, sources/, bare/
# The pins (the pinned Bare, a build a platform, the organisation, the
# app) come from $HAICC_HOME/pins; this machine's Bare chosen from them.
HAICC_HOME=${HAICC_HOME:-$(cd "$(dirname "$0")/.." && pwd)}
. "$HAICC_HOME/pins"
HAICC_LIST=$HAICC_HOME/sources.list
HAICC_BARE=$HAICC_HOME/bare/bin/bare

fail () { printf 'haicc: %s\n' "$1" >&2; exit "${2:-1}"; }

# The sources registered, one a line: the folders first, in the order they
# were linked (folder:<path>), then https, the backup (github:<org>).
sources () {
  [ -f "$HAICC_LIST" ] || return 0
  grep '^folder:' "$HAICC_LIST" || true
  grep -v '^folder:' "$HAICC_LIST" || true
}
# The folders among them, in order.
folders () { sources | sed -n 's/^folder://p'; }
# A file (relative to a source) in the first folder that holds it: its path.
in_sources () {
  folders | while IFS= read -r _d; do
    if [ -f "$_d/$1" ]; then printf '%s\n' "$_d/$1"; break; fi
  done
}
sha512_of () { sha512sum "$1" | cut -d' ' -f1; }
# This machine's platform, as Bare names it.
platform () {
  _s=$(uname -s | tr 'A-Z' 'a-z'); _m=$(uname -m)
  case "$_m" in x86_64|amd64) _m=x64 ;; aarch64|arm64) _m=arm64 ;; esac
  printf '%s-%s\n' "$_s" "$_m"
}
# This machine's Bare, from the pins (a file, a url and a sha512 a platform,
# BARE_<os>_<arch>_...): BARE_PLATFORM, BARE_FILE, BARE_URL, BARE_SHA512;
# a platform not pinned: BARE_FILE empty.
BARE_PLATFORM=$(platform)
case "$BARE_PLATFORM" in *[!a-z0-9-]*) _p=none ;; *) _p=$(printf '%s' "$BARE_PLATFORM" | tr - _) ;; esac
eval "BARE_FILE=\${BARE_${_p}_FILE:-} BARE_URL=\${BARE_${_p}_URL:-} BARE_SHA512=\${BARE_${_p}_SHA512:-}"
# What haicc sources download takes: bare, third-party, an organisation
# (a name, <org>; a package is never downloaded alone).
is_download () { case "$1" in bare|third-party) return 0 ;; ''|*[!a-z0-9-]*|-*) return 1 ;; [a-z]*) return 0 ;; *) return 1 ;; esac; }
HAICC_INSTALL_FILE_END
cat > "$home/bin/haicc-prereq" <<'HAICC_INSTALL_FILE_END'
#!/bin/sh
# haicc prereq: what the command needs to start, checked, and put in place
# where it is missing. Nothing is fetched: Bare is unpacked from the sources.
#   haicc prereq           checked; Bare put in place from the sources
#   haicc prereq --check   checked only, nothing changed
# A line a prerequisite: ok, or missing with how to get it. Exit 0 when all
# are there, 3 when one is missing.
#   platform   this machine's, one Bare is pinned for (the pins: a build
#              a platform; this machine's chosen)
#   tools      what the scripts use: tar, sha512sum
#   sources    a folder registered that holds the app: its bundle, with its
#              organisation's manifest
#   bare       the pinned Bare, this platform's, in haicc's folder, as
#              pinned (its tarball's sha512 recorded beside it)
set -u
. "$(dirname "$0")/haicc-lib.sh"
check=no
for a in "$@"; do
  case "$a" in --check) check=yes ;; *) fail "haicc prereq [--check]" 2 ;; esac
done
missing=0
ok () { printf 'ok       %s\n' "$1"; }
miss () { printf 'missing  %s\n' "$1"; missing=1; }

# platform
if [ -n "$BARE_FILE" ]; then ok "platform: $BARE_PLATFORM"
else miss "platform: this is $BARE_PLATFORM, Bare is pinned for $BARE_PLATFORMS"; fi

# tools
for t in tar sha512sum; do
  if command -v "$t" >/dev/null 2>&1; then ok "tool: $t"; else miss "tool: $t (install it)"; fi
done

# sources
app=$(in_sources "$HAICC_ORG/$APP_PACKAGE.bundle")
if [ -n "$app" ] && [ -f "$(dirname "$app")/manifest.json" ]; then ok "sources: $(dirname "$(dirname "$app")")"
else miss "sources: no folder registered holds $HAICC_ORG/$APP_PACKAGE.bundle (haicc sources link <folder>)"; fi

# bare
if [ -z "$BARE_FILE" ]; then
  miss "bare: none pinned for $BARE_PLATFORM"
elif [ -x "$HAICC_BARE" ] && [ -f "$HAICC_HOME/bare/tarball.sha512" ] && [ "$(cat "$HAICC_HOME/bare/tarball.sha512")" = "$BARE_SHA512" ]; then
  ok "bare: $BARE_VERSION, as pinned"
else
  tarball=$(in_sources "$BARE_FILE")
  if [ -z "$tarball" ]; then miss "bare: $BARE_FILE in no source (haicc sources download bare, or link a folder that has it)"
  elif [ "$(sha512_of "$tarball")" != "$BARE_SHA512" ]; then miss "bare: $tarball is not as pinned (sha512)"
  elif [ "$check" = yes ]; then miss "bare: not put in place yet (haicc prereq)"
  else
    rm -rf "$HAICC_HOME/bare"
    mkdir -p "$HAICC_HOME/bare"
    if tar -xzf "$tarball" -C "$HAICC_HOME/bare" --strip-components=1 && [ -f "$HAICC_BARE" ]; then
      chmod +x "$HAICC_BARE"
      printf '%s\n' "$BARE_SHA512" > "$HAICC_HOME/bare/tarball.sha512"
      ok "bare: $BARE_VERSION, put in place from $tarball"
    else
      rm -rf "$HAICC_HOME/bare"
      miss "bare: $tarball could not be unpacked"
    fi
  fi
fi

[ "$missing" -eq 0 ] || exit 3
HAICC_INSTALL_FILE_END
cat > "$home/bin/haicc-sources" <<'HAICC_INSTALL_FILE_END'
#!/bin/sh
# haicc sources, the part that has to work before Bare is on the machine:
# where Bare's runtime and the app come from. The other actions (the list,
# unlink, https, no-https) are the app's.
#   haicc sources link <folder>       a local folder linked as a source (not
#                                     copied): our packages (<org>/<package>
#                                     .bundle, <org>/manifest.json, addons/)
#                                     and the third-party components
#   haicc sources download bare       Bare's runtime, this machine's
#                                     platform's, fetched over https into
#                                     haicc's own sources folder, checked
#                                     against its pin; that folder linked
#                                     (third-party: the same)
#   haicc sources download <org>...   an organisation's packages fetched
#                                     over https from their releases into
#                                     the same folder: its manifest (an
#                                     asset of the latest release of its
#                                     documentation package, base-docs-
#                                     <platform>: haiccing's base-docs-haicc),
#                                     then each package's bundle and addons
#                                     from its own release (r-<commit>),
#                                     each checked against the manifest
#                                     (sha256); the manifest written last;
#                                     github:<org> registered
# The list is the app's too: $HAICC_HOME/sources.list, a line a source,
# folder:<path> or github:<org>. This is the only script that reaches the
# network.
set -u
. "$(dirname "$0")/haicc-lib.sh"
own=$HAICC_HOME/sources

register () {
  sources | grep -Fxq "$1" && return 0
  printf '%s\n' "$1" >> "$HAICC_LIST"
}

# A file fetched over https: tried up to five times, each try going on from
# what the one before got (-C -), since a connection reset in the middle of
# a large file is not one of curl's own retries; checked by the caller.
fetch () {
  rm -f "$2"
  _i=1
  while :; do
    curl -fsSL --retry 3 --connect-timeout 20 -C - -o "$2" "$1" && return 0
    [ "$_i" -ge 5 ] && return 1
    echo "  retrying ($_i): $1" >&2
    _i=$((_i + 1)); sleep 2
  done
}

download_bare () {
  command -v curl >/dev/null 2>&1 || fail "curl is needed to download" 3
  [ -n "$BARE_FILE" ] || fail "no Bare pinned for this machine, $BARE_PLATFORM (pinned: $BARE_PLATFORMS)" 3
  to=$own/$BARE_FILE
  if [ -f "$to" ] && [ "$(sha512_of "$to")" = "$BARE_SHA512" ]; then echo "bare: there, as pinned ($BARE_VERSION, $BARE_PLATFORM)"; return 0; fi
  mkdir -p "$(dirname "$to")"
  echo "bare: fetching $BARE_URL"
  fetch "$BARE_URL" "$to.part" || { rm -f "$to.part"; fail "could not fetch Bare's runtime: $BARE_URL" 3; }
  [ "$(sha512_of "$to.part")" = "$BARE_SHA512" ] || { rm -f "$to.part"; fail "Bare's runtime is not as pinned (sha512): $BARE_URL" 3; }
  mv "$to.part" "$to"
  echo "bare: downloaded, as pinned ($BARE_VERSION, $BARE_PLATFORM)"
}

# Where the releases are: $HAICC_RELEASES/<org>/<package>/releases/
# download/<tag>/<file>, as on GitHub (another base, a file:// one, for a
# test).
releases=${HAICC_RELEASES:-https://github.com}
# The repository whose latest release carries an organisation's manifest:
# its documentation package, base-docs-<platform>; haicc's own, base-docs-haicc.
manifest_repo () { case "$1" in "$HAICC_ORG") echo base-docs-haicc ;; *) echo "base-docs-$1" ;; esac; }
sha256_of () { sha256sum "$1" | cut -d' ' -f1; }

# The manifest, as tools/release.js writes it (two spaces a level): a line
# a package (P <name> <file> <sha256> <commit>), then a line an addon
# (A <sha256>).
entries () {
  awk '
    /^    "[^"]+": \{$/ { split($0, q, "\""); name = q[2]; file = ""; sha = ""; commit = ""; inadd = 0; next }
    inadd && /^      \]/ { inadd = 0; next }
    inadd { split($0, q, "\""); adds = adds " " q[2]; next }
    /^      "file": / { split($0, q, "\""); file = q[4] }
    /^      "sha256": / { split($0, q, "\""); sha = q[4] }
    /^      "commit": / { split($0, q, "\""); commit = q[4] }
    /^      "addons": \[$/ { inadd = 1; adds = "" }
    /^    \}/ { print "P", name, file, sha, commit; n = split(adds, a, " "); for (i = 1; i <= n; i++) print "A", a[i]; adds = "" }
  ' "$1"
}

download_org () {
  org=$1
  command -v curl >/dev/null 2>&1 || fail "curl is needed to download" 3
  command -v sha256sum >/dev/null 2>&1 || fail "sha256sum is needed to download" 3
  tmp=$own/$org.part
  rm -rf "$tmp"; mkdir -p "$tmp" "$own/$org" "$own/addons"
  url=$releases/$org/$(manifest_repo "$org")/releases/latest/download/manifest.json
  echo "$org: fetching its manifest, $url"
  fetch "$url" "$tmp/manifest.json" || { rm -rf "$tmp"; fail "could not fetch the manifest: $url" 3; }
  entries "$tmp/manifest.json" > "$tmp/entries"
  grep -q '^P ' "$tmp/entries" || { rm -rf "$tmp"; fail "the manifest names no package: $url" 3; }
  name=; tar_=
  while read -r kind a b c d; do
    if [ "$kind" = P ]; then
      name=$a; pkg=${a#*/}; to=$own/$b; tag=r-$(printf '%.7s' "$d"); base=$releases/$org/$pkg/releases/download/$tag
      if [ -f "$to" ] && [ "$(sha256_of "$to")" = "$c" ]; then echo "$name: there"
      else
        fetch "$base/$pkg.bundle" "$to.part" || { rm -rf "$tmp" "$to.part"; fail "could not fetch $name: $base/$pkg.bundle" 3; }
        [ "$(sha256_of "$to.part")" = "$c" ] || { rm -rf "$tmp" "$to.part"; fail "$name: not as the manifest says (sha256): $base/$pkg.bundle" 3; }
        mv "$to.part" "$to"; echo "$name: fetched ($tag)"
      fi
      tar_=$base/$pkg-addons.tar; got=no
    else
      [ -f "$own/addons/$a" ] && [ "$(sha256_of "$own/addons/$a")" = "$a" ] && continue
      if [ "$got" = no ]; then
        fetch "$tar_" "$tmp/addons.tar" || { rm -rf "$tmp"; fail "could not fetch $name's addons: $tar_" 3; }
        mkdir -p "$tmp/x"; tar -xf "$tmp/addons.tar" -C "$tmp/x" --no-same-owner || { rm -rf "$tmp"; fail "$name's addons could not be unpacked: $tar_" 3; }
        got=yes
      fi
      [ -f "$tmp/x/addons/$a" ] && [ "$(sha256_of "$tmp/x/addons/$a")" = "$a" ] || { rm -rf "$tmp"; fail "$name: an addon missing or not as named (sha256): $a in $tar_" 3; }
      cp "$tmp/x/addons/$a" "$own/addons/$a.part" && mv "$own/addons/$a.part" "$own/addons/$a"
    fi
    [ "$kind" = P ] && rm -rf "$tmp/x"
  done < "$tmp/entries"
  mv "$tmp/manifest.json" "$own/$org/manifest.json"
  rm -rf "$tmp"
  echo "$org: downloaded, as its manifest says"
}

cmd=${1:-}
[ $# -gt 0 ] && shift
case "$cmd" in
  link)
    [ $# -eq 1 ] || fail "haicc sources link <folder>" 2
    [ -d "$1" ] || fail "no folder: $1" 2
    register "folder:$(cd "$1" && pwd)"
    sources ;;
  download)
    [ $# -gt 0 ] || fail "haicc sources download bare|<org>..." 2
    for what in "$@"; do is_download "$what" || fail "haicc sources download bare|<org>... (not one: $what)" 2; done
    # the folder registered after each download, so what one fetched is
    # there even when the next fails; an organisation's https too
    for what in "$@"; do
      case "$what" in
        bare|third-party) download_bare ;;
        *) download_org "$what"; register "github:$what" ;;
      esac
      register "folder:$own"
    done ;;
  *)
    fail "haicc sources link <folder>, haicc sources download bare|<org>..." 2 ;;
esac
HAICC_INSTALL_FILE_END
cat > "$home/pins" <<'HAICC_INSTALL_FILE_END'
# pins: what the haicc scripts are pinned to; sourced by them.
# Bare's runtime, third party: the Bare the packages are built with,
# written by their build from its lockfile; a build a platform
# (BARE_<os>_<arch>_FILE, _URL, _SHA512), this machine's chosen by the
# scripts (bin/haicc-lib.sh).
BARE_VERSION=1.36.0
BARE_PLATFORMS='linux-x64 linux-arm64'
BARE_linux_x64_FILE=holepunchto/bare-runtime-linux-x64-1.36.0.tgz
BARE_linux_x64_URL=https://registry.npmjs.org/bare-runtime-linux-x64/-/bare-runtime-linux-x64-1.36.0.tgz
BARE_linux_x64_SHA512=3c1cb0a7b58e3408eeaac29ce153ea966af7dc88f8ba06cd3ddff1c3693020ee8ec6c5a1453dedd8790786fc928dac6aed1e850f26de73f7ef796d04701a4a41
BARE_linux_arm64_FILE=holepunchto/bare-runtime-linux-arm64-1.36.0.tgz
BARE_linux_arm64_URL=https://registry.npmjs.org/bare-runtime-linux-arm64/-/bare-runtime-linux-arm64-1.36.0.tgz
BARE_linux_arm64_SHA512=754687f5fd84c0264e8c49b4483e472cf2ccc08103b3bd5d86af355c1ab3df2b2513184d85487679470107eba30ea31b3285e69b884d3a2bdc92e4088f6dc2ce
# Ours: the organisation, and the app the command is: its package, run
# with Bare from its bundle in the sources.
HAICC_ORG=haiccing
APP_PACKAGE=base-app-haicc
HAICC_INSTALL_FILE_END
chmod +x "$home/bin/haicc"
. "$home/pins"
# https the backup, by default (haicc sources no-https: not)
[ -f "$home/sources.list" ] || printf 'github:%s\n' "$HAICC_ORG" > "$home/sources.list"
# The command, registered: a small script on the PATH that names haicc's folder.
q () { printf "'%s'" "$(printf '%s' "$1" | sed "s/'/'\\\\''/g")"; }
printf '#!/bin/sh\nHAICC_HOME=%s exec sh %s "$@"\n' "$(q "$home")" "$(q "$home/bin/haicc")" > "$bin/haicc"
chmod +x "$bin/haicc"
echo "haicc installed: $bin/haicc (its folder: $home)"
case ":$PATH:" in
  *":$bin:"*) ;;
  *) echo "note: $bin is not on your PATH" ;;
esac
