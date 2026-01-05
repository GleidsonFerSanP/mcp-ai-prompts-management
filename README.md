# MCP AI Prompts Management

Servidor MCP para gerenciar seus prompts de AI favoritos de forma organizada e fácil de acessar.

> 📚 **Documentação Completa:** Veja a [documentação detalhada](docs/mcp-ai-prompts/) para arquitetura, guias e exemplos.

## 🚀 Funcionalidades

### ✅ Disponíveis Agora

* **Adicionar prompts** com nome, descrição, conteúdo, categoria e tags
* **Listar prompts** com filtros por categoria e tags
* **Buscar prompts** por nome ou palavras-chave
* **Obter conteúdo** completo de prompts para uso
* **Atualizar prompts** existentes
* **Remover prompts** que não precisa mais
* **Organização** por categorias e tags personalizadas

### 🚧 Em Desenvolvimento (Roadmap)

* **🌥️ Armazenamento em Nuvem**
  + OneDrive, Google Drive, Dropbox, iCloud Drive
  + Sincronização automática multi-dispositivo
  + Backup automático dos prompts
  
* **🎨 Extensão VS Code**
  + Interface gráfica integrada
  + Painel sidebar com TreeView
  + Snippets para inserção rápida
  + Command Palette completo

> 📋 Veja o [roadmap completo](docs/mcp-ai-prompts/roadmap/cloud-storage-and-vscode-extension.md) para mais detalhes

## 📦 Instalação

```bash
npm install
npm run build
```

## ⚙️ Configuração no Claude Desktop

Adicione ao seu `claude_desktop_config.json` :

```json
{
  "mcpServers": {
    "ai-prompts": {
      "command": "node",
      "args": [
        "/Users/gleidsonfersanp/workspace/AI/mcp-ai-prompts-managenment/dist/index.js"
      ]
    }
  }
}
```

## 🎯 Como Usar

### Adicionar um Prompt

```
Adicione um novo prompt:
- Nome: Code Review Expert
- Categoria: development
- Tags: code-review, quality
- Descrição: Prompt para revisar código com foco em qualidade
- Conteúdo: [seu prompt aqui]
```

### Listar Prompts

```
Liste todos os meus prompts salvos
Liste prompts da categoria development
Liste prompts com a tag code-review
```

### Usar um Prompt

```
Me dê o prompt "Code Review Expert"
Quero usar o prompt de code review
```

## 📁 Estrutura de Dados

Os prompts são salvos em `prompts-data.json` com a seguinte estrutura:

```json
{
  "id": "unique-id",
  "name": "Nome do Prompt",
  "description": "Descrição do que o prompt faz",
  "content": "Conteúdo completo do prompt",
  "category": "categoria",
  "tags": ["tag1", "tag2"],
  "createdAt": "2026-01-04T...",
  "updatedAt": "2026-01-04T..."
}
```

## 🏷️ Categorias Sugeridas

* `development` - Prompts para desenvolvimento de código
* `writing` - Prompts para escrita e conteúdo
* `analysis` - Prompts para análise de dados
* `creative` - Prompts criativos
* `business` - Prompts para negócios
* `personal` - Prompts pessoais

## 📝 Exemplos de Uso

### Prompt para Code Review

```
Nome: Revisor de Código Expert
Categoria: development
Tags: code-review, quality, best-practices
```

### Prompt para Documentação

```
Nome: Documentador Técnico
Categoria: writing
Tags: documentation, technical-writing
```

## 🛠️ Desenvolvimento

```bash
# Modo watch para desenvolvimento
npm run watch

# Build
npm run build
```

## � Documentação

O projeto está totalmente documentado usando o **Project Docs MCP**:

### 📖 Guias Disponíveis

* **[Guia do Usuário](docs/mcp-ai-prompts/guides/user-guide.md)** - Instalação, configuração e uso completo
* **[Arquitetura](docs/mcp-ai-prompts/architecture/mcp-server-architecture.md)** - Arquitetura técnica detalhada

### 🎯 Features Registradas

* **Gerenciamento de Prompts de AI** (✅ Completo)
  + 7 ferramentas MCP
  + Armazenamento persistente
  + Filtros e busca avançada

### 📋 Decisões Arquiteturais (ADRs)

* **ADR-001:** Armazenamento em JSON File vs Database

### 🔧 Contratos Registrados

* **Prompt** - Interface principal para prompts

### 📁 Estrutura de Documentação

```
docs/mcp-ai-prompts/
├── architecture/
│   └── mcp-server-architecture.md    # Arquitetura técnica
└── guides/
    └── user-guide.md                  # Guia do usuário

.project-docs-mcp/                     # Metadata do projeto
├── documentation.json                 # Índice de documentos
├── features.json                      # Features registradas
├── contracts.json                     # Contratos/interfaces
├── patterns.json                      # Padrões de código
└── decisions.json                     # ADRs
```

## 📄 Licença

````MIT
