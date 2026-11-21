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
