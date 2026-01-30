# Context Engineering Guide

> Guia de implementação dos princípios de Context Engineering e Progressive Context Enrichment neste projeto.

## 📚 Referências

Este projeto implementa princípios de:

1. **[Anthropic - Effective Context Engineering for AI Agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)**
2. **[Inferable - Progressive Context Enrichment](https://www.inferable.ai/blog/posts/llm-progressive-context-encrichment)**
3. **[Claude Skills Best Practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices)**
4. **[AGENTS.md Specification](https://agents.md/)**

## 🧠 Core Concepts

### Context is a Finite Resource

> "Context must be treated as a finite resource with diminishing marginal returns."
> — Anthropic

LLMs têm um "attention budget" limitado. Cada token adicionado reduz a capacidade de atenção do modelo. A qualidade supera a quantidade.

### Progressive Disclosure

> "Rather than saying 'here's all my data, ' expose tools that let the LLM search for specific data when needed."
> — Inferable

O padrão implementado:

```
┌─────────────────────┐     ┌─────────────────────┐     ┌─────────────────────┐
│   list_prompts      │ ──► │  get_prompt_summary │ ──► │    get_prompt       │
│   (metadata only)   │     │    (with preview)   │     │   (full content)    │
└─────────────────────┘     └─────────────────────┘     └─────────────────────┘
      Stage 1                    Stage 2                     Stage 3
   ~50 tokens/item            ~150 tokens/item           Full content
```

### Minimal High-Signal Tokens

> "Good context engineering means finding the smallest possible set of high-signal tokens that maximize the likelihood of some desired outcome."
> — Anthropic

## 🔧 Implementação neste Projeto

### 1. Tool Descriptions Concisas

**Antes:**

```typescript
description: 'Lista todos os prompts salvos, com opção de filtrar...'
```

**Depois:**

```typescript
description: 'Lista prompts (metadata only). Use get_prompt para conteúdo completo.'
```

### 2. Response Compaction

```typescript
// src/compaction.ts
export function formatPromptListCompact(prompts: Prompt[]): string {
  // Returns: id, name, category, tags only
  // NOT: full content, timestamps, descriptions
}
```

### 3. Token Estimation

```typescript
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4); // ~4 chars per token
}
```

### 4. Progressive Loading

```typescript
// Stage 1: Metadata
case 'list_prompts': // Returns compact list

// Stage 2: Summary  
case 'get_prompt_summary': // Returns description + preview

// Stage 3: Full
case 'get_prompt': // Returns complete content
```

### 5. Context Stats Tool

```typescript
case 'get_context_stats':
  // Reports token usage per category
  // Identifies large prompts that may need attention
```

## 📁 Arquivos de Contexto

### AGENTS.md

* **Propósito**: Instruções para AI coding agents
* **Público**: Qualquer AI agent (Copilot, Cursor, Windsurf, etc.)
* **Formato**: Markdown seguindo spec agents.md

### CLAUDE.md

* **Propósito**: Memória estruturada para Claude Code
* **Público**: Claude especificamente
* **Conteúdo**: Arquitetura, arquivos chave, decisões, estado de sessão

### NOTES.md

* **Propósito**: Notas de sessão persistentes
* **Uso**: Structured note-taking para long-horizon tasks
* **Manutenção**: Atualizado durante sessões, arquivado periodicamente

### .copilot-instructions.md

* **Propósito**: Instruções específicas para GitHub Copilot
* **Conteúdo**: Workflow, regras, princípios de context engineering

## 🔄 Long-Horizon Task Strategies

### Compaction

Quando usar:
* Conversação excede 10 turnos
* Múltiplos resultados de tools acumulados
* Mudança de área de trabalho

O que preservar:
* ✅ Decisões arquiteturais
* ✅ Bugs não resolvidos
* ✅ Detalhes de implementação críticos

O que descartar:
* ❌ Outputs de tools redundantes
* ❌ Código já commitado
* ❌ Informações já incorporadas

### Structured Note-Taking

```markdown

## Session [DATE]

### Focus: [Current task]

### Accomplishments: [What was done]

### Decisions: [Key decisions with rationale]

### Carry Forward: [What to remember]

```

### Sub-Agent Architecture

Para tarefas complexas, delegar a sub-agentes especializados:
* Cada sub-agente opera com contexto limpo
* Retorna apenas resumo condensado (~1000-2000 tokens)
* Agente principal sintetiza resultados

## 📊 Métricas de Contexto

### Token Budgets Recomendados

| Componente | Budget | Ação se Exceder |
|------------|--------|-----------------|
| System prompt | 2000 | Simplificar |
| Tool results | 1000/each | Compactar |
| Conversation | 8000 | Checkpoint |
| File context | 500/each | Load on-demand |

### Indicadores de Compaction Necessária

1. `estimatedTokens > 1000` em resposta de tool
2. Mais de 5 resultados de tools sem uso
3. Conversa > 10 turnos no mesmo tópico

## ✅ Checklist de Context Engineering

### Para Novas Tools

* [ ] Descrição < 100 caracteres
* [ ] Input schema minimal
* [ ] Retorno compact por padrão
* [ ] Suporte a filtros
* [ ] Token estimation incluído

### Para Responses

* [ ] Metadata separado de content
* [ ] Hint para próxima ação
* [ ] Warning se conteúdo extenso
* [ ] ID para referência futura

### Para Sessions

* [ ] NOTES.md atualizado
* [ ] Checkpoints em tarefas longas
* [ ] Context stats verificado periodicamente
* [ ] Compaction quando necessário

---

*Baseado em práticas de [Anthropic](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents), [Inferable](https://www.inferable.ai/blog/posts/llm-progressive-context-encrichment), e [Claude Platform](https://platform.claude.com/docs/).*
