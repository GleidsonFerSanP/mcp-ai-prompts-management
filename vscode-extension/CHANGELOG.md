# Change Log

All notable changes to the "mcp-ai-prompts" extension will be documented in this file.

## [1.1.0] - 2026-01-31

### 🚀 Major Features

**GitHub Copilot Chat Integration**
* New `@prompts` chat participant for interacting with your prompt library
* Commands: `/list`,  `/search`,  `/use`,  `/suggest`,  `/save`
* Natural language prompt management directly in Copilot Chat

**MCP Server Auto-Detection**
* Registered as MCP Server Definition Provider
* Copilot automatically detects and uses prompt tools
* No need for explicit commands - just ask naturally!

**Language Model Tools** 
* 9 tools exposed to Copilot for automatic invocation:
  + `listPrompts` - List all prompts
  + `getPrompt` - Get prompt content
  + `searchPrompts` - Search by keyword
  + `getCategories` - List categories
  + `getTags` - List tags
  + `addPrompt` - Save new prompt
  + `updatePrompt` - Update existing prompt
  + `deletePrompt` - Remove prompt
  + `improvePrompt` - Analyze and suggest improvements

**Prompt Engineering Form**
* New prompt type selector: Zero-shot, Few-shot, Chain-of-Thought, ReAct, Tree-of-Thought
* Persona field for role definition
* Context field for background information
* Examples field for few-shot learning
* Constraints field for boundaries
* Output format specification

### 🔧 Improvements

**Chat Participant**
* `/use` command now injects prompt as active context
* Rich markdown formatting in responses
* Interactive buttons and quick actions

**UI Enhancements**
* New modern SVG icon
* Better tree view with CRUD actions
* View, Edit, Delete commands for each prompt

---

## [1.0.1] - 2026-01-30

### 🔧 Improvements

**MCP Server Connection**
* Improved server path detection with multiple strategies:
  + User-configurable path via `aiPrompts.mcpServerPath` setting
  + Bundled server support (standalone extension)
  + Global npm installation detection
  + Development path auto-detection
* Better error messages when server is not found

**Code Quality**
* Fixed type consistency between WebView and MCP interfaces
* Improved TypeScript type safety

**Build Process**
* Added server bundling script for standalone distribution
* Extension now works without separate MCP server installation

### 📦 New Settings

* `aiPrompts.mcpServerPath` - Custom path to MCP server (for advanced users)

---

## [1.0.0] - 2026-01-06

### 🎉 Initial Release

#### ✨ Features

**Prompt Management**
* TreeView sidebar with prompts organized by category
* Rich WebView editor for creating and editing prompts
* Metadata panel showing ID, creation date, last update, category, and tags
* Category icons with color coding
* Full CRUD operations (Create, Read, Update, Delete)

**Quick Access**
* IntelliSense completion provider (type `prompt-` in any file)
* Copy to clipboard with one click
* Insert at cursor position
* Quick search via Command Palette
* 10 built-in commands

**Cloud Storage Support**
* Local storage (default)
* OneDrive with auto-detection
* Google Drive (File Stream & Backup & Sync)
* Dropbox (Personal & Business)
* Automatic provider detection
* Easy configuration via UI

**User Experience**
* Status bar item showing current storage provider
* Statistics command showing prompts count, categories, and tags
* Customizable category icons
* Dark and light theme support
* Responsive WebView design

#### 🛠️ Technical

* Built on Model Context Protocol (MCP)
* TypeScript implementation
* Stdio transport for MCP communication
* Storage abstraction with provider pattern
* Full VS Code API integration

#### 📦 Commands

* `aiPrompts.addPrompt` - Add new prompt
* `aiPrompts.editPrompt` - Edit existing prompt
* `aiPrompts.deletePrompt` - Delete prompt
* `aiPrompts.copyPrompt` - Copy to clipboard
* `aiPrompts.insertPrompt` - Insert at cursor
* `aiPrompts.searchPrompts` - Quick search
* `aiPrompts.refreshPrompts` - Refresh tree view
* `aiPrompts.configureStorage` - Configure storage provider
* `aiPrompts.showStats` - Show statistics
* `aiPrompts.openSettings` - Open extension settings

#### 🎯 Supported Platforms

* Windows 10/11
* macOS 10.15+
* Linux (Ubuntu, Fedora, etc)

---

## [Unreleased]

### Planned Features

* Import/export prompts to JSON
* Prompt templates
* Variables support in prompts
* Sharing prompts with team
* Prompt versioning
* Usage analytics
