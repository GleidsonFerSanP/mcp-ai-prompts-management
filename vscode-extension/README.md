# MCP AI Prompts - VS Code Extension

<div align="center">

**Manage and organize your AI prompts directly in VS Code**

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/GleidsonFerSanP/mcp-ai-prompts-management)

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

## Requirements

* VS Code 1.85.0 or higher
* Node.js (for MCP server)

## Known Issues

None at this time. Please report issues on [GitHub](https://github.com/GleidsonFerSanP/mcp-ai-prompts-management/issues).

## Release Notes

### 1.0.0

* Initial release
* Tree view with categories
* Cloud storage support (OneDrive, Google Drive, Dropbox)
* Snippet autocomplete
* Basic CRUD operations

## Contributing

Contributions are welcome! See [CONTRIBUTING.md](../CONTRIBUTING.md).

## License

MIT License - see [LICENSE](../LICENSE) for details.
