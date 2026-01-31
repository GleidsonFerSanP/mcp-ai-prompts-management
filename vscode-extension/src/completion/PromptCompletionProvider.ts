import * as vscode from 'vscode';
import { MCPClient } from '../mcpClient';

/**
 * Completion provider for AI prompts
 * Provides IntelliSense completions for prompts using "prompt-" prefix
 */
export class PromptCompletionProvider implements vscode.CompletionItemProvider {
  constructor(private mcpClient: MCPClient) {}

  async provideCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position,
    token: vscode.CancellationToken,
    context: vscode.CompletionContext
  ): Promise<vscode.CompletionItem[]> {
    const linePrefix = document.lineAt(position).text.substr(0, position.character);
    
    // Trigger on "prompt-" prefix
    if (!linePrefix.endsWith('prompt-')) {
      return [];
    }

    try {
      const prompts = await this.mcpClient.listPrompts();
      
      return prompts.map(prompt => {
        const item = new vscode.CompletionItem(
          `prompt-${this.slugify(prompt.name)}`,
          vscode.CompletionItemKind.Snippet
        );

        // Snippet content
        item.insertText = new vscode.SnippetString(prompt.content);

        // Details
        item.detail = prompt.category;
        item.documentation = new vscode.MarkdownString()
          .appendMarkdown(`**${prompt.name}**\n\n`)
          .appendMarkdown(`${prompt.description}\n\n`)
          .appendMarkdown(`*Category:* ${prompt.category}\n\n`)
          .appendMarkdown(`*Tags:* ${prompt.tags.join(', ') || 'None'}`);

        // Sort priority
        item.sortText = `0-${prompt.name}`;

        return item;
      });
    } catch (error) {
      console.error('Error providing completions:', error);
      return [];
    }
  }

  /**
   * Convert prompt name to slug (e.g., "Code Review" -> "code-review")
   */
  private slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }
}

/**
 * Generate VS Code snippets JSON from prompts
 */
export async function generateSnippetsFromPrompts(mcpClient: MCPClient): Promise<any> {
  try {
    const prompts = await mcpClient.listPrompts();
    const snippets: any = {};

    prompts.forEach(prompt => {
      const snippetKey = prompt.name.replace(/[^\w\s]/g, '').replace(/\s+/g, ' ');
      
      snippets[snippetKey] = {
        prefix: `prompt-${slugify(prompt.name)}`,
        body: prompt.content.split('\n'),
        description: prompt.description || prompt.name
      };
    });

    return snippets;
  } catch (error) {
    console.error('Error generating snippets:', error);
    return {};
  }
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}
