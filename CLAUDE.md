# CLAUDE.md - MCP AI Prompts Management

> Arquivo de memória estruturada para Claude Code, seguindo práticas de [Anthropic Context Engineering](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents).

## 🎯 Project Purpose

MCP server for managing AI prompts with persistent storage. Enables AI assistants to store, retrieve, and organize prompts across sessions using the Model Context Protocol.

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    MCP Server                           │
│  ┌─────────────────────────────────────────────────┐   │
│  │              Tool Handlers                       │   │
│  │  add_prompt | list_prompts | get_prompt | ...   │   │
│  └─────────────────────────────────────────────────┘   │
│                         │                               │
│  ┌─────────────────────────────────────────────────┐   │
│  │           Storage Abstraction                    │   │
│  │              StorageFactory                      │   │
│  └─────────────────────────────────────────────────┘   │
│                         │                               │
│  ┌─────────────────────────────────────────────────┐   │
│  │           Storage Providers                      │   │
│  │  Local | OneDrive | GoogleDrive | Dropbox       │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

## 📂 Key Files

| File | Purpose | Token Budget |
|------|---------|--------------|
| `src/index.ts` | MCP server, tool definitions | Medium |
| `src/types.ts` | TypeScript interfaces | Low |
| `src/storage.ts` | Storage abstraction | Low |
| `src/storage/StorageFactory.ts` | Provider factory | Medium |
| `src/storage/providers/*.ts` | Cloud providers | Reference only |

## 🔧 Available MCP Tools

### High-Frequency Tools (load metadata)

* `list_prompts` - Returns metadata only, supports filters
* `get_categories` - List unique categories
* `get_tags` - List unique tags

### On-Demand Tools (load full content)

* `get_prompt` - Fetch complete prompt content by ID/name

### Mutation Tools (modify state)

* `add_prompt` - Create new prompt
* `update_prompt` - Modify existing prompt
* `delete_prompt` - Remove prompt

### Configuration Tools (rare use)

* `get_storage_config` - Current storage info
* `configure_storage` - Change provider
* `list_storage_providers` - Available providers

## 🧠 Context Engineering Rules

### Progressive Disclosure Pattern

```
User asks about prompts
        │
        ▼
┌───────────────────┐
│  list_prompts     │  ◄── Returns: id, name, category, tags, description
│  (metadata only)  │      NOT: full content
└───────────────────┘
        │
        ▼ User selects specific prompt
┌───────────────────┐
│  get_prompt       │  ◄── Returns: full content
│  (full content)   │      Only when needed
└───────────────────┘
```

### Token Budget Guidelines

| Context Type | Max Tokens | Action if Exceeded |
|--------------|------------|-------------------|
| System prompt | 2000 | Compaction needed |
| Tool results | 1000 each | Summarize or clear |
| Conversation | 8000 | Create checkpoint |
| Files in context | 500 each | Load on-demand |

### Compaction Triggers

When to compact context:
1. Conversation exceeds 10 turns
2. Multiple large tool results accumulated
3. Switching to different task area
4. Starting new major feature

## 📋 Current Session State

### Active Focus

<!-- Claude Code updates this section -->
* **Task**: [Current task description]
* **Files Modified**: [List of files]
* **Decisions Made**: [Key decisions]

### Unresolved Issues

<!-- Persist bugs/issues across compaction -->
* None currently

### Implementation Notes

<!-- Critical details to preserve -->
* Storage providers implement `StorageProvider` interface
* All prompts have unique IDs generated by `generateId()`
* Timestamps use ISO format

## 🔄 Workflow Checklists

### Adding New Tool

```
□ Define tool in ListToolsRequestSchema handler
□ Implement handler in CallToolRequestSchema
□ Add types to types.ts if needed
□ Update AGENTS.md with new tool
□ Test with MCP Inspector
```

### Modifying Storage

```
□ Check StorageProvider interface contract
□ Update all providers if interface changes
□ Test with local provider first
□ Verify migration path exists
```

### Context Reset Recovery

After compaction or context reset, Claude should:
1. Read this CLAUDE.md file
2. Check NOTES.md for session state
3. Review "Current Session State" section
4. Continue from last checkpoint

## 🎓 Domain Knowledge

### MCP Protocol

* Tools are defined with JSON Schema for inputs
* Server uses stdio transport
* Responses have `content` array with typed items

### TypeScript Patterns

* Strict mode enabled
* Use `as unknown as Type` for MCP argument casting
* Prefer interfaces over types for objects

### Storage Pattern

* Factory pattern for provider selection
* Async/await for all I/O operations
* JSON serialization for persistence

## 📝 Notes Archive

<!-- Historical notes moved here after compaction -->

---

*Last updated: Auto-maintained by Claude Code*
*Pattern: [Structured Note-Taking](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)*
