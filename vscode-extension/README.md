# MCP AI Prompts - VS Code Extension

<div align="center">

**Manage and organize your AI prompts directly in VS Code**

[![Version](https://img.shields.io/vscode-marketplace/v/GleidsonFerSanP.mcp-ai-prompts.svg)](https://marketplace.visualstudio.com/items?itemName=GleidsonFerSanP.mcp-ai-prompts)
[![Installs](https://img.shields.io/vscode-marketplace/i/GleidsonFerSanP.mcp-ai-prompts.svg)](https://marketplace.visualstudio.com/items?itemName=GleidsonFerSanP.mcp-ai-prompts)

</div>

## 📖 Overview

MCP AI Prompts is a powerful VS Code extension that helps you manage, organize, and quickly access your favorite AI prompts. Built on top of the Model Context Protocol (MCP), it provides a seamless experience for developers who work with AI assistants.

## ✨ Features

### 🎯 Prompt Management

* **TreeView Sidebar** - Browse prompts organized by category
* **Quick Search** - Find prompts instantly with Command Palette
* **Rich Editor** - Create and edit prompts with a beautiful WebView interface
* **Metadata Panel** - View creation date, last update, category, and tags

### 🚀 Quick Access

* **IntelliSense Completions** - Type `prompt-` in any file to see autocomplete suggestions
* **Copy & Insert** - One-click copy to clipboard or insert at cursor
* **Command Palette** - Access all features via `Cmd+Shift+P`

### ☁️ Cloud Storage Support

Store your prompts in:
* 💾 **Local** - Default local storage
* ☁️ **OneDrive** - Microsoft OneDrive
* ☁️ **Google Drive** - Google Drive (File Stream & Backup)
* ☁️ **Dropbox** - Dropbox Personal & Business

### 🎨 Beautiful UI

* **Category Icons** - Visual icons for different prompt categories
* **Color Coding** - Tags and categories with distinct colors
* **Dark/Light Theme** - Adapts to your VS Code theme
* **Status Bar** - Shows current storage provider at a glance

## 🚀 Quick Start

### 1. Add Your First Prompt

```
Cmd+Shift+P → "AI Prompts: Add New Prompt"
```

Fill in the form with title, category, description, tags, and content.

### 2. Use the Prompt

**Option A: IntelliSense**

```typescript
// Type "prompt-" and see autocomplete
prompt-code-reviewer
```

**Option B: Sidebar** - Click and choose "Copy" or "Insert at Cursor"

**Option C: Quick Search** - `Cmd+Shift+P → "AI Prompts: Search Prompts"`

### 3. Configure Cloud Storage

```
Cmd+Shift+P → "AI Prompts: Configure Storage"
```

## Configuration

Configure in Settings ( `Cmd+,` ):

```json
{
  "aiPrompts.storage.provider": "onedrive",
  "aiPrompts.storage.path": "",  // Auto-detect
  "aiPrompts.defaultCategory": "development",
  "aiPrompts.snippetPrefix": "prompt-",
  "aiPrompts.showCategoryIcons": true
}
```

## Usage

### Add a New Prompt

1. Click the **+** icon in sidebar
2. Fill in the details:
   - Name
   - Description
   - Category
   - Tags
   - Content
3. Save!

### Use a Prompt

* **Copy**: Right-click → Copy to Clipboard
* **Insert**: Right-click → Insert at Cursor
* **Snippet**: Type `prompt-<name>` and select from autocomplete

### Configure Cloud Storage

1. Click the ☁️ cloud icon in sidebar
2. Select your provider (OneDrive, Google Drive, or Dropbox)
3. Extension will auto-detect the folder
4. Done! Your prompts sync automatically

## Installation Methods

### Method 1: Install from VSIX (Recommended)

```bash
# Download the latest .vsix file from releases
code --install-extension mcp-ai-prompts-1.0.1.vsix
```

### Method 2: Install from Marketplace

Search for "MCP AI Prompts" in the VS Code Extensions marketplace.

### Method 3: Development Setup

```bash
# Clone the repository
git clone https://github.com/GleidsonFerSanP/mcp-ai-prompts-management.git
cd mcp-ai-prompts-management

# Build the main MCP server
npm install && npm run build

# Build the extension
cd vscode-extension
npm install && npm run compile

# Open in VS Code and press F5 to debug
```

## Requirements

* VS Code 1.85.0 or higher
* The MCP server is bundled with the extension (no separate installation needed)

## Configuration

### Settings

| Setting | Default | Description |
|---------|---------|-------------|
| `aiPrompts.storage.provider` | `local` | Storage provider (local, onedrive, googledrive, dropbox) |
| `aiPrompts.storage.path` | `""` | Custom storage path (auto-detect if empty) |
| `aiPrompts.mcpServerPath` | `""` | Custom MCP server path (auto-detect if empty) |
| `aiPrompts.defaultCategory` | `development` | Default category for new prompts |
| `aiPrompts.snippetPrefix` | `prompt-` | Prefix for autocomplete snippets |
| `aiPrompts.showCategoryIcons` | `true` | Show icons in tree view |

## Known Issues

None at this time. Please report issues on [GitHub](https://github.com/GleidsonFerSanP/mcp-ai-prompts-management/issues).

## Release Notes

### 1.0.1

* Improved MCP server connection with auto-detection
* Added server bundling for standalone distribution
* Fixed type consistency issues
