#!/usr/bin/env bash
set -euo pipefail

# sno opencode plugin installer
# Copies commands, agents, and registers the TS plugin in opencode.json

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OC_CONFIG="${HOME}/.config/opencode"
OC_JSON="${OC_CONFIG}/opencode.json"

echo "sno installer — opencode plugin"
echo "================================"

# Check prerequisites
if ! command -v opencode &>/dev/null; then
  echo "ERROR: opencode not found. Install it first: https://opencode.ai"
  exit 1
fi

if [ ! -f "$OC_JSON" ]; then
  echo "ERROR: opencode.json not found at $OC_JSON"
  exit 1
fi

# Create target directories
mkdir -p "${OC_CONFIG}/command"
mkdir -p "${OC_CONFIG}/agents"
mkdir -p "${OC_CONFIG}/sno"

# Install commands (symlink to stay in sync with repo)
echo ""
echo "Installing commands..."
for cmd in "${SCRIPT_DIR}"/commands/sno*.md; do
  name="$(basename "$cmd")"
  ln -sf "$cmd" "${OC_CONFIG}/command/${name}"
  echo "  -> ${name}"
done

# Install agents (symlink to stay in sync with repo)
echo ""
echo "Installing agents..."
for agent in "${SCRIPT_DIR}"/agents/sno-*.md; do
  name="$(basename "$agent")"
  ln -sf "$agent" "${OC_CONFIG}/agents/${name}"
  echo "  -> ${name}"
done

# Build the TS plugin
echo ""
echo "Building TS plugin..."
if command -v bun &>/dev/null; then
  (cd "${SCRIPT_DIR}/sno-plugin" && bun install && bun build src/index.ts)
else
  echo "  WARN: bun not found. Skipping plugin build."
  echo "  Install bun (https://bun.sh) and run: cd sno-plugin && bun install && bun build src/index.ts"
fi

# Register plugin in opencode.json if not already registered
PLUGIN_PATH="${SCRIPT_DIR}/sno-plugin"
if grep -q "opencode-sno-plugin\|sno-plugin" "$OC_JSON" 2>/dev/null; then
  echo ""
  echo "Plugin already registered in opencode.json"
else
  echo ""
  echo "Registering plugin in opencode.json..."
  echo "  NOTE: Add the following to your opencode.json \"plugin\" array:"
  echo "    \"${PLUGIN_PATH}\""
  echo ""
  echo "  You may also want to add these permission entries:"
  echo "    \"permission.read\": { \"~/.config/opencode/sno/*\": \"allow\" }"
  echo "    \"permission.external_directory\": { \"~/.config/opencode/sno/*\": \"allow\" }"
fi

echo ""
echo "================================"
echo "sno installed!"
echo ""
echo "  Commands: $(ls "${SCRIPT_DIR}"/commands/sno*.md | wc -l | tr -d ' ') files"
echo "  Agents:   $(ls "${SCRIPT_DIR}"/agents/sno-*.md | wc -l | tr -d ' ') files"
echo "  Plugin:   ${PLUGIN_PATH}"
echo ""
echo "Run /sno in opencode to get started."
