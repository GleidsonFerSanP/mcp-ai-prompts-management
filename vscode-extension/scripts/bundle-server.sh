#!/bin/bash
# Bundle the MCP server into the extension for standalone distribution

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
EXTENSION_DIR="$(dirname "$SCRIPT_DIR")"
PROJECT_ROOT="$(dirname "$EXTENSION_DIR")"
SERVER_DIR="$EXTENSION_DIR/server"

echo "📦 Bundling MCP server into extension..."

# Build the main project first
echo "🔨 Building MCP server..."
cd "$PROJECT_ROOT"
npm run build

# Create server directory in extension
echo "📁 Creating server directory..."
mkdir -p "$SERVER_DIR"

# Copy built server files (check both dist/ and build/)
echo "📋 Copying server files..."
if [ -d "$PROJECT_ROOT/dist" ]; then
    cp -r "$PROJECT_ROOT/dist/"* "$SERVER_DIR/"
elif [ -d "$PROJECT_ROOT/build" ]; then
    cp -r "$PROJECT_ROOT/build/"* "$SERVER_DIR/"
else
    echo "❌ Error: Neither dist/ nor build/ directory found"
    exit 1
fi

# Copy necessary dependencies info
echo "📝 Copying package info..."
cat > "$SERVER_DIR/package.json" << 'EOF'
{
  "name": "mcp-ai-prompts-server",
  "version": "1.0.0",
  "type": "module",
  "main": "index.js"
}
EOF

echo "✅ Server bundled successfully into: $SERVER_DIR"
echo ""
echo "The extension can now work standalone without requiring"
echo "the MCP server to be installed separately."
