#!/bin/bash

# Script para publicar a extensão no VS Code Marketplace
# Execute: bash publish.sh

set -e  # Exit on error

echo "🚀 Publishing MCP AI Prompts to VS Code Marketplace..."
echo ""

# Check if vsce is installed
if ! command -v vsce &> /dev/null; then
    echo "❌ vsce not found. Installing globally..."
    npm install -g @vscode/vsce
fi

# Check if screenshots exist
echo "📸 Checking for screenshots..."
if [ ! -d "media/screenshots" ] || [ -z "$(ls -A media/screenshots 2>/dev/null)" ]; then
    echo "⚠️  WARNING: No screenshots found in media/screenshots/"
    echo "   Screenshots are highly recommended for marketplace listing."
    echo ""
    read -p "Continue without screenshots? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Aborted. Please add screenshots first."
        echo "   Follow: vscode-extension/SCREENSHOTS_GUIDE.md"
        exit 1
    fi
fi

# Validate package
echo ""
echo "✅ Validating extension package..."
vsce ls

# Check if already logged in
echo ""
echo "🔐 Checking authentication..."
if ! vsce verify-pat GleidsonFerSanP 2>/dev/null; then
    echo "Please login with your Personal Access Token (PAT):"
    vsce login GleidsonFerSanP
fi

# Ask for confirmation
echo ""
echo "📦 Package details:"
echo "   Name: mcp-ai-prompts"
echo "   Version: $(node -p "require('./package.json').version")"
echo "   Publisher: GleidsonFerSanP"
echo ""
read -p "Ready to publish? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Publish cancelled."
    exit 0
fi

# Publish
echo ""
echo "🚀 Publishing to marketplace..."
vsce publish

echo ""
echo "✅ SUCCESS! Extension published!"
echo ""
echo "📊 View your extension at:"
echo "   https://marketplace.visualstudio.com/items?itemName=GleidsonFerSanP.mcp-ai-prompts"
echo ""
echo "📈 Manage at:"
echo "   https://marketplace.visualstudio.com/manage/publishers/GleidsonFerSanP"
echo ""
echo "🎉 Congratulations!"
