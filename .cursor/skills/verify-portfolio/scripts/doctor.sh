#!/usr/bin/env bash
# Read-only health check for the verification instance started by launch.sh.
set -euo pipefail

SKILL_DIR="$(cd "$(dirname "$0")/.." && pwd)"
RUN_DIR="${VERIFY_RUN_DIR:-$SKILL_DIR/.run}"
STATE_FILE="$RUN_DIR/state.env"
BODY_FILE="${TMPDIR:-/tmp}/portfolio-doctor-body.html"

if [[ ! -f "$STATE_FILE" ]]; then
  echo "FAIL: no state file at $STATE_FILE (run scripts/launch.sh first)"
  exit 1
fi

# shellcheck disable=SC1090
source "$STATE_FILE"

ok=1
BASE_PATH="${BASE_PATH:-/portfolio}"

if [[ -z "${PID:-}" ]] || ! kill -0 "$PID" 2>/dev/null; then
  echo "FAIL: process PID=${PID:-unset} is not running"
  ok=0
else
  echo "OK: process pid=$PID alive"
fi

URL="http://${HOST:-127.0.0.1}:${PORT}${BASE_PATH}/"
code="$(curl -fsS -o "$BODY_FILE" -w "%{http_code}" "$URL" || true)"
if [[ "$code" == "200" ]]; then
  echo "OK: $URL → 200"
  if grep -Eiq 'Pedro|Portfolio|data-test="wordmark"|data-test="hero"' "$BODY_FILE"; then
    echo "OK: response body looks like Portfolio"
  else
    echo "WARN: 200 but body does not look like Portfolio — check base path / wrong app"
  fi
else
  echo "FAIL: $URL not healthy (HTTP ${code:-none})"
  ok=0
fi

if [[ -f "${REPO_ROOT:-}/package.json" ]] && grep -q '"name": "portfolio"' "${REPO_ROOT}/package.json"; then
  echo "OK: package.json name is portfolio"
else
  echo "FAIL: REPO_ROOT package.json is not portfolio"
  ok=0
fi

echo "NOTE: verification Launch serves Eleventy at ${BASE_PATH}/ ; live Pages is https://my-creations.github.io/portfolio/"

if [[ "$ok" -ne 1 ]]; then
  exit 1
fi
echo "Doctor passed for $URL"
