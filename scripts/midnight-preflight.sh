#!/usr/bin/env bash
set -euo pipefail

fail=0
check() {
  if command -v "$1" >/dev/null 2>&1; then
    printf 'OK   %s: ' "$1"
    "$@" 2>/dev/null | head -n 1 || true
  else
    printf 'MISS %s\n' "$1"
    fail=1
  fi
}

check node --version
check npm --version
check docker --version
check compact --version

if command -v compact >/dev/null 2>&1; then
  compact compile --version
fi

if command -v docker >/dev/null 2>&1; then
  docker compose version
fi

if [ "$fail" -ne 0 ]; then
  printf '\nInstall the missing prerequisites before compiling Lifeline.\n'
  exit 1
fi

printf '\nMidnight prerequisites are available.\n'
