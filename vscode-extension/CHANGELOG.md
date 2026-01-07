# Change Log

All notable changes to the "mcp-ai-prompts" extension will be documented in this file.

## [1.0.0] - 2026-01-06

### 🎉 Initial Release

#### ✨ Features

**Prompt Management**
- TreeView sidebar with prompts organized by category
- Rich WebView editor for creating and editing prompts
- Metadata panel showing ID, creation date, last update, category, and tags
- Category icons with color coding
- Full CRUD operations (Create, Read, Update, Delete)

**Quick Access**
- IntelliSense completion provider (type `prompt-` in any file)
- Copy to clipboard with one click
- Insert at cursor position
- Quick search via Command Palette
- 10 built-in commands

**Cloud Storage Support**
- Local storage (default)
- OneDrive with auto-detection
- Google Drive (File Stream & Backup & Sync)
- Dropbox (Personal & Business)
- Automatic provider detection
- Easy configuration via UI

**User Experience**
- Status bar item showing current storage provider
- Statistics command showing prompts count, categories, and tags
- Customizable category icons
- Dark and light theme support
- Responsive WebView design

#### 🛠️ Technical

- Built on Model Context Protocol (MCP)
- TypeScript implementation
- Stdio transport for MCP communication
- Storage abstraction with provider pattern
- Full VS Code API integration

#### 📦 Commands

- `aiPrompts.addPrompt` - Add new prompt
- `aiPrompts.editPrompt` - Edit existing prompt
- `aiPrompts.deletePrompt` - Delete prompt
- `aiPrompts.copyPrompt` - Copy to clipboard
- `aiPrompts.insertPrompt` - Insert at cursor
- `aiPrompts.searchPrompts` - Quick search
- `aiPrompts.refreshPrompts` - Refresh tree view
- `aiPrompts.configureStorage` - Configure storage provider
- `aiPrompts.showStats` - Show statistics
- `aiPrompts.openSettings` - Open extension settings

#### 🎯 Supported Platforms

- Windows 10/11
- macOS 10.15+
- Linux (Ubuntu, Fedora, etc)

---

## [Unreleased]

### Planned Features
- Import/export prompts to JSON
- Prompt templates
- Variables support in prompts
- Sharing prompts with team
- Prompt versioning
- Usage analytics
