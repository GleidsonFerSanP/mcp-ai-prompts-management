# 📸 Quick Start: Capturing Screenshots & Publishing

## TL; DR - Próximos Passos

Você está **100% pronto** para capturar screenshots e publicar! Siga esta ordem:

### 1️⃣ Prepare o Ambiente (5 min)

```bash
cd /Users/gleidsonfersanp/workspace/AI/mcp-ai-prompts-managenment/vscode-extension
bash prepare-screenshots.sh
```

### 2️⃣ Adicione Prompts de Exemplo (5 min)

Abra VS Code com a extensão instalada e crie 4-5 prompts de exemplo:
* "Code Review Expert" (categoria: Code)
* "Python Debugger" (categoria: Debugging)  
* "Documentation Writer" (categoria: Documentation)
* "Test Case Generator" (categoria: Testing)

### 3️⃣ Capture Screenshots (15-20 min)

**Instale ferramenta (escolha uma):**

```bash
# macOS (Recomendado)
brew install --cask kap

# Ou use nativo
# Cmd+Shift+4 para screenshots
```

**Capture na ordem:**
1. **Sidebar TreeView** - Salvar como: `media/screenshots/1-sidebar-treeview.png`
2. **WebView Editor** - Salvar como: `media/screenshots/2-webview-editor.png`
3. **IntelliSense** - Salvar como: `media/screenshots/3-intellisense-completion.png`
4. **Storage Config** (opcional) - Salvar como: `media/screenshots/4-status-bar-storage.png`

**Capture GIF (Hero - 30s):**
* **Quick Demo** - Salvar como: `media/demos/demo-quick-start.gif`
  + Abrir sidebar → Add Prompt → Preencher → Salvar → Usar IntelliSense

### 4️⃣ Publique (10 min)

```bash
cd /Users/gleidsonfersanp/workspace/AI/mcp-ai-prompts-managenment/vscode-extension

# Publicar (script automatizado)
bash publish.sh

# Ou manual:
# vsce login gleidsonfersanp
# vsce publish
```

---

## 📚 Guias Completos

* **[SCREENSHOTS_GUIDE.md](SCREENSHOTS_GUIDE.md)** - Guia detalhado de capturas
* **[PUBLISHING.md](PUBLISHING.md)** - Passo a passo de publicação
* **[CHANGELOG.md](CHANGELOG.md)** - Histórico de versões

## ✅ Checklist

* [x] Extensão completa e testada
* [x] VSIX gerado (mcp-ai-prompts-1.0.0.vsix)
* [x] Documentação completa
* [x] Scripts de publicação criados
* [x] Estrutura de mídia criada
* [ ] Screenshots capturados (3-5 imagens PNG)
* [ ] GIF de demo capturado (1 arquivo GIF)
* [ ] Personal Access Token do Azure DevOps criado
* [ ] Extensão publicada no marketplace

## 🎯 Comandos Rápidos

```bash
# Preparar ambiente
bash prepare-screenshots.sh

# Validar extensão
vsce ls

# Login no marketplace
vsce login GleidsonFerSanP

# Publicar
bash publish.sh

# OU publicar manualmente
vsce publish
```

## 🔗 Links Úteis

* **Azure DevOps PAT**: https://dev.azure.com → Settings → Personal access tokens
* **Marketplace Dashboard**: https://marketplace.visualstudio.com/manage/publishers/GleidsonFerSanP
* **Ferramenta de Captura (Kap)**: https://getkap.co
* **GitHub Repo**: https://github.com/GleidsonFerSanP/mcp-ai-prompts-management

---

**Boa sorte com as capturas e publicação! 🚀**

Qualquer dúvida, consulte os guias completos acima.
