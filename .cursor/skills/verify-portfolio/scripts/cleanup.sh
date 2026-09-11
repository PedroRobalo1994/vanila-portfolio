#!/usr/bin/env bash
# Tear down the verification instance started by launch.sh. Never deletes evidence/.
set -euo pipefail

SKILL_DIR="$(cd "$(dirname "$0")/.." && pwd)"
RUN_DIR="${VERIFY_RUN_DIR:-$SKILL_DIR/.run}"
STATE_FILE="$RUN_DIR/state.env"
EVIDENCE_DIR="$SKILL_DIR/evidence"

if [[ ! -f "$STATE_FILE" ]]; then
  echo "Nothing to clean (no $STATE_FILE)"
  echo "Evidence (untouched): $EVIDENCE_DIR"
  exit 0
fi

# shellcheck disable=SC1090
source "$STATE_FILE"

if [[ -n "${PID:-}" ]] && kill -0 "$PID" 2>/dev/null; then
  echo "Stopping pid=$PID (Eleventy on port ${PORT:-?})"
  # Kill process group when launched in its own session; fall back to PID.
  if [[ -n "${PID:-}" ]]; then
    kill -- -"$PID" 2>/dev/null || kill "$PID" 2>/dev/null || true
  fi
  for _ in 1 2 3 4 5 6 7 8; do
    kill -0 "$PID" 2>/dev/null || break
    sleep 0.5
  done
  if kill -0 "$PID" 2>/dev/null; then
    echo "SIGKILL pid=$PID"
    kill -9 -- -"$PID" 2>/dev/null || kill -9 "$PID" 2>/dev/null || true
  fi
else
  echo "PID ${PID:-unset} already gone"
fi

rm -f "$STATE_FILE"
rm -f "$RUN_DIR/eleventy.log"
find "$RUN_DIR" -mindepth 1 -maxdepth 1 ! -name 'evidence' -exec rm -rf {} + 2>/dev/null || true

echo "Cleanup done. Evidence survives at: $EVIDENCE_DIR"
ls -la "$EVIDENCE_DIR" 2>/dev/null || true
