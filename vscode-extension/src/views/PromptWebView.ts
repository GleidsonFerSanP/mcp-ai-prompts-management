import * as vscode from 'vscode';
import { MCPClient, Prompt as MCPPrompt } from '../mcpClient';

// Re-export the Prompt type from mcpClient for consistency
export type Prompt = MCPPrompt;

// Extended prompt type for WebView with prompt engineering fields
interface WebViewPrompt {
  id: string;
  title: string;  // Maps to MCP 'name'
  content: string;
  category: string;
  tags: string[];
  description?: string;
  createdAt: string;
  updatedAt?: string;
  // Prompt Engineering Fields
  promptType?: PromptType;
  persona?: string;
  context?: string;
  outputFormat?: string;
  examples?: string;
  constraints?: string;
}

// Prompt engineering types
type PromptType = 
  | 'zero-shot'      // Direct instruction without examples
  | 'few-shot'       // With examples
  | 'chain-of-thought' // Step-by-step reasoning
  | 'react'          // Reasoning + Acting
  | 'tree-of-thought' // Multiple reasoning paths
  | 'custom';        // User-defined structure

const PROMPT_TYPE_INFO: Record<PromptType, { label: string; description: string; template: string }> = {
  'zero-shot': {
    label: 'Zero-Shot',
    description: 'Direct instruction without examples. Best for simple, clear tasks.',
    template: `You are {persona}.

{context}

Task: {task}

{constraints}

Expected Output: {outputFormat}`
  },
  'few-shot': {
    label: 'Few-Shot',
    description: 'Includes examples to guide the model. Best for complex patterns.',
    template: `You are {persona}.

{context}

Here are some examples:

{examples}

Now, complete the following task:
{task}

{constraints}

Expected Output: {outputFormat}`
  },
  'chain-of-thought': {
    label: 'Chain-of-Thought (CoT)',
    description: 'Step-by-step reasoning. Best for logical/mathematical problems.',
    template: `You are {persona}.

{context}

Task: {task}

Think through this step-by-step:
1. First, analyze the problem
2. Break it down into smaller parts
3. Solve each part
4. Combine the results

{constraints}

Expected Output: {outputFormat}`
  },
  'react': {
    label: 'ReAct (Reasoning + Acting)',
    description: 'Interleaves reasoning with actions. Best for tasks requiring tool use.',
    template: `You are {persona}.

{context}

Task: {task}

Use the following format:
Thought: [Your reasoning about what to do next]
Action: [The action to take]
Observation: [The result of the action]
... (repeat Thought/Action/Observation as needed)
Final Answer: [Your final response]

{constraints}

Expected Output: {outputFormat}`
  },
  'tree-of-thought': {
    label: 'Tree-of-Thought (ToT)',
    description: 'Explores multiple reasoning paths. Best for complex problem-solving.',
    template: `You are {persona}.

{context}

Task: {task}

Approach this problem by considering multiple paths:

Path 1: [First approach]
- Step 1: ...
- Step 2: ...
- Evaluation: [Is this path promising?]

Path 2: [Second approach]
- Step 1: ...
- Step 2: ...
- Evaluation: [Is this path promising?]

Path 3: [Third approach]
- Step 1: ...
- Step 2: ...
- Evaluation: [Is this path promising?]

Select the best path and continue to the solution.

{constraints}

Expected Output: {outputFormat}`
  },
  'custom': {
    label: 'Custom',
    description: 'Write your own prompt structure.',
    template: ''
  }
};

function toWebViewPrompt(prompt: Prompt): WebViewPrompt {
  // Parse structured fields from content if they exist
  const parsed = parseStructuredPrompt(prompt.content);
  
  return {
    id: prompt.id,
    title: prompt.name,
    content: prompt.content,
    category: prompt.category,
    tags: prompt.tags,
    description: prompt.description,
    createdAt: prompt.createdAt,
    updatedAt: prompt.updatedAt,
    ...parsed
  };
}

// Parse structured prompt content to extract fields
function parseStructuredPrompt(content: string): Partial<WebViewPrompt> {
  const result: Partial<WebViewPrompt> = {};
  
  // Try to detect prompt type from content patterns
  if (content.includes('Thought:') && content.includes('Action:')) {
    result.promptType = 'react';
  } else if (content.includes('Path 1:') && content.includes('Path 2:')) {
    result.promptType = 'tree-of-thought';
  } else if (content.includes('step-by-step') || content.includes('Step 1:')) {
    result.promptType = 'chain-of-thought';
  } else if (content.includes('Example') || content.includes('example:')) {
    result.promptType = 'few-shot';
  }
  
  // Extract persona if present
  const personaMatch = content.match(/You are ([^.]+)\./);
  if (personaMatch) {
    result.persona = personaMatch[1];
  }
  
  return result;
}

// Generate structured prompt content from fields
function generateStructuredPrompt(prompt: WebViewPrompt): string {
  if (prompt.promptType === 'custom' || !prompt.promptType) {
    return prompt.content;
  }
  
  const template = PROMPT_TYPE_INFO[prompt.promptType].template;
  
  let result = template
    .replace('{persona}', prompt.persona || 'a helpful AI assistant')
    .replace('{context}', prompt.context || '')
    .replace('{task}', prompt.content)
    .replace('{examples}', prompt.examples || '')
    .replace('{constraints}', prompt.constraints ? `Constraints:\n${prompt.constraints}` : '')
    .replace('{outputFormat}', prompt.outputFormat || 'Provide a clear, well-structured response');
  
  // Clean up empty lines and extra whitespace
  result = result.replace(/\n{3,}/g, '\n\n').trim();
  
  return result;
}

/**
 * Manages the WebView panel for viewing and editing prompts
 */
export class PromptWebView {
  private panel: vscode.WebviewPanel | undefined;
  private currentPrompt: WebViewPrompt | undefined;
  private isViewMode: boolean = false;

  constructor(
    private readonly extensionUri: vscode.Uri,
    private readonly mcpClient: MCPClient
  ) {}

  /**
   * Shows the WebView with a specific prompt (accepts MCP Prompt format)
   */
  public async show(prompt: Prompt, viewOnly: boolean = false): Promise<void> {
    const webViewPrompt = toWebViewPrompt(prompt);
    this.isViewMode = viewOnly;
    this.showWebViewPrompt(webViewPrompt);
  }

  /**
   * Internal method to show WebView with converted prompt
   */
  private async showWebViewPrompt(prompt: WebViewPrompt): Promise<void> {
    this.currentPrompt = prompt;

    if (this.panel) {
      this.panel.webview.html = this.getHtmlContent(prompt);
      this.panel.reveal(vscode.ViewColumn.One);
    } else {
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
            case 'generateStructured':
              this.panel?.webview.postMessage({
                command: 'structuredContent',
                content: generateStructuredPrompt(message.prompt as WebViewPrompt)
              });
              break;
            case 'delete':
              await this.deletePrompt(message.id);
              break;
            case 'enableEdit':
              if (this.currentPrompt) {
                this.isViewMode = false;
                this.panel!.webview.html = this.getHtmlContent(this.currentPrompt);
              }
              break;
          }
        }
      );

      this.panel.onDidDispose(() => {
        this.panel = undefined;
        this.currentPrompt = undefined;
        this.isViewMode = false;
      });
    }
  }

  /**
   * Creates a new prompt via WebView
   */
  public async createNew(): Promise<void> {
    this.isViewMode = false;
    const newPrompt: WebViewPrompt = {
      id: '',
      title: '',
      content: '',
      category: 'General',
      tags: [],
      description: '',
      createdAt: new Date().toISOString(),
      promptType: 'zero-shot',
      persona: '',
      context: '',
      outputFormat: '',
      examples: '',
      constraints: ''
    };

    this.showWebViewPrompt(newPrompt);
  }

  /**
   * Saves the prompt using MCP client
   */
  private async savePrompt(prompt: WebViewPrompt): Promise<void> {
    try {
      // Generate final content with structure
      const finalContent = generateStructuredPrompt(prompt);
      
      if (prompt.id) {
        await this.mcpClient.updatePrompt(prompt.id, {
          name: prompt.title,
          content: finalContent,
          category: prompt.category,
          tags: prompt.tags,
          description: prompt.description
        });
        vscode.window.showInformationMessage('Prompt updated successfully!');
      } else {
        const result = await this.mcpClient.addPrompt(
          prompt.title,
          prompt.description || '',
          prompt.category,
          prompt.tags,
          finalContent
        );
        prompt.id = result.id;
        vscode.window.showInformationMessage('Prompt created successfully!');
      }

      this.currentPrompt = prompt;
      
      if (this.panel) {
        this.panel.title = `Prompt: ${prompt.title}`;
      }

      // Trigger refresh of tree view
      vscode.commands.executeCommand('aiPrompts.refreshPrompts');
    } catch (error) {
      vscode.window.showErrorMessage(`Failed to save prompt: ${error}`);
    }
  }

  /**
   * Deletes the current prompt
   */
  private async deletePrompt(id: string): Promise<void> {
    try {
      const answer = await vscode.window.showWarningMessage(
        `Are you sure you want to delete this prompt?`,
        'Yes',
        'No'
      );

      if (answer !== 'Yes') return;

      await this.mcpClient.deletePrompt(id);
      vscode.window.showInformationMessage('Prompt deleted successfully!');
      
      // Close the panel
      if (this.panel) {
        this.panel.dispose();
      }

      // Trigger refresh of tree view
      vscode.commands.executeCommand('aiPrompts.refreshPrompts');
    } catch (error) {
      vscode.window.showErrorMessage(`Failed to delete prompt: ${error}`);
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
  private getHtmlContent(prompt: WebViewPrompt): string {
    const isNewPrompt = !prompt.id;
    const promptTypeOptions = Object.entries(PROMPT_TYPE_INFO)
      .map(([value, info]) => `<option value="${value}" ${prompt.promptType === value ? 'selected' : ''}>${info.label}</option>`)
      .join('');

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Prompt Editor</title>
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
      max-width: 1200px;
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

    .header-title {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    h1 {
      font-size: 24px;
      font-weight: 600;
    }

    .prompt-type-badge {
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
      background-color: var(--vscode-badge-background);
      color: var(--vscode-badge-foreground);
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
      display: flex;
      align-items: center;
      gap: 6px;
    }

    button:hover {
      opacity: 0.8;
    }

    button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .btn-primary {
      background-color: var(--vscode-button-background);
      color: var(--vscode-button-foreground);
    }

    .btn-secondary {
      background-color: var(--vscode-button-secondaryBackground);
      color: var(--vscode-button-secondaryForeground);
    }

    .btn-danger {
      background-color: var(--vscode-inputValidation-errorBackground);
      color: var(--vscode-inputValidation-errorForeground);
      border: 1px solid var(--vscode-inputValidation-errorBorder);
    }

    .tabs {
      display: flex;
      gap: 0;
      border-bottom: 1px solid var(--vscode-panel-border);
      margin-bottom: 20px;
    }

    .tab {
      padding: 10px 20px;
      cursor: pointer;
      border-bottom: 2px solid transparent;
      transition: all 0.2s;
      font-weight: 500;
    }

    .tab:hover {
      background-color: var(--vscode-list-hoverBackground);
    }

    .tab.active {
      border-bottom-color: var(--vscode-focusBorder);
      color: var(--vscode-textLink-foreground);
    }

    .tab-content {
      display: none;
    }

    .tab-content.active {
      display: block;
    }

    .form-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
    }

    .form-group {
      margin-bottom: 20px;
    }

    .form-group.full-width {
      grid-column: 1 / -1;
    }

    label {
      display: block;
      margin-bottom: 8px;
      font-weight: 500;
      color: var(--vscode-foreground);
    }

    label .hint {
      font-weight: normal;
      font-size: 11px;
      color: var(--vscode-descriptionForeground);
      margin-left: 8px;
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
      min-height: 150px;
      resize: vertical;
      font-family: var(--vscode-editor-font-family);
    }

    textarea.large {
      min-height: 300px;
    }

    input:focus,
    textarea:focus,
    select:focus {
      outline: 1px solid var(--vscode-focusBorder);
    }

    .info-box {
      padding: 12px 16px;
      border-radius: 4px;
      margin-bottom: 20px;
      background-color: var(--vscode-textBlockQuote-background);
      border-left: 4px solid var(--vscode-textLink-foreground);
    }

    .info-box h4 {
      margin-bottom: 6px;
      font-size: 13px;
    }

    .info-box p {
      font-size: 12px;
      color: var(--vscode-descriptionForeground);
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
      opacity: 0.7;
    }

    .tag-remove:hover {
      opacity: 1;
    }

    .tag-input {
      flex: 1;
      min-width: 120px;
      border: none !important;
      background: transparent !important;
      color: var(--vscode-input-foreground);
      outline: none !important;
      padding: 0 !important;
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

    .badge {
      display: inline-block;
      padding: 3px 8px;
      border-radius: 3px;
      font-size: 11px;
      background-color: var(--vscode-badge-background);
      color: var(--vscode-badge-foreground);
      margin-right: 5px;
    }

    .preview {
      margin-top: 20px;
      padding: 20px;
      border: 1px solid var(--vscode-panel-border);
      border-radius: 4px;
      background-color: var(--vscode-editor-background);
    }

    .preview-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
    }

    .preview h2 {
      font-size: 16px;
      color: var(--vscode-foreground);
    }

    .preview-content {
      white-space: pre-wrap;
      font-family: var(--vscode-editor-font-family);
      line-height: 1.6;
      padding: 15px;
      background-color: var(--vscode-textCodeBlock-background);
      border-radius: 4px;
      max-height: 500px;
      overflow-y: auto;
    }

    .char-count {
      font-size: 12px;
      color: var(--vscode-descriptionForeground);
      text-align: right;
      margin-top: 5px;
    }

    .view-mode-banner {
      padding: 12px 16px;
      background-color: var(--vscode-editorInfo-background);
      border: 1px solid var(--vscode-editorInfo-border);
      border-radius: 4px;
      margin-bottom: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .view-mode-banner span {
      font-weight: 500;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="header-title">
        <h1>${isNewPrompt ? '✨ Create New Prompt' : (this.isViewMode ? '👁️ View Prompt' : '✏️ Edit Prompt')}</h1>
        ${prompt.promptType && prompt.promptType !== 'custom' ? `<span class="prompt-type-badge">${PROMPT_TYPE_INFO[prompt.promptType as PromptType]?.label || prompt.promptType}</span>` : ''}
      </div>
      <div class="actions">
        <button class="btn-secondary" onclick="copyPrompt()">📋 Copy</button>
        <button class="btn-secondary" onclick="insertPrompt()">➕ Insert</button>
        ${!isNewPrompt ? `<button class="btn-danger" onclick="deletePrompt()">🗑️ Delete</button>` : ''}
        <button class="btn-primary" onclick="savePrompt()" ${this.isViewMode ? 'style="display:none"' : ''}>💾 Save</button>
      </div>
    </div>

    ${this.isViewMode ? `
    <div class="view-mode-banner">
      <span>📖 View Mode - Click Edit to make changes</span>
      <button class="btn-secondary" onclick="enableEditMode()">✏️ Edit</button>
    </div>
    ` : ''}

    <div class="tabs">
      <div class="tab active" onclick="switchTab('basic')">📝 Basic Info</div>
      <div class="tab" onclick="switchTab('engineering')">🧪 Prompt Engineering</div>
      <div class="tab" onclick="switchTab('preview')">👁️ Preview</div>
    </div>

    <!-- Basic Info Tab -->
    <div id="tab-basic" class="tab-content active">
      <div class="form-row">
        <div class="form-group">
          <label for="title">Title * <span class="hint">A descriptive name for your prompt</span></label>
          <input 
            type="text" 
            id="title" 
            value="${this.escapeHtml(prompt.title)}" 
            required
            placeholder="e.g., Code Review Assistant"
            ${this.isViewMode ? 'readonly' : ''}
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
            ${this.isViewMode ? 'readonly' : ''}
          />
          <datalist id="categories">
            <option value="Code">
            <option value="Writing">
            <option value="Analysis">
            <option value="Debugging">
            <option value="Documentation">
            <option value="Testing">
            <option value="DevOps">
            <option value="Architecture">
            <option value="General">
          </datalist>
        </div>
      </div>

      <div class="form-group">
        <label for="description">Description <span class="hint">Brief summary of what this prompt does</span></label>
        <input 
          type="text" 
          id="description" 
          value="${this.escapeHtml(prompt.description || '')}"
          placeholder="e.g., Reviews code for best practices, security issues, and performance..."
          ${this.isViewMode ? 'readonly' : ''}
        />
      </div>

      <div class="form-group">
        <label for="tags">Tags <span class="hint">Press Enter to add tags</span></label>
        <div class="tags-input-container" id="tagsContainer">
          ${prompt.tags.map(tag => `
            <span class="tag">
              ${this.escapeHtml(tag)}
              ${!this.isViewMode ? `<span class="tag-remove" onclick="removeTag('${this.escapeHtml(tag)}')">×</span>` : ''}
            </span>
          `).join('')}
          ${!this.isViewMode ? `
          <input 
            type="text" 
            class="tag-input" 
            id="tagInput"
            placeholder="Add tag..."
            onkeydown="handleTagInput(event)"
          />
          ` : ''}
        </div>
      </div>

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
    </div>

    <!-- Prompt Engineering Tab -->
    <div id="tab-engineering" class="tab-content">
      <div class="info-box">
        <h4>🧪 Prompt Engineering</h4>
        <p>Use these fields to structure your prompt according to best practices. The final prompt will be generated automatically based on the selected type.</p>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label for="promptType">Prompt Type * <span class="hint">Select a prompting technique</span></label>
          <select id="promptType" onchange="updatePromptTypeInfo()" ${this.isViewMode ? 'disabled' : ''}>
            ${promptTypeOptions}
          </select>
        </div>

        <div class="form-group">
          <label for="persona">Persona <span class="hint">Who should the AI act as?</span></label>
          <input 
            type="text" 
            id="persona" 
            value="${this.escapeHtml(prompt.persona || '')}"
            placeholder="e.g., an expert software architect, a senior code reviewer..."
            ${this.isViewMode ? 'readonly' : ''}
          />
        </div>
      </div>

      <div id="promptTypeInfo" class="info-box" style="border-left-color: var(--vscode-charts-blue);">
        <h4 id="promptTypeLabel">${PROMPT_TYPE_INFO[prompt.promptType as PromptType || 'zero-shot'].label}</h4>
        <p id="promptTypeDesc">${PROMPT_TYPE_INFO[prompt.promptType as PromptType || 'zero-shot'].description}</p>
      </div>

      <div class="form-group">
        <label for="context">Context <span class="hint">Background information or setup</span></label>
        <textarea 
          id="context" 
          placeholder="e.g., You are reviewing code in a TypeScript project that uses React and follows Clean Architecture principles..."
          ${this.isViewMode ? 'readonly' : ''}
        >${this.escapeHtml(prompt.context || '')}</textarea>
      </div>

      <div class="form-group">
        <label for="content">Main Task/Instruction * <span class="hint">The core task you want the AI to perform</span></label>
        <textarea 
          id="content" 
          class="large"
          required
          placeholder="e.g., Review the following code and provide feedback on:
1. Code quality and readability
2. Potential bugs or issues
3. Performance improvements
4. Security concerns"
          oninput="updatePreview()"
          ${this.isViewMode ? 'readonly' : ''}
        >${this.escapeHtml(prompt.content)}</textarea>
        <div class="char-count" id="charCount"></div>
      </div>

      <div class="form-group" id="examplesGroup" style="${prompt.promptType === 'few-shot' ? '' : 'display: none;'}">
        <label for="examples">Examples <span class="hint">Required for Few-Shot prompts</span></label>
        <textarea 
          id="examples" 
          placeholder="Example 1:
Input: [example input]
Output: [example output]

Example 2:
Input: [example input]
Output: [example output]"
          ${this.isViewMode ? 'readonly' : ''}
        >${this.escapeHtml(prompt.examples || '')}</textarea>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label for="outputFormat">Output Format <span class="hint">How should the AI format its response?</span></label>
          <textarea 
            id="outputFormat" 
            placeholder="e.g., Respond in markdown with sections for: Summary, Issues Found, Recommendations"
            style="min-height: 100px;"
            ${this.isViewMode ? 'readonly' : ''}
          >${this.escapeHtml(prompt.outputFormat || '')}</textarea>
        </div>

        <div class="form-group">
          <label for="constraints">Constraints <span class="hint">Rules or limitations</span></label>
          <textarea 
            id="constraints" 
            placeholder="e.g., 
- Keep responses under 500 words
- Focus only on critical issues
- Don't suggest refactoring unless necessary"
            style="min-height: 100px;"
            ${this.isViewMode ? 'readonly' : ''}
          >${this.escapeHtml(prompt.constraints || '')}</textarea>
        </div>
      </div>

      <button class="btn-secondary" onclick="generatePreview()" style="margin-top: 10px;">
        🔄 Generate Structured Prompt
      </button>
    </div>

    <!-- Preview Tab -->
    <div id="tab-preview" class="tab-content">
      <div class="preview">
        <div class="preview-header">
          <h2>📄 Final Prompt Preview</h2>
          <div>
            <button class="btn-secondary" onclick="copyPrompt()">📋 Copy</button>
            <button class="btn-secondary" onclick="insertPrompt()">➕ Insert at Cursor</button>
          </div>
        </div>
        <div class="preview-content" id="preview">${this.escapeHtml(prompt.content)}</div>
        <div class="char-count" id="previewCharCount"></div>
      </div>
    </div>
  </div>

  <script>
    const vscode = acquireVsCodeApi();
    let currentTags = ${JSON.stringify(prompt.tags)};
    const promptTypeInfo = ${JSON.stringify(PROMPT_TYPE_INFO)};
    const isViewMode = ${this.isViewMode};

    // Tab switching
    function switchTab(tabId) {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      
      document.querySelector(\`.tab[onclick="switchTab('\${tabId}')"]\`).classList.add('active');
      document.getElementById('tab-' + tabId).classList.add('active');

      if (tabId === 'preview') {
        generatePreview();
      }
    }

    function updatePromptTypeInfo() {
      const type = document.getElementById('promptType').value;
      const info = promptTypeInfo[type];
      
      document.getElementById('promptTypeLabel').textContent = info.label;
      document.getElementById('promptTypeDesc').textContent = info.description;
      
      // Show/hide examples field for few-shot
      document.getElementById('examplesGroup').style.display = 
        type === 'few-shot' ? '' : 'none';
    }

    function getPromptData() {
      return {
        id: '${prompt.id}',
        title: document.getElementById('title').value.trim(),
        category: document.getElementById('category').value.trim(),
        description: document.getElementById('description').value.trim(),
        content: document.getElementById('content').value.trim(),
        tags: currentTags,
        promptType: document.getElementById('promptType').value,
        persona: document.getElementById('persona').value.trim(),
        context: document.getElementById('context').value.trim(),
        outputFormat: document.getElementById('outputFormat').value.trim(),
        examples: document.getElementById('examples').value.trim(),
        constraints: document.getElementById('constraints').value.trim(),
        createdAt: '${prompt.createdAt}',
        updatedAt: new Date().toISOString()
      };
    }

    function generatePreview() {
      const prompt = getPromptData();
      vscode.postMessage({
        command: 'generateStructured',
        prompt
      });
    }

    // Listen for generated content
    window.addEventListener('message', event => {
      const message = event.data;
      if (message.command === 'structuredContent') {
        document.getElementById('preview').textContent = message.content;
        updatePreviewCharCount(message.content);
      }
    });

    function savePrompt() {
      const prompt = getPromptData();

      if (!prompt.title || !prompt.category || !prompt.content) {
        alert('Please fill in all required fields (Title, Category, and Main Task)');
        return;
      }

      vscode.postMessage({
        command: 'save',
        prompt
      });
    }

    function deletePrompt() {
      vscode.postMessage({
        command: 'delete',
        id: '${prompt.id}'
      });
    }

    function copyPrompt() {
      const preview = document.getElementById('preview').textContent;
      vscode.postMessage({
        command: 'copy',
        content: preview || document.getElementById('content').value
      });
    }

    function insertPrompt() {
      const preview = document.getElementById('preview').textContent;
      vscode.postMessage({
        command: 'insert',
        content: preview || document.getElementById('content').value
      });
    }

    function enableEditMode() {
      vscode.postMessage({
        command: 'enableEdit'
      });
    }

    function updatePreview() {
      const content = document.getElementById('content').value;
      updateCharCount();
    }

    function updateCharCount() {
      const content = document.getElementById('content').value;
      const charCount = content.length;
      const wordCount = content.trim() ? content.trim().split(/\\s+/).length : 0;
      document.getElementById('charCount').textContent = 
        \`\${charCount} characters, \${wordCount} words\`;
    }

    function updatePreviewCharCount(content) {
      const charCount = content.length;
      const wordCount = content.trim() ? content.trim().split(/\\s+/).length : 0;
      const tokenEstimate = Math.ceil(charCount / 4); // Rough token estimate
      document.getElementById('previewCharCount').textContent = 
        \`\${charCount} characters, \${wordCount} words, ~\${tokenEstimate} tokens\`;
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
      if (input) {
        input.parentElement.insertBefore(tagSpan, input);
      }
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
      
      if (input) {
        container.appendChild(input);
      }
    }

    function escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }

    // Initialize
    updateCharCount();
    updatePromptTypeInfo();
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
