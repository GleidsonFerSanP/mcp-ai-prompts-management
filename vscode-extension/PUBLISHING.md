# 🚀 Publishing to VS Code Marketplace

Guia completo para publicar a extensão MCP AI Prompts no VS Code Marketplace.

## 📋 Pré-requisitos

✅ Você já tem:
- [x] Conta de publisher no VS Code Marketplace
- [x] Extensão completa e testada
- [x] VSIX gerado (mcp-ai-prompts-1.0.0.vsix)

⏳ Ainda precisa:
- [ ] Screenshots e GIFs (ver SCREENSHOTS_GUIDE.md)
- [ ] Personal Access Token (PAT) do Azure DevOps
- [ ] vsce CLI instalado globalmente

## 🔑 Passo 1: Criar Personal Access Token

1. Acesse: https://dev.azure.com
2. Click no seu perfil (canto superior direito) → **Personal access tokens**
3. Click em **+ New Token**
4. Configure:
   - **Name**: VS Code Marketplace
   - **Organization**: All accessible organizations
   - **Expiration**: 90 days (ou custom)
   - **Scopes**: 
     - ✅ **Marketplace** → **Manage** (marque esta opção)
5. Click **Create**
6. **⚠️ IMPORTANTE**: Copie e salve o token (não poderá ver novamente!)

## 📦 Passo 2: Instalar VSCE CLI

```bash
npm install -g @vscode/vsce
```

## 📸 Passo 3: Adicionar Screenshots

1. **Capture os screenshots** seguindo [SCREENSHOTS_GUIDE.md](SCREENSHOTS_GUIDE.md)

2. **Salve os arquivos em**:
   ```
   vscode-extension/media/screenshots/
   vscode-extension/media/demos/
   ```

3. **Arquivos necessários**:
   ```
   media/
   ├── screenshots/
   │   ├── 1-sidebar-treeview.png       # Obrigatório
   │   ├── 2-webview-editor.png         # Obrigatório  
   │   ├── 3-intellisense-completion.png # Obrigatório
   │   ├── 4-status-bar-storage.png     # Recomendado
   │   └── 5-command-palette.png        # Recomendado
   └── demos/
       ├── demo-quick-start.gif         # Hero GIF
       ├── demo-intellisense.gif        # Feature demo
       └── demo-storage-config.gif      # Feature demo
   ```

4. **Atualize README.md** com os screenshots:
   ```markdown
   ## Demo
   
   ![Sidebar](media/screenshots/1-sidebar-treeview.png)
   ![Editor](media/screenshots/2-webview-editor.png)
   ![IntelliSense](media/screenshots/3-intellisense-completion.png)
   
   ![Quick Start](media/demos/demo-quick-start.gif)
   ```

## ✅ Passo 4: Validar Extensão

```bash
cd vscode-extension

# Validar package.json e arquivos
vsce ls

# Testar localmente
code --install-extension mcp-ai-prompts-1.0.0.vsix
```

## 🚀 Passo 5: Publicar no Marketplace

### Opção A: Publicar via CLI (Recomendado)

```bash
cd vscode-extension

# Login com seu token
vsce login gleidsonfersanp
# Cole seu PAT quando solicitado

# Empacotar e publicar em um comando
vsce publish

# OU, se já tiver o VSIX:
vsce publish --packagePath mcp-ai-prompts-1.0.0.vsix
```

### Opção B: Upload Manual

1. Acesse: https://marketplace.visualstudio.com/manage
2. Click em **+ New extension**
3. Selecione **Visual Studio Code**
4. Upload do arquivo `mcp-ai-prompts-1.0.0.vsix`
5. Preencha as informações adicionais
6. Click em **Upload**

## 📝 Passo 6: Preencher Informações do Marketplace

No portal do marketplace, adicione:

### **Q&A (Perguntas e Respostas)**
- Marque: **Enable Q&A**

### **GitHub Repository**
- URL: `https://github.com/GleidsonFerSanP/mcp-ai-prompts-management`

### **Pricing** (Grátis)
- Marque: **Free**

### **Privacy Policy** (Opcional)
- Adicione URL se tiver

### **Support** (Opcional)
- Email ou link de suporte

## ✨ Passo 7: Otimizar Listagem

### Badge no README

Adicione badges ao README:

```markdown
[![VS Code Marketplace](https://img.shields.io/vscode-marketplace/v/gleidsonfersanp.mcp-ai-prompts.svg)](https://marketplace.visualstudio.com/items?itemName=gleidsonfersanp.mcp-ai-prompts)
[![Installs](https://img.shields.io/vscode-marketplace/i/gleidsonfersanp.mcp-ai-prompts.svg)](https://marketplace.visualstudio.com/items?itemName=gleidsonfersanp.mcp-ai-prompts)
[![Rating](https://img.shields.io/vscode-marketplace/r/gleidsonfersanp.mcp-ai-prompts.svg)](https://marketplace.visualstudio.com/items?itemName=gleidsonfersanp.mcp-ai-prompts)
```

### Categorias e Keywords

No `package.json`, certifique-se que tem:
```json
{
  "categories": [
    "Snippets",
    "Other"
  ],
  "keywords": [
    "ai",
    "prompts",
    "mcp",
    "claude",
    "chatgpt",
    "copilot",
    "snippets",
    "cloud-storage",
    "productivity"
  ]
}
```

## 🔄 Passo 8: Atualizações Futuras

Para publicar uma nova versão:

```bash
cd vscode-extension

# Incrementa versão e publica
vsce publish patch   # 1.0.0 → 1.0.1
vsce publish minor   # 1.0.0 → 1.1.0
vsce publish major   # 1.0.0 → 2.0.0

# OU, manual:
# 1. Atualize version no package.json
# 2. npm run package
# 3. vsce publish
```

## 📊 Passo 9: Monitorar Estatísticas

Acesse para ver métricas:
- **Marketplace Dashboard**: https://marketplace.visualstudio.com/manage/publishers/gleidsonfersanp
- **Estatísticas**: Downloads, ratings, Q&A

## ⚠️ Checklist Final

Antes de publicar, verifique:

- [ ] `package.json` com todas as informações corretas
- [ ] README.md completo com screenshots
- [ ] LICENSE adicionado
- [ ] CHANGELOG.md (opcional mas recomendado)
- [ ] `.vscodeignore` configurado corretamente
- [ ] Screenshots em `media/screenshots/` (mínimo 3)
- [ ] GIF de demo em `media/demos/`
- [ ] Testado localmente via VSIX
- [ ] Repository GitHub atualizado
- [ ] PAT do Azure DevOps criado

## 🐛 Troubleshooting

### Erro: "Personal Access Token verification failed"
- Certifique-se que o PAT tem escopo **Marketplace > Manage**
- Token pode ter expirado, crie um novo

### Erro: "Publisher not found"
- Certifique-se que criou a conta de publisher em: https://marketplace.visualstudio.com/manage

### Erro: "Missing README"
- README.md deve estar na raiz da extensão

### Erro: "Icon not found"
- Remova a propriedade `icon` do package.json se não tiver ícone PNG

### Screenshots não aparecem
- Certifique-se que os paths estão corretos no README
- Use paths relativos: `media/screenshots/file.png`

## 📚 Recursos

- [Publishing Extensions](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)
- [Extension Manifest](https://code.visualstudio.com/api/references/extension-manifest)
- [Extension Marketplace](https://marketplace.visualstudio.com/)
- [Azure DevOps PAT](https://learn.microsoft.com/azure/devops/organizations/accounts/use-personal-access-tokens-to-authenticate)

---

**Boa sorte com a publicação! 🚀**

Se tiver problemas, abra uma issue no GitHub ou entre em contato.
