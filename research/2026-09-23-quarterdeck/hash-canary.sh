#!/usr/bin/env bash
# hash-canary.sh — FNV-1a 64-bit over UTF-8 bytes, pure bash.
#
# bash integers are 64-bit signed; the unsigned offset-basis and prime wrap to the
# correct two's-complement bit patterns, and `(h * prime)` wrapping is exactly the
# mod-2^64 arithmetic FNV-1a wants.
#
# LC_ALL=C makes ${#s} and ${s:i:1} count BYTES, not characters — required for the
# multibyte canary "café" (5 UTF-8 bytes, not 4 characters).
#
# NOTE: run this via `node audit/hash-canary.mjs` instead if node is available; the
# .mjs is the reference implementation. This bash port exists for environments where
# only a POSIX shell is present.
# Run: LC_ALL=C bash audit/hash-canary.sh
export LC_ALL=C
set -u

fnv1a64() {
  local s="$1" i byte
  local h=$(( 0xcbf29ce484222325 ))
  local prime=$(( 0x100000001b3 ))
  for (( i=0; i<${#s}; i++ )); do
    printf -v byte '%d' "'${s:i:1}"
    h=$(( (h ^ byte) ))
    h=$(( (h * prime) ))
  done
  printf '%016x\n' "$h"
}

for s in 'cafe' 'café' 'café | ok' ''; do
  printf 'fnv1a64(%s) = %s\n' "\"$s\"" "$(fnv1a64 "$s")"
done

# Cross-check against a real sha256 for the "is 64 bits enough?" argument in RECEIPTS.md.
if command -v sha256sum >/dev/null 2>&1; then
  printf 'sha256("café") = %s\n' "$(printf 'caf\xc3\xa9' | sha256sum | cut -d' ' -f1)"
fi
