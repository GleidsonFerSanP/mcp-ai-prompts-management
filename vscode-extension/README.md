# MCP AI Prompts - VS Code Extension

Manage and organize your AI prompts directly in VS Code with cloud storage support!

## Features

### 📚 Prompts Library

* **Tree View** with organized categories
* **Search** and filter prompts
* **Quick actions**: Copy, Insert, Edit, Delete
* **Category organization** with custom icons

### ☁️ Cloud Storage Support

Store your prompts in:
* **Local** - Default local storage
* **OneDrive** - Microsoft OneDrive
* **Google Drive** - Google Drive (File Stream & Backup)
* **Dropbox** - Dropbox Personal & Business

### ⚡ Quick Actions

* `Ctrl+Shift+P` → **AI Prompts: Add New Prompt**
* `Ctrl+Shift+P` → **AI Prompts: Search Prompts**
* `Ctrl+Shift+P` → **AI Prompts: Configure Storage**

### 🔍 Snippets

Type `prompt-` in any file to autocomplete and insert your prompts!

## Installation

1. Install from VS Code Marketplace
2. Open **AI Prompts** sidebar
3. Click the cloud icon to configure storage
4. Start adding prompts!

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
