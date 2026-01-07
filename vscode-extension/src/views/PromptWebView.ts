import * as vscode from 'vscode';
import { MCPClient } from '../mcpClient.js';

export interface Prompt {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  description?: string;
  createdAt: string;
  updatedAt?: string;
}

/**
 * Manages the WebView panel for viewing and editing prompts
 */
export class PromptWebView {
  private panel: vscode.WebviewPanel | undefined;
  private currentPrompt: Prompt | undefined;

  constructor(
    private readonly extensionUri: vscode.Uri,
    private readonly mcpClient: MCPClient
  ) {}

  /**
   * Shows the WebView with a specific prompt
   */
  public async show(prompt: Prompt): Promise<void> {
    this.currentPrompt = prompt;

    if (this.panel) {
      // If panel exists, update content and reveal
      this.panel.webview.html = this.getHtmlContent(prompt);
      this.panel.reveal(vscode.ViewColumn.One);
    } else {
      // Create new panel
      this.panel = vscode.window.createWebviewPanel(
        'promptDetails',
        `Prompt: ${prompt.title}`,
        vscode.ViewColumn.One,
        {
          enableScripts: true,
          retainContextWhenHidden: true,
          localResourceRoots: [this.extensionUri]
        }
      );

      this.panel.webview.html = this.getHtmlContent(prompt);

      // Handle messages from WebView
      this.panel.webview.onDidReceiveMessage(
        async message => {
          switch (message.command) {
            case 'save':
              await this.savePrompt(message.prompt);
              break;
            case 'copy':
              await vscode.env.clipboard.writeText(message.content);
              vscode.window.showInformationMessage('Prompt copied to clipboard!');
              break;
            case 'insert':
              this.insertAtCursor(message.content);
              break;
          }
        }
      );

      // Handle panel disposal
      this.panel.onDidDispose(() => {
        this.panel = undefined;
        this.currentPrompt = undefined;
      });
    }
  }

  /**
   * Creates a new prompt via WebView
   */
  public async createNew(): Promise<void> {
    const newPrompt: Prompt = {
      id: '',
      title: 'New Prompt',
      content: '',
      category: 'General',
      tags: [],
      description: '',
      createdAt: new Date().toISOString()
    };

    this.show(newPrompt);
  }

  /**
   * Saves the prompt using MCP client
   */
  private async savePrompt(prompt: Prompt): Promise<void> {
    try {
      if (prompt.id) {
        // Update existing prompt
        await this.mcpClient.updatePrompt(prompt.id, {
          name: prompt.title,
          content: prompt.content,
          category: prompt.category,
          tags: prompt.tags,
          description: prompt.description
        });
        vscode.window.showInformationMessage('Prompt updated successfully!');
      } else {
        // Add new prompt
        const result = await this.mcpClient.addPrompt(
          prompt.title,
          prompt.description || '',
          prompt.category,
          prompt.tags,
          prompt.content
        );
        prompt.id = result.id;
        vscode.window.showInformationMessage('Prompt created successfully!');
      }

      this.currentPrompt = prompt;
      
      // Update panel title
      if (this.panel) {
        this.panel.title = `Prompt: ${prompt.title}`;
      }
    } catch (error) {
      vscode.window.showErrorMessage(`Failed to save prompt: ${error}`);
    }
  }

  /**
   * Inserts prompt content at the cursor position
   */
  private insertAtCursor(content: string): void {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
      editor.edit(editBuilder => {
        editBuilder.insert(editor.selection.active, content);
      });
      vscode.window.showInformationMessage('Prompt inserted!');
    } else {
      vscode.window.showWarningMessage('No active editor to insert prompt');
    }
  }

  /**
   * Generates the HTML content for the WebView
   */
  private getHtmlContent(prompt: Prompt): string {
    const isNewPrompt = !prompt.id;

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Prompt Details</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: var(--vscode-font-family);
      font-size: var(--vscode-font-size);
      color: var(--vscode-foreground);
      background-color: var(--vscode-editor-background);
      padding: 20px;
    }

    .container {
      max-width: 1000px;
      margin: 0 auto;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      padding-bottom: 15px;
      border-bottom: 1px solid var(--vscode-panel-border);
    }

    h1 {
      font-size: 24px;
      font-weight: 600;
    }

    .metadata {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
      padding: 15px;
      background-color: var(--vscode-editor-inactiveSelectionBackground);
      border-radius: 6px;
      margin-bottom: 20px;
    }

    .metadata-item {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }

    .metadata-label {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--vscode-descriptionForeground);
      font-weight: 600;
    }

    .metadata-value {
      font-size: 13px;
      color: var(--vscode-foreground);
    }

    .badge {
      display: inline-block;
      padding: 3px 8px;
      border-radius: 3px;
      font-size: 11px;
      background-color: var(--vscode-badge-background);
      color: var(--vscode-badge-foreground);
      margin-right: 5px;
    }

    .actions {
      display: flex;
      gap: 10px;
    }

    button {
      padding: 8px 16px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 13px;
      font-weight: 500;
      transition: opacity 0.2s;
    }

    button:hover {
      opacity: 0.8;
    }

    .btn-primary {
      background-color: var(--vscode-button-background);
      color: var(--vscode-button-foreground);
    }

    .btn-secondary {
      background-color: var(--vscode-button-secondaryBackground);
      color: var(--vscode-button-secondaryForeground);
    }

    .form-group {
      margin-bottom: 20px;
    }

    label {
      display: block;
      margin-bottom: 8px;
      font-weight: 500;
      color: var(--vscode-foreground);
    }

    input[type="text"],
    textarea,
    select {
      width: 100%;
      padding: 10px;
      border: 1px solid var(--vscode-input-border);
      background-color: var(--vscode-input-background);
      color: var(--vscode-input-foreground);
      border-radius: 4px;
      font-family: inherit;
      font-size: inherit;
    }

    textarea {
      min-height: 200px;
      resize: vertical;
      font-family: var(--vscode-editor-font-family);
    }

    input:focus,
    textarea:focus,
    select:focus {
      outline: 1px solid var(--vscode-focusBorder);
    }

    .tags-input-container {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      padding: 8px;
      border: 1px solid var(--vscode-input-border);
      background-color: var(--vscode-input-background);
      border-radius: 4px;
      min-height: 42px;
    }

    .tag {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 10px;
      background-color: var(--vscode-badge-background);
      color: var(--vscode-badge-foreground);
      border-radius: 12px;
      font-size: 12px;
    }

    .tag-remove {
      cursor: pointer;
      font-weight: bold;
    }

    .tag-input {
      flex: 1;
      min-width: 120px;
      border: none;
      background: transparent;
      color: var(--vscode-input-foreground);
      outline: none;
    }

    .metadata {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
      margin-top: 20px;
      padding: 15px;
      background-color: var(--vscode-editor-inactiveSelectionBackground);
      border-radius: 4px;
    }

    .metadata-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .metadata-label {
      font-size: 11px;
      text-transform: uppercase;
      color: var(--vscode-descriptionForeground);
      letter-spacing: 0.5px;
    }

    .metadata-value {
      font-size: 13px;
      font-weight: 500;
    }

    .preview {
      margin-top: 30px;
      padding: 20px;
      border: 1px solid var(--vscode-panel-border);
      border-radius: 4px;
      background-color: var(--vscode-editor-background);
    }

    .preview h2 {
      font-size: 16px;
      margin-bottom: 15px;
      color: var(--vscode-foreground);
    }

    .preview-content {
      white-space: pre-wrap;
      font-family: var(--vscode-editor-font-family);
      line-height: 1.6;
      padding: 15px;
      background-color: var(--vscode-textCodeBlock-background);
      border-radius: 4px;
      max-height: 400px;
      overflow-y: auto;
    }

    .char-count {
      font-size: 12px;
      color: var(--vscode-descriptionForeground);
      text-align: right;
      margin-top: 5px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${isNewPrompt ? 'Create New Prompt' : 'Edit Prompt'}</h1>
      <div class="actions">
        <button class="btn-secondary" onclick="copyPrompt()">📋 Copy</button>
        <button class="btn-secondary" onclick="insertPrompt()">➕ Insert</button>
        <button class="btn-primary" onclick="savePrompt()">💾 Save</button>
      </div>
    </div>

    ${!isNewPrompt ? `
    <div class="metadata">
      <div class="metadata-item">
        <span class="metadata-label">ID</span>
        <span class="metadata-value">${this.escapeHtml(prompt.id)}</span>
      </div>
      <div class="metadata-item">
        <span class="metadata-label">Created</span>
        <span class="metadata-value">${new Date(prompt.createdAt).toLocaleDateString()}</span>
      </div>
      ${prompt.updatedAt ? `
      <div class="metadata-item">
        <span class="metadata-label">Last Updated</span>
        <span class="metadata-value">${new Date(prompt.updatedAt).toLocaleDateString()}</span>
      </div>
      ` : ''}
      <div class="metadata-item">
        <span class="metadata-label">Category</span>
        <span class="metadata-value"><span class="badge">${this.escapeHtml(prompt.category)}</span></span>
      </div>
      <div class="metadata-item">
        <span class="metadata-label">Tags</span>
        <span class="metadata-value">
          ${prompt.tags.length > 0 
            ? prompt.tags.map(tag => `<span class="badge">${this.escapeHtml(tag)}</span>`).join('') 
            : '<span style="color: var(--vscode-descriptionForeground);">No tags</span>'}
        </span>
      </div>
    </div>
    ` : ''}

    <form id="promptForm">
      <div class="form-group">
        <label for="title">Title *</label>
        <input 
          type="text" 
          id="title" 
          value="${this.escapeHtml(prompt.title)}" 
          required
          placeholder="Enter prompt title..."
        />
      </div>

      <div class="form-group">
        <label for="category">Category *</label>
        <input 
          type="text" 
          id="category" 
          value="${this.escapeHtml(prompt.category)}" 
          required
          placeholder="e.g., Code, Writing, Analysis..."
          list="categories"
        />
        <datalist id="categories">
          <option value="Code">
          <option value="Writing">
          <option value="Analysis">
          <option value="Debugging">
          <option value="Documentation">
          <option value="Testing">
          <option value="General">
        </datalist>
      </div>

      <div class="form-group">
        <label for="description">Description</label>
        <input 
          type="text" 
          id="description" 
          value="${this.escapeHtml(prompt.description || '')}"
          placeholder="Brief description of what this prompt does..."
        />
      </div>

      <div class="form-group">
        <label for="tags">Tags</label>
        <div class="tags-input-container" id="tagsContainer">
          ${prompt.tags.map(tag => `
            <span class="tag">
              ${this.escapeHtml(tag)}
              <span class="tag-remove" onclick="removeTag('${this.escapeHtml(tag)}')">×</span>
            </span>
          `).join('')}
          <input 
            type="text" 
            class="tag-input" 
            id="tagInput"
            placeholder="Add tag and press Enter..."
            onkeydown="handleTagInput(event)"
          />
        </div>
      </div>

      <div class="form-group">
        <label for="content">Content *</label>
        <textarea 
          id="content" 
          required
          placeholder="Enter your prompt content here..."
          oninput="updatePreview(); updateCharCount()"
        >${this.escapeHtml(prompt.content)}</textarea>
        <div class="char-count" id="charCount"></div>
      </div>
    </form>

    ${!isNewPrompt ? `
      <div class="metadata">
        <div class="metadata-item">
          <span class="metadata-label">Prompt ID</span>
          <span class="metadata-value">${this.escapeHtml(prompt.id)}</span>
        </div>
        <div class="metadata-item">
          <span class="metadata-label">Created</span>
          <span class="metadata-value">${new Date(prompt.createdAt).toLocaleString()}</span>
        </div>
        ${prompt.updatedAt ? `
          <div class="metadata-item">
            <span class="metadata-label">Last Updated</span>
            <span class="metadata-value">${new Date(prompt.updatedAt).toLocaleString()}</span>
          </div>
        ` : ''}
      </div>
    ` : ''}

    <div class="preview">
      <h2>📄 Preview</h2>
      <div class="preview-content" id="preview">${this.escapeHtml(prompt.content)}</div>
    </div>
  </div>

  <script>
    const vscode = acquireVsCodeApi();
    let currentTags = ${JSON.stringify(prompt.tags)};

    function savePrompt() {
      const title = document.getElementById('title').value.trim();
      const category = document.getElementById('category').value.trim();
      const description = document.getElementById('description').value.trim();
      const content = document.getElementById('content').value.trim();

      if (!title || !category || !content) {
        alert('Please fill in all required fields');
        return;
      }

      const prompt = {
        id: '${prompt.id}',
        title,
        category,
        description,
        content,
        tags: currentTags,
        createdAt: '${prompt.createdAt}',
        updatedAt: new Date().toISOString()
      };

      vscode.postMessage({
        command: 'save',
        prompt
      });
    }

    function copyPrompt() {
      const content = document.getElementById('content').value;
      vscode.postMessage({
        command: 'copy',
        content
      });
    }

    function insertPrompt() {
      const content = document.getElementById('content').value;
      vscode.postMessage({
        command: 'insert',
        content
      });
    }

    function updatePreview() {
      const content = document.getElementById('content').value;
      document.getElementById('preview').textContent = content;
    }

    function updateCharCount() {
      const content = document.getElementById('content').value;
      const charCount = content.length;
      const wordCount = content.trim() ? content.trim().split(/\\s+/).length : 0;
      document.getElementById('charCount').textContent = 
        \`\${charCount} characters, \${wordCount} words\`;
    }

    function handleTagInput(event) {
      if (event.key === 'Enter') {
        event.preventDefault();
        const input = event.target;
        const tag = input.value.trim();
        
        if (tag && !currentTags.includes(tag)) {
          currentTags.push(tag);
          addTagElement(tag);
          input.value = '';
        }
      }
    }

    function addTagElement(tag) {
      const tagSpan = document.createElement('span');
      tagSpan.className = 'tag';
      tagSpan.innerHTML = \`
        \${escapeHtml(tag)}
        <span class="tag-remove" onclick="removeTag('\${escapeHtml(tag)}')">×</span>
      \`;
      
      const input = document.getElementById('tagInput');
      input.parentElement.insertBefore(tagSpan, input);
    }

    function removeTag(tag) {
      currentTags = currentTags.filter(t => t !== tag);
      updateTagsDisplay();
    }

    function updateTagsDisplay() {
      const container = document.getElementById('tagsContainer');
      const input = document.getElementById('tagInput');
      container.innerHTML = '';
      
      currentTags.forEach(tag => {
        const tagSpan = document.createElement('span');
        tagSpan.className = 'tag';
        tagSpan.innerHTML = \`
          \${escapeHtml(tag)}
          <span class="tag-remove" onclick="removeTag('\${escapeHtml(tag)}')">×</span>
        \`;
        container.appendChild(tagSpan);
      });
      
      container.appendChild(input);
    }

    function escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }

    // Initialize
    updatePreview();
    updateCharCount();
  </script>
</body>
</html>`;
  }

  /**
   * Escapes HTML special characters
   */
  private escapeHtml(text: string): string {
    const map: { [key: string]: string } = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
  }

  /**
   * Disposes the WebView panel
   */
  public dispose(): void {
    if (this.panel) {
      this.panel.dispose();
      this.panel = undefined;
    }
  }
}
