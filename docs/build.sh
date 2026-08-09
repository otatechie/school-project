#!/usr/bin/env bash
# Regenerate the HTML and PDF documentation from the Markdown sources.
#
#   ./docs/build.sh
#
# Markdown is the source of truth — edit the .md files, never docs/html or
# docs/pdf. Requires node and Google Chrome (used headless to print the PDFs).

set -euo pipefail
cd "$(dirname "$0")/.."

CHROME="${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
if [[ ! -x "$CHROME" ]]; then
    echo "Chrome not found at: $CHROME" >&2
    echo "Set CHROME=/path/to/chrome and re-run." >&2
    exit 1
fi

mkdir -p docs/html docs/pdf

build() {
    local src=$1 name=$2 title=$3 subtitle=$4 kind=$5
    node docs/build-docs.mjs "$src" "docs/html/$name.html" "$title" "$subtitle" "$kind"
    "$CHROME" --headless --disable-gpu --no-pdf-header-footer \
        --print-to-pdf="docs/pdf/$name.pdf" "file://$PWD/docs/html/$name.html" 2>&1 |
        grep -i "bytes written" || true
}

build docs/USER-GUIDE.md user-guide \
    "GovPay Desk User Guide" \
    "How to prepare, approve and pay vouchers, raise memos, and administer the system." \
    "User Guide"

build docs/TECHNICAL.md technical \
    "GovPay Desk Technical Documentation" \
    "Architecture, data model, routes and conventions for the codebase." \
    "Technical Reference"

build docs/MVP-GUIDE.md mvp-guide \
    "GovPay Desk MVP Guide" \
    "What the system does, how the workflow runs, and how to work on it." \
    "Project Overview"

echo "Done. See docs/pdf/ and docs/html/."
