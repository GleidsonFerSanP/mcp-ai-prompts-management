# Roadmap - Armazenamento em Nuvem e Extensão VS Code

## Resumo

Roadmap detalhado das próximas features a serem implementadas: extensão VS Code para interface gráfica e sistema de armazenamento em nuvem configurável com suporte a OneDrive, Google Drive, Dropbox e iCloud Drive.

## Contexto

* **Contexto**: general
* **Tipo**: guide
* **Tópicos**: roadmap, cloud-storage, vscode-extension, future-features

## Conteúdo

### Visão Geral

Este documento descreve as próximas features planejadas para o MCP AI Prompts Management, focando em duas áreas principais:

1. **🌥️ Armazenamento em Nuvem** - Sistema configurável para salvar prompts em serviços de cloud storage
2. **🎨 Extensão VS Code** - Interface gráfica integrada ao VS Code para gerenciar prompts

### Status Atual

✅ **Implementado:**
* Servidor MCP completo com 7 ferramentas
* Armazenamento local em JSON
* Sistema de categorias e tags
* Filtros e busca avançada

🚧 **Em Planejamento:**
* Sistema de storage configurável
* Suporte a múltiplos cloud providers
* Extensão VS Code
* Backup e sincronização automática

---

## 🌥️ Armazenamento em Nuvem

### Motivação

**Problema Atual:**
* Prompts salvos apenas localmente em `prompts-data.json`
* Sem backup automático
* Não disponível em outros computadores
* Risco de perda de dados

**Solução Proposta:**
Sistema de storage configurável que permite ao usuário escolher onde salvar seus prompts:
* ☁️ OneDrive
* ☁️ Google Drive
* ☁️ Dropbox
* ☁️ iCloud Drive (macOS)
* 💾 Local (padrão atual)

### Arquitetura Proposta

#### ADR-002: Pastas Sincronizadas vs API Direta

**Decisão:** Usar pastas locais sincronizadas pelos clientes desktop ao invés de integração direta via API dos cloud providers.

**Por quê:**
* ✅ Sem necessidade de autenticação OAuth complexa
* ✅ Usa sincronização já configurada pelo usuário
* ✅ Funciona offline com sync automático quando voltar online
* ✅ Zero dependências de APIs externas
* ✅ Simples e transparente

**Trade-offs:**
* ⚠️ Requer cliente desktop instalado
* ⚠️ Sem controle direto sobre sincronização

#### Strategy Pattern

```typescript
interface StorageProvider {
  name: string;
  type: 'local' | 'onedrive' | 'googledrive' | 'dropbox' | 'icloud';
  
  isAvailable(): Promise<boolean>;
  getDefaultPath(): string;
  validatePath(path: string): Promise<boolean>;
  load(path: string): Promise<Prompt[]>;
  save(path: string, prompts: Prompt[]): Promise<void>;
  exists(path: string): Promise<boolean>;
}
```

Cada cloud provider implementa esta interface:
* `LocalStorageProvider` (atual)
* `OneDriveStorageProvider`
* `GoogleDriveStorageProvider`
* `DropboxStorageProvider`
* `ICloudStorageProvider` (macOS apenas)

### Features Planejadas

#### 1. Sistema de Storage Configurável (Base)

**ID:** `feat-1767582626415-pspldzoep`

**Status:** 🚧 Planning  
**Prioridade:** 🔴 Alta

**Funcionalidades:**
* Interface comum para todos os storage backends
* Configuração persistida em arquivo `storage-config.json`
* Nova ferramenta MCP: `configure_storage`
* Nova ferramenta MCP: `list_storage_providers`
* Migração automática entre storages
* Fallback para local se cloud falhar

**Casos de Uso:**
1. Listar storage providers disponíveis
2. Mudar de local para OneDrive
3. Recuperação automática de falhas

**Implementação:**

```
src/storage/
├── index.ts                 # Factory e configuração
├── config.ts                # StorageConfig interface
├── providers/
│   ├── StorageProvider.ts   # Interface base
│   ├── LocalProvider.ts     # Implementação atual
│   ├── OneDriveProvider.ts
│   ├── GoogleDriveProvider.ts
│   ├── DropboxProvider.ts
│   └── ICloudProvider.ts
```

#### 2. OneDrive Storage

**ID:** `feat-1767582626411-mfqsr8lw9`

**Status:** 🚧 Planning  
**Prioridade:** 🔴 Alta

**Plataformas:** Windows, macOS  
**Caminho Padrão:**
* Windows: `%USERPROFILE%/OneDrive/AIPrompts`
* macOS: `~/OneDrive/AIPrompts`

**Funcionalidades:**
* Auto-detecção de instalação do OneDrive
* Validação de disponibilidade
* Configuração de caminho customizado
* Migração de dados existentes
* Sincronização automática multi-dispositivo

**Regras de Negócio:**
* Usuário pode configurar caminho customizado
* Sistema valida que caminho existe e é gravável
* Fallback para local se OneDrive offline
* Migração opcional de dados ao configurar

#### 3. Google Drive Storage

**ID:** `feat-1767582626414-zshotlrpa`

**Status:** 🚧 Planning  
**Prioridade:** 🟡 Média

**Plataformas:** Windows, macOS, Linux  
**Caminho Padrão:**
* macOS: `~/Google Drive/AIPrompts`
* Windows: `%USERPROFILE%/Google Drive/AIPrompts`

**Funcionalidades:**
* Suporte a Google Drive File Stream e Backup & Sync
* Auto-detecção de tipo de instalação
* Validação de disponibilidade
* Suporte offline

**Notas:**
* Google Drive tem dois clientes: File Stream (empresarial) e Backup and Sync (pessoal)
* Caminhos podem variar

#### 4. Dropbox Storage

**ID:** `feat-1767582626414-3orkkasc2`

**Status:** 🚧 Planning  
**Prioridade:** 🟡 Média

**Plataformas:** Windows, macOS, Linux  
**Caminho Padrão:**
* Todos: `~/Dropbox/AIPrompts` (macOS/Linux)
* Windows: `%USERPROFILE%/Dropbox/AIPrompts`

**Funcionalidades:**
* Auto-detecção de pasta Dropbox
* Suporte a Dropbox Business e pessoal
* Validação de quota disponível
* Sincronização automática

#### 5. iCloud Drive Storage (macOS)

**ID:** `feat-1767582626423-ywxfcrgag`

**Status:** 🚧 Planning  
**Prioridade:** 🟢 Baixa (específico de plataforma)

**Plataformas:** macOS apenas  
**Caminho:** `~/Library/Mobile Documents/com~apple~CloudDocs/AIPrompts`

**Funcionalidades:**
* Verificação de plataforma macOS
* Auto-detecção de iCloud habilitado
* Sincronização nativa entre dispositivos Apple
* Verificação de quota iCloud

**Benefícios:**
* Integração perfeita com ecossistema Apple
* Disponível em Mac, iPad (via Código)
* Sincronização nativa e rápida

---

## 🎨 Extensão VS Code

### Motivação

**Problema Atual:**
* Interface apenas via comandos de texto ao assistente
* Sem visualização gráfica dos prompts
* Difícil navegar por muitos prompts
* Não há forma rápida de inserir prompts no código

**Solução Proposta:**
Extensão VS Code que fornece interface gráfica completa integrada ao editor.

### Features Planejadas

#### Extensão VS Code para MCP AI Prompts

**ID:** `feat-1767582626391-lzmj2mlnd`

**Status:** 🚧 Planning  
**Prioridade:** 🔴 Alta

**Inspiração:** Projeto `ai-project-docs-mcp` que já implementa extensão VS Code para MCP

**Funcionalidades Principais:**

##### 1. Painel Sidebar

* **TreeView de Prompts:**
  + Organização por categorias
  + Ícones personalizados por categoria
  + Contador de prompts por categoria
  + Busca integrada
  + Filtros por tags

* **Detalhes do Prompt:**
  + Visualização completa ao clicar
  + Botões de ação rápida:
    - 📋 Copiar conteúdo
    - ✏️ Editar
    - 🗑️ Deletar
    - ➕ Inserir no editor

##### 2. Command Palette

Comandos disponíveis:
* `AI Prompts: Add New Prompt` - Abre formulário de criação
* `AI Prompts: Edit Prompt` - Edita prompt selecionado
* `AI Prompts: Delete Prompt` - Remove prompt
* `AI Prompts: Insert Prompt` - Insere no cursor
* `AI Prompts: Search Prompts` - Busca rápida
* `AI Prompts: Configure Storage` - Configura cloud storage

##### 3. Formulário de Criação/Edição

* **Interface Visual:**
  + Campo: Nome (required)
  + Campo: Descrição (required)
  + Campo: Categoria (dropdown com existentes + novo)
  + Campo: Tags (multi-select com autocomplete)
  + Editor: Conteúdo (Monaco editor com syntax highlighting)

* **Validações:**
  + Nome único
  + Campos obrigatórios preenchidos
  + Preview em tempo real

##### 4. Snippets

* **Autocomplete Inteligente:**
  + Digitar `prompt-` ativa autocomplete
  + Lista filtrada por nome e tags
  + Preview do conteúdo
  + Inserção no cursor

* **Exemplos:**
  

```
  prompt-review → insere Code Review Expert
  prompt-doc → insere Documentador Técnico
  ```

##### 5. Status Bar

* Indicador de storage ativo:
  

```
  ☁️ OneDrive (234 prompts)
  ```

* Click para mudar storage
* Indicador de sincronização

##### 6. Configurações

Configurações da extensão:

```json
{
  "aiPrompts.storage.provider": "onedrive",
  "aiPrompts.storage.path": "~/OneDrive/AIPrompts",
  "aiPrompts.defaultCategory": "development",
  "aiPrompts.snippetPrefix": "prompt-",
  "aiPrompts.showCategoryIcons": true
}
```

#### Arquitetura da Extensão

```
vscode-extension/
├── package.json
├── src/
│   ├── extension.ts           # Entry point
│   ├── mcpClient.ts           # Cliente MCP
│   ├── views/
│   │   ├── PromptsTreeProvider.ts
│   │   ├── PromptDetailsPanel.ts
│   │   └── PromptFormPanel.ts
│   ├── commands/
│   │   ├── addPrompt.ts
│   │   ├── editPrompt.ts
│   │   ├── deletePrompt.ts
│   │   └── insertPrompt.ts
│   ├── snippets/
│   │   └── PromptCompletionProvider.ts
│   └── config/
│       └── ConfigManager.ts
```

#### Dependências

```json
{
  "@types/vscode": "^1.85.0",
  "@modelcontextprotocol/sdk": "^1.0.4",
  "vscode-languageclient": "^9.0.0"
}
```

---

## 📋 Plano de Implementação

### Fase 1: Sistema de Storage Configurável (Core) ⏱️ 2-3 semanas

**Objetivo:** Infraestrutura base para suportar múltiplos storages

**Tarefas:**
1. ✅ Definir interfaces `StorageProvider` e `StorageConfig`
2. Refatorar `storage.ts` atual para usar provider pattern
3. Implementar `LocalStorageProvider`
4. Criar `StorageFactory` e sistema de configuração
5. Adicionar ferramentas MCP:
   - `list_storage_providers`

   - `configure_storage`

   - `get_storage_config`

6. Testes unitários para cada provider

**Entregável:** Sistema funcionando com provider local + estrutura para adicionar novos

### Fase 2: OneDrive Storage ⏱️ 1 semana

**Objetivo:** Primeiro cloud provider funcional

**Tarefas:**
1. Implementar `OneDriveStorageProvider`
2. Auto-detecção de pasta OneDrive (Windows/macOS)
3. Validação de disponibilidade
4. Migração de dados
5. Testes em Windows e macOS
6. Documentação de uso

**Entregável:** Usuários podem configurar OneDrive como storage

### Fase 3: Google Drive e Dropbox ⏱️ 2 semanas

**Objetivo:** Suporte a mais cloud providers

**Tarefas:**
1. Implementar `GoogleDriveStorageProvider`
2. Implementar `DropboxStorageProvider`
3. Auto-detecção de ambos
4. Testes multi-plataforma
5. Documentação

**Entregável:** Suporte completo a OneDrive, Google Drive e Dropbox

### Fase 4: iCloud Drive (Opcional) ⏱️ 3 dias

**Objetivo:** Suporte específico para macOS

**Tarefas:**
1. Implementar `ICloudStorageProvider`
2. Verificação de plataforma macOS
3. Testes em diferentes versões do macOS
4. Documentação

**Entregável:** Usuários macOS podem usar iCloud

### Fase 5: Extensão VS Code (MVP) ⏱️ 3-4 semanas

**Objetivo:** Interface gráfica básica funcional

**Tarefas:**
1. Setup projeto da extensão
2. Implementar cliente MCP
3. TreeView de prompts
4. Comandos básicos (add, edit, delete)
5. Formulário de criação
6. Testes
7. Publicar na marketplace

**Entregável:** Extensão VS Code publicada

### Fase 6: Extensão VS Code (Completo) ⏱️ 2 semanas

**Objetivo:** Features avançadas

**Tarefas:**
1. Sistema de snippets
2. Painel de detalhes
3. Integração com storage configurável
4. Status bar e configurações
5. Ícones e UX polish
6. Documentação completa

**Entregável:** Extensão feature-complete

---

## 🎯 Priorização

### Must Have (MVP)

1. ✅ Sistema de Storage Configurável
2. ✅ OneDrive Storage
3. ✅ Extensão VS Code (MVP)

### Should Have

4. Google Drive Storage
5. Dropbox Storage
6. Extensão VS Code (features avançadas)

### Nice to Have

7. iCloud Drive Storage
8. Sync status e resolução de conflitos
9. Exportação para outros formatos

---

## 💡 Considerações Técnicas

### Performance

**Armazenamento Local:**
* Leitura/escrita síncronas do JSON
* Performance adequada até ~1000 prompts

**Cloud Storage:**
* Mesma performance (lê/escreve localmente)
* Sincronização delegada ao cliente desktop
* Sem impacto na latência

### Segurança

**Dados em Trânsito:**
* Sincronização gerenciada pelos clientes oficiais
* Usa HTTPS nativo de cada serviço
* Sem necessidade de implementar criptografia adicional

**Dados em Repouso:**
* Arquivo JSON não criptografado
* Criptografia pode ser habilitada no lado do cloud provider
* Para dados sensíveis, usuário deve usar cloud storage com criptografia

### Compatibilidade

**Plataformas:**
* ✅ Windows: OneDrive, Google Drive, Dropbox
* ✅ macOS: OneDrive, Google Drive, Dropbox, iCloud
* ✅ Linux: Google Drive, Dropbox

**VS Code:**
* Mínimo: VS Code 1.85.0
* Funciona em todas as plataformas do VS Code

---

## 📖 Referências

**Features Relacionadas:**
* Sistema de Storage Configurável: `feat-1767582626415-pspldzoep`
* OneDrive Storage: `feat-1767582626411-mfqsr8lw9`
* Google Drive Storage: `feat-1767582626414-zshotlrpa`
* Dropbox Storage: `feat-1767582626414-3orkkasc2`
* iCloud Storage: `feat-1767582626423-ywxfcrgag`
* Extensão VS Code: `feat-1767582626391-lzmj2mlnd`

**ADRs:**
* ADR-001: Armazenamento em JSON File vs Database
* ADR-002: Storage via Pastas Sincronizadas vs API Direta

**Contratos:**
* `StorageProvider` - Interface base para providers
* `StorageConfig` - Configuração de storage

## Referências

* Features: feat-1767582626391-lzmj2mlnd, feat-1767582626411-mfqsr8lw9, feat-1767582626414-zshotlrpa, feat-1767582626414-3orkkasc2, feat-1767582626415-pspldzoep, feat-1767582626423-ywxfcrgag

---
*Documento gerado automaticamente pelo MCP*
