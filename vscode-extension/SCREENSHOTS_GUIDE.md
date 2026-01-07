# 📸 Screenshots & GIFs Guide

Este guia ajuda você a criar screenshots e GIFs de alta qualidade para o VS Code Marketplace.

## 🎯 Screenshots Necessários

### 1. **Sidebar TreeView** (Obrigatório)
- **Nome**: `1-sidebar-treeview.png`
- **Tamanho**: 1280x720px (mínimo)
- **Conteúdo**: 
  - Sidebar aberta mostrando "AI Prompts"
  - Categorias expandidas com prompts
  - Ícones coloridos visíveis
  - Ações inline (copy, insert) visíveis

**Como capturar:**
1. Abra VS Code com a extensão instalada
2. Abra sidebar "AI Prompts"
3. Expanda 2-3 categorias
4. Hover sobre um prompt para mostrar ações
5. Captura: `Cmd+Shift+4` (macOS) ou `Win+Shift+S` (Windows)

---

### 2. **WebView Editor** (Obrigatório)
- **Nome**: `2-webview-editor.png`
- **Tamanho**: 1280x720px (mínimo)
- **Conteúdo**:
  - WebView aberto com um prompt
  - Metadata panel visível (ID, datas, categoria, tags)
  - Form fields preenchidos
  - Botões de ação (Copy, Insert, Save)

**Como capturar:**
1. Clique em "Add New Prompt" ou edite um existente
2. Preencha todos os campos
3. Scroll para mostrar metadata (se editando)
4. Captura da janela completa

---

### 3. **IntelliSense Completion** (Obrigatório)
- **Nome**: `3-intellisense-completion.png`
- **Tamanho**: 800x600px
- **Conteúdo**:
  - Editor com código
  - Autocomplete aberto mostrando "prompt-"
  - Lista de sugestões com ícones
  - Preview de um prompt

**Como capturar:**
1. Abra qualquer arquivo (TypeScript, JavaScript, etc)
2. Digite "prompt-"
3. Aguarde autocomplete aparecer
4. Captura focada na área de completion

---

### 4. **Status Bar & Storage Config** (Recomendado)
- **Nome**: `4-status-bar-storage.png`
- **Tamanho**: 1280x720px
- **Conteúdo**:
  - Status bar mostrando provider atual
  - Quick Pick aberto com lista de providers
  - Providers com ícones (Local, OneDrive, Google Drive, Dropbox)

**Como capturar:**
1. Clique no status bar item (canto inferior direito)
2. Quick Pick abrirá com opções
3. Captura da tela completa

---

### 5. **Command Palette** (Recomendado)
- **Nome**: `5-command-palette.png`
- **Tamanho**: 1280x720px
- **Conteúdo**:
  - Command Palette aberto (Cmd+Shift+P)
  - Digite "AI Prompts"
  - Lista de comandos visível

**Como capturar:**
1. Abra Command Palette (Cmd+Shift+P)
2. Digite "AI Prompts"
3. Captura da tela completa

---

## 🎬 GIFs/Vídeos Necessários

### 1. **Quick Demo (30s)** - Hero GIF
- **Nome**: `demo-quick-start.gif`
- **Duração**: 20-30 segundos
- **FPS**: 10-15 fps
- **Tamanho**: Max 5MB
- **Roteiro**:
  1. Abrir sidebar (2s)
  2. Clicar em "Add Prompt" (1s)
  3. Preencher form rapidamente (5s)
  4. Salvar (1s)
  5. Mostrar prompt na tree (2s)
  6. Usar IntelliSense para inserir (5s)
  7. Zoom no resultado (3s)

---

### 2. **IntelliSense Demo**
- **Nome**: `demo-intellisense.gif`
- **Duração**: 10-15 segundos
- **Roteiro**:
  1. Abrir editor vazio
  2. Digitar "prompt-" lentamente
  3. Mostrar autocomplete
  4. Selecionar um prompt
  5. Mostrar conteúdo inserido

---

### 3. **Storage Configuration Demo**
- **Nome**: `demo-storage-config.gif`
- **Duração**: 10-15 segundos
- **Roteiro**:
  1. Clicar no status bar
  2. Mostrar lista de providers
  3. Selecionar um provider
  4. Mostrar confirmação
  5. Status bar atualizado

---

## 🛠️ Ferramentas Recomendadas

### Para Screenshots
- **macOS**: 
  - `Cmd+Shift+4` (nativo)
  - [CleanShot X](https://cleanshot.com/) (melhor opção)
  
- **Windows**: 
  - `Win+Shift+S` (nativo)
  - [ShareX](https://getsharex.com/) (gratuito)
  
- **Linux**: 
  - `gnome-screenshot`
  - [Flameshot](https://flameshot.org/)

### Para GIFs
- **Todas as plataformas**:
  - [ScreenToGif](https://www.screentogif.com/) (Windows/Linux)
  - [Kap](https://getkap.co/) (macOS - Recomendado)
  - [Gifox](https://gifox.app/) (macOS - Premium)
  - [LICEcap](https://www.cockos.com/licecap/) (Gratuito, multiplataforma)

### Otimização de GIFs
- [ezgif.com](https://ezgif.com/optimize) - Otimizador online
- [gifsicle](https://www.lcdf.org/gifsicle/) - CLI para otimizar

## 📐 Especificações Técnicas

### Screenshots
- **Formato**: PNG
- **Resolução mínima**: 1280x720px
- **Resolução recomendada**: 1920x1080px
- **DPI**: 72-144 dpi
- **Tamanho máximo**: 5MB cada

### GIFs
- **Formato**: GIF
- **FPS**: 10-15 fps (não mais)
- **Resolução**: 800x600px a 1280x720px
- **Tamanho máximo**: 5MB
- **Duração**: 10-30 segundos

### Dicas de Qualidade
1. **Tema**: Use tema escuro (Dark+) ou claro (Light+)
2. **Zoom**: 125-150% para melhor legibilidade
3. **Conteúdo**: Use exemplos realistas e bem formatados
4. **Cursor**: Mostrar cursor em GIFs para guiar o olhar
5. **Timing**: Não muito rápido, deixe tempo para ler

## 🎨 Preparação do Ambiente

### Antes de Capturar

1. **Limpe seu VS Code**:
   ```
   - Feche abas desnecessárias
   - Desabilite outras extensões temporariamente
   - Use workspace limpo
   ```

2. **Configure o Tema**:
   ```
   Dark+ ou Light+ (temas padrão do VS Code)
   ```

3. **Prepare Exemplos**:
   ```typescript
   // Crie prompts de exemplo interessantes:
   - "Code Review Expert"
   - "Python Debugger"
   - "Documentation Writer"
   - "Test Case Generator"
   ```

4. **Ajuste Zoom**:
   ```
   Cmd+= ou Cmd+- para ajustar
   Recomendado: 125-150%
   ```

## 📋 Checklist de Captura

- [ ] Screenshot 1: Sidebar TreeView
- [ ] Screenshot 2: WebView Editor
- [ ] Screenshot 3: IntelliSense Completion
- [ ] Screenshot 4: Status Bar & Storage Config
- [ ] Screenshot 5: Command Palette
- [ ] GIF 1: Quick Demo (Hero)
- [ ] GIF 2: IntelliSense Demo
- [ ] GIF 3: Storage Configuration Demo
- [ ] Otimizar todos os GIFs (< 5MB)
- [ ] Testar visualização no README
- [ ] Renomear arquivos conforme convenção

## 🚀 Após Captura

1. **Coloque os arquivos em**:
   ```
   vscode-extension/media/screenshots/
   vscode-extension/media/demos/
   ```

2. **Atualize o README** com os paths corretos

3. **Atualize package.json**:
   ```json
   {
     "galleryBanner": {
       "color": "#1e1e1e",
       "theme": "dark"
     }
   }
   ```

4. **Teste localmente**:
   ```bash
   npm run package
   # Instale e verifique se imagens aparecem
   ```

## 💡 Exemplos de Bons Screenshots

Busque inspiração em extensões populares:
- [GitHub Copilot](https://marketplace.visualstudio.com/items?itemName=GitHub.copilot)
- [GitLens](https://marketplace.visualstudio.com/items?itemName=eamodio.gitlens)
- [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

---

**Boa sorte com as capturas! 📸**
