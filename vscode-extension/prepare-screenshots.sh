#!/bin/bash

# Script para preparar o ambiente VS Code para captura de screenshots
# Execute: bash prepare-screenshots.sh

echo "🎬 Preparando VS Code para captura de screenshots..."

# 1. Cria prompts de exemplo se não existirem
echo ""
echo "📝 Verificando prompts de exemplo..."

# Você pode adicionar prompts via Command Palette ou CLI aqui
# Por enquanto, apenas instruções

cat << 'EOF'

✅ PREPARAÇÃO DO AMBIENTE:

1. 📋 Abra o VS Code
   
2. 🎨 Configure o tema (recomendado Dark+):
   File > Preferences > Color Theme > Dark+ (default dark)

3. 🔍 Ajuste o zoom para 125%:
   Cmd+= (ou Ctrl+=) algumas vezes

4. 🗂️ Abra um workspace limpo:
   - Feche outras abas
   - Esconda terminais (Cmd+J)
   - Esconda outros painéis

5. ➕ Adicione prompts de exemplo:
   Cmd+Shift+P → "AI Prompts: Add New Prompt"
   
   Exemplos sugeridos:
   
   📌 Prompt 1:
   - Title: "Code Review Expert"
   - Category: "Code"
   - Description: "Expert code reviewer focusing on best practices"
   - Tags: code-review, expert, quality
   - Content: "You are an expert code reviewer..."
   
   📌 Prompt 2:
   - Title: "Python Debugger"
   - Category: "Debugging"
   - Description: "Specialized Python debugging assistant"
   - Tags: python, debugging, troubleshooting
   - Content: "You are a Python debugging specialist..."
   
   📌 Prompt 3:
   - Title: "Documentation Writer"
   - Category: "Documentation"
   - Description: "Technical documentation expert"
   - Tags: documentation, writing, technical
   - Content: "You are a technical documentation expert..."
   
   📌 Prompt 4:
   - Title: "Test Case Generator"
   - Category: "Testing"
   - Description: "Generates comprehensive test cases"
   - Tags: testing, unit-tests, quality
   - Content: "You are a test automation specialist..."

6. 🎯 Organize as categorias:
   - Expanda algumas categorias na sidebar
   - Deixe visível 3-4 prompts por categoria

EOF

echo ""
echo "📸 PRÓXIMOS PASSOS:"
echo ""
echo "1. Instale ferramenta de captura:"
echo "   macOS: brew install --cask kap (ou use Cmd+Shift+4)"
echo "   Windows: winget install ScreenToGif"
echo "   Linux: sudo apt install flameshot"
echo ""
echo "2. Siga o guia: vscode-extension/SCREENSHOTS_GUIDE.md"
echo ""
echo "3. Salve screenshots em: vscode-extension/media/screenshots/"
echo "   Salve GIFs em: vscode-extension/media/demos/"
echo ""
echo "✅ Ambiente preparado! Boa captura! 📸"
