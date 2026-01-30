# AGENTS.md - MCP AI Prompts Management

> A dedicated, predictable place for AI coding agents to understand this project.

## Project Overview

This is an MCP (Model Context Protocol) server for managing AI prompts with persistent storage. It allows AI assistants to store, retrieve, and organize prompts across sessions.

**Key Concept**: This MCP server implements **Progressive Context Enrichment** - agents fetch context when needed rather than loading everything upfront.

## Quick Start

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Run development mode
npm run dev
```

## Project Structure

```
src/
├── index.ts           # MCP server entry point, tool definitions
├── types.ts           # TypeScript interfaces (Prompt, params)
├── storage.ts         # Storage abstraction layer
└── storage/
    ├── config.ts          # Storage configuration
    ├── StorageFactory.ts  # Provider factory pattern
    └── providers/         # Local, OneDrive, GoogleDrive, Dropbox
```

## Testing Instructions

```bash
# Run all tests
npm test

# Type checking
npm run typecheck

# Lint
npm run lint
```

## Code Style Guidelines

* **TypeScript strict mode** enabled
* **Single Responsibility Principle** - each tool does one thing well
* **Type Safety** - all parameters and returns are typed
* **Clean Code** - descriptive names, minimal comments (code is self-documenting)
* **MCP Protocol Standards** - follow @modelcontextprotocol/sdk conventions

## Architecture Decisions

### Progressive Context Pattern

Following [Anthropic's Context Engineering](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents) and [Progressive Context Enrichment](https://www.inferable.ai/blog/posts/llm-progressive-context-encrichment):

1. **Minimal Initial Context**: `list_prompts` returns metadata only (name, category, tags)
2. **On-Demand Full Content**: `get_prompt` fetches complete prompt content
3. **Filtered Retrieval**: Support category/tags/search filters to reduce token usage
4. **Lightweight Identifiers**: Use IDs and names as references, load content just-in-time

### Tool Design Principles

From [Claude Skills Best Practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices):

* **Concise descriptions** - only include what the LLM needs
* **Clear input schemas** - unambiguous parameter definitions
* **Minimal overlap** - each tool has distinct purpose
* **Token efficient** - return only relevant data

## MCP Tools Reference

| Tool | Purpose | When to Use |
|------|---------|-------------|
| `list_prompts` | Get prompt metadata with filters | Browsing/searching prompts |
| `get_prompt_summary` | Fetch prompt summary (token-efficient) | Quick preview without full content |
| `get_prompt` | Fetch full prompt content | Need complete prompt text |
| `add_prompt` | Create new prompt | Saving a new prompt |
| `update_prompt` | Modify existing prompt | Editing prompt content |
| `delete_prompt` | Remove prompt | Cleaning up prompts |
| `get_categories` | List all categories | Organizing/filtering |
| `get_tags` | List all tags | Organizing/filtering |
| `get_context_stats` | Token usage statistics | Planning context budget |
| `get_storage_config` | Current storage info | Checking configuration |
| `configure_storage` | Change storage provider | Switching storage backend |

## Context Engineering Guidelines

### For AI Agents Using This MCP

1. **Don't load all prompts upfront** - Use `list_prompts` with filters first
2. **Fetch content on-demand** - Only call `get_prompt` when you need the full content
3. **Use categories/tags** - Filter to reduce context window usage
4. **Prefer search** - Use keyword search instead of loading all prompts

### For Contributing to This Project

1. **Keep tool responses concise** - Return minimal necessary data
2. **Support progressive disclosure** - Metadata first, content on request
3. **Add filters** - Enable agents to reduce context scope
4. **Document token impact** - Note which operations are expensive

## Security Considerations

* Storage paths are validated
* No arbitrary file system access
* Provider credentials handled securely
* Input sanitization on all parameters

## Common Workflows

### Adding a New Prompt

```
1. Call add_prompt with name, description, content, category
2. Optionally add tags for organization
3. Prompt is persisted immediately
```

### Finding a Specific Prompt

```
1. Call list_prompts with search term or category filter
2. Review metadata to identify target prompt
3. Call get_prompt with ID to get full content
```

### Migrating Storage Provider

```
1. Call list_storage_providers to see options
2. Call configure_storage with new provider and migrate=true
3. Verify with get_storage_config
```

## VSCode Extension

The `vscode-extension/` directory contains a companion VSCode extension. See [vscode-extension/README.md](vscode-extension/README.md) for details.

## Documentation

* [Context Engineering Guide](docs/context-engineering-guide.md) ⭐ **Start here for context principles**
* [Architecture](docs/mcp-ai-prompts/architecture/mcp-server-architecture.md)
* [User Guide](docs/mcp-ai-prompts/guides/user-guide.md)
* [Roadmap](docs/mcp-ai-prompts/roadmap/cloud-storage-and-vscode-extension.md)

---

*This file follows the [AGENTS.md](https://agents.md/) specification for AI coding agents.*
