# Guia de Uso do MCP AI Prompts

## Resumo

Guia completo para usu\u00e1rios do MCP AI Prompts Management, com instru\u00e7\u00f5es de instala\u00e7\u00e3o, configura\u00e7\u00e3o e exemplos pr\u00e1ticos de uso

## Contexto

* **Contexto**: general
* **Tipo**: guide
* **Tópicos**: setup, usage, examples, vscode

## Conteúdo

### Introdução

O **MCP AI Prompts Management** permite que você organize e acesse rapidamente seus prompts de AI favoritos diretamente no VS Code ou Claude Desktop através do protocolo MCP.

#### O que você pode fazer:

* 📝 Salvar seus prompts favoritos com descrição e categorização
* 🔍 Buscar prompts por nome, categoria ou tags
* 🏷️ Organizar com categorias e múltiplas tags
* ⚡ Acessar rapidamente o conteúdo completo de qualquer prompt
* ✏️ Editar e atualizar prompts existentes
* 🗑️ Remover prompts que não usa mais

### Instalação

#### 1. Clonar ou Baixar o Projeto

```bash
cd ~/workspace/AI
git clone [url-do-repositorio] mcp-ai-prompts-managenment
cd mcp-ai-prompts-managenment
```

#### 2. Instalar Dependências

```bash
npm install
```

#### 3. Compilar o Projeto

```bash
npm run build
```

Isso criará a pasta `dist/` com o código compilado.

### Configuração

#### VS Code

1. Abra as configurações do VS Code (`settings.json`)
2. Adicione a configuração do MCP:

```json
{
  "mcp.servers": {
    "ai-prompts": {
      "command": "node",
      "args": [
        "/Users/SEU_USUARIO/workspace/AI/mcp-ai-prompts-managenment/dist/index.js"
      ]
    }
  }
}
```

⚠️ **Importante:** Substitua `/Users/SEU_USUARIO` pelo caminho absoluto correto!

#### Claude Desktop

1. Localize o arquivo de configuração:
   - macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`

   - Windows: `%APPDATA%\Claude\claude_desktop_config.json`

2. Adicione ou edite o arquivo:

```json
{
  "mcpServers": {
    "ai-prompts": {
      "command": "node",
      "args": [
        "/Users/SEU_USUARIO/workspace/AI/mcp-ai-prompts-managenment/dist/index.js"
      ]
    }
  }
}
```

3. Reinicie o Claude Desktop

### Primeiros Passos

#### 1. Adicionar Seu Primeiro Prompt

No VS Code ou Claude, peça ao assistente:

```
Adicione um novo prompt:
- Nome: Code Review Expert
- Categoria: development
- Tags: code-review, quality, best-practices
- Descrição: Prompt para revisar código com foco em qualidade
- Conteúdo: Você é um revisor de código experiente. Analise o código fornecido e forneça feedback sobre qualidade, bugs, performance e segurança.
```

**Resposta esperada:**

```
✅ Prompt "Code Review Expert" adicionado com sucesso!

ID: prompt_1704334567890_a1ney73nj
Categoria: development
Tags: code-review, quality, best-practices
```

#### 2. Listar Seus Prompts

```
Liste todos os meus prompts
```

ou com filtros:

```
Liste prompts da categoria development
Liste prompts com a tag code-review
```

#### 3. Usar Um Prompt

```
Me mostre o prompt "Code Review Expert"
```

ou

```
Quero usar o prompt de code review
```

O assistente retornará o conteúdo completo do prompt pronto para usar!

### Exemplos de Uso

#### Cenário 1: Organizando Prompts por Projeto

**Categorias sugeridas:**
* `development` - Prompts para desenvolvimento
* `writing` - Prompts para escrita
* `analysis` - Prompts para análise
* `creative` - Prompts criativos
* `business` - Prompts de negócios

**Exemplo:**

```
Adicione um prompt:
- Nome: API Documentation Generator
- Categoria: development
- Tags: documentation, api, openapi
- Descrição: Gera documentação OpenAPI completa
- Conteúdo: [seu prompt aqui]
```

#### Cenário 2: Encontrando o Prompt Certo

**Busca por categoria:**

```
Liste todos os prompts de development
```

**Busca por tags:**

```
Liste prompts com as tags documentation e api
```

**Busca textual:**

```
Busque prompts que mencionem "review" no nome ou descrição
```

#### Cenário 3: Mantendo Prompts Atualizados

**Atualizar conteúdo:**

```
Atualize o prompt prompt_1704334567890_a1ney73nj:
- Novo conteúdo: [versão melhorada do prompt]
```

**Adicionar tags:**

```
Atualize o prompt "Code Review Expert":
- Tags: code-review, quality, best-practices, security
```

#### Cenário 4: Importando Prompts de Exemplo

O projeto inclui 6 prompts de exemplo em `examples-prompts.json` :

1. **Code Review Expert** - Revisão de código
2. **Documentador Técnico** - Documentação técnica
3. **Arquiteto de Software** - Design de sistemas
4. **Debugger Expert** - Resolução de bugs
5. **Otimizador de Performance** - Otimização de código
6. **Test Writer** - Criação de testes

Para importá-los, você pode pedir ao assistente para ler o arquivo e adicionar cada um.

### Comandos Rápidos

#### Adicionar Prompt

```
Adicione um prompt chamado "SQL Query Helper" na categoria "database" com tags sql, query, optimization
```

#### Listar Todos

```
Liste todos os meus prompts
```

#### Buscar Específico

```
Me mostre o prompt "SQL Query Helper"
```

#### Atualizar

```
Atualize o prompt [ID] com nova descrição: [texto]
```

#### Deletar

```
Delete o prompt [ID]
```

#### Ver Categorias

```
Quais categorias de prompts eu tenho?
```

#### Ver Tags

```
Liste todas as tags que usei nos prompts
```

### Dicas e Boas Práticas

#### Nomenclatura

✅ **BOM:**
* "Code Review Expert"
* "SQL Query Optimizer"
* "API Documentation Generator"

❌ **EVITE:**
* "Prompt 1"
* "test"
* "aaa"

#### Descrições

✅ **BOM:**

```
Descrição: Analisa queries SQL e sugere otimizações de performance com índices e reescrita
```

❌ **EVITE:**

```
Descrição: SQL
```

#### Categorização

Use categorias consistentes:
* Crie 5-10 categorias principais
* Use nomes em inglês e lowercase
* Evite categorias muito específicas

**Exemplo de sistema de categorias:**

```
development
  ├─ code-review
  ├─ testing
  └─ documentation
  
writing
  ├─ technical
  ├─ creative
  └─ business

analysis
  ├─ data
  ├─ code
  └─ business
```

#### Tags

* Use 2-5 tags por prompt
* Tags devem ser específicas
* Combine tags gerais com específicas
* Use lowercase e hífens

**Exemplo:**

```
Tags: code-review, security, owasp, vulnerability-detection
      ↑ geral      ↑ específicas
```

#### Conteúdo do Prompt

* Escreva instruções claras e específicas
* Use formatação Markdown quando apropriado
* Inclua exemplos no prompt quando útil
* Mantenha prompts focados (uma tarefa principal)

### Backup e Migração

#### Fazer Backup

Seus prompts estão em `prompts-data.json` :

```bash
# Copiar para backup
cp prompts-data.json prompts-backup-$(date +%Y%m%d).json

# Ou commitar no git
git add prompts-data.json
git commit -m "backup: prompts $(date +%Y-%m-%d)"
```

#### Restaurar Backup

```bash
cp prompts-backup-20260104.json prompts-data.json
```

#### Migrar para Outro Computador

1. Copie o arquivo `prompts-data.json`
2. Cole no diretório do projeto no outro computador
3. Pronto! Todos os prompts estarão disponíveis

#### Compartilhar Prompts com Equipe

```bash
# Exportar prompts específicos
cat prompts-data.json | jq '.prompts[] | select(.category=="development")' > team-prompts.json

# Equipe pode importar manualmente via "add_prompt"
```

### Troubleshooting

#### Servidor não aparece no VS Code

1. Verifique o caminho absoluto em `settings.json`
2. Certifique-se que rodou `npm run build`
3. Verifique que `dist/index.js` existe
4. Reinicie o VS Code

#### Erro "Prompt não encontrado"

* Verifique o ID correto com `list_prompts`
* Use o nome exato (case-sensitive)

#### Arquivo prompts-data.json corrompido

```bash
# Verificar JSON válido
cat prompts-data.json | jq '.'

# Se corrompido, restaurar do backup
cp prompts-backup-*.json prompts-data.json

# Ou começar do zero
echo '{"prompts":[]}' > prompts-data.json
```

#### Performance lenta

Se você tem >500 prompts:
* Considere mover prompts antigos para arquivo de arquivo
* Use filtros específicos nas buscas
* Considere dividir em múltiplas instâncias por projeto

### Perguntas Frequentes

#### Posso ter múltiplos prompts com mesmo nome?

❌ Não. O sistema verifica duplicação de nomes para evitar confusão.

#### Quantos prompts posso ter?

Recomendado: até 1000 prompts. Performance pode degradar após isso.

#### O arquivo é seguro?

O arquivo `prompts-data.json` não é criptografado. Evite salvar informações sensíveis.

#### Posso editar o JSON diretamente?

✅ Sim, mas tome cuidado:
* Sempre faça backup primeiro
* Valide o JSON depois: `cat prompts-data.json | jq '.'`
* Respeite a estrutura esperada

#### Como exportar para outro formato?

Use ferramentas como `jq` :

```bash
# CSV simples
jq -r '.prompts[] | [.name, .category, .description] | @csv' prompts-data.json

# Markdown
jq -r '.prompts[] | "## \(.name)\n\n\(.content)\n"' prompts-data.json > prompts.md
```

### Próximos Passos

Agora que você sabe usar o MCP AI Prompts Management:

1. ✅ Importe os prompts de exemplo
2. ✅ Crie suas próprias categorias
3. ✅ Adicione seus prompts favoritos
4. ✅ Configure backup automático
5. ✅ Explore combinações de filtros

**Dica:** Mantenha um prompt "Meta Prompt" que te ajuda a criar outros prompts! 🎯

## Referências

---
*Documento gerado automaticamente pelo MCP*
