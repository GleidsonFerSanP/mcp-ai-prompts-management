import * as vscode from 'vscode';
import { MCPClient, Prompt } from '../mcpClient.js';
import { ConfigManager } from '../config/ConfigManager.js';

export class PromptTreeItem extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly prompt?: Prompt,
    public readonly isCategory: boolean = false
  ) {
    super(label, collapsibleState);

    if (prompt) {
      this.contextValue = 'prompt';
      this.tooltip = `${prompt.name}\n\n${prompt.description}\n\nTags: ${prompt.tags.join(', ')}`;
      this.description = prompt.description;
      this.iconPath = new vscode.ThemeIcon('file-code');
    } else if (isCategory) {
      this.contextValue = 'category';
      this.iconPath = new vscode.ThemeIcon('folder');
    }
  }
}

export class PromptsTreeProvider implements vscode.TreeDataProvider<PromptTreeItem> {
  private _onDidChangeTreeData = new vscode.EventEmitter<PromptTreeItem | undefined | void>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  constructor(
    private mcpClient: MCPClient,
    private configManager: ConfigManager
  ) {}

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: PromptTreeItem): vscode.TreeItem {
    return element;
  }

  async getChildren(element?: PromptTreeItem): Promise<PromptTreeItem[]> {
    if (!element) {
      // Root level: show categories
      return this.getCategories();
    } else if (element.isCategory) {
      // Category level: show prompts in that category
      return this.getPromptsInCategory(element.label);
    }

    return [];
  }

  private async getCategories(): Promise<PromptTreeItem[]> {
    try {
      const prompts = await this.mcpClient.listPrompts();
      const categories = new Map<string, number>();

      // Count prompts per category
      prompts.forEach(prompt => {
        const count = categories.get(prompt.category) || 0;
        categories.set(prompt.category, count + 1);
      });

      // Create tree items for each category
      const items: PromptTreeItem[] = [];
      for (const [category, count] of categories.entries()) {
        const item = new PromptTreeItem(
          category,
          vscode.TreeItemCollapsibleState.Collapsed,
          undefined,
          true
        );
        item.description = `${count} prompt${count !== 1 ? 's' : ''}`;
        items.push(item);
      }

      // Sort alphabetically
      items.sort((a, b) => a.label.localeCompare(b.label));

      if (items.length === 0) {
        // Show empty state
        const emptyItem = new PromptTreeItem(
          'No prompts yet',
          vscode.TreeItemCollapsibleState.None
        );
        emptyItem.description = 'Click + to add your first prompt';
        emptyItem.iconPath = new vscode.ThemeIcon('info');
        return [emptyItem];
      }

      return items;
    } catch (error) {
      console.error('Error getting categories:', error);
      vscode.window.showErrorMessage(`Failed to load categories: ${error}`);
      return [];
    }
  }

  private async getPromptsInCategory(category: string): Promise<PromptTreeItem[]> {
    try {
      const allPrompts = await this.mcpClient.listPrompts();
      const prompts = allPrompts.filter(p => p.category === category);

      const items = prompts.map(prompt => {
        return new PromptTreeItem(
          prompt.name,
          vscode.TreeItemCollapsibleState.None,
          prompt,
          false
        );
      });

      // Sort by name
      items.sort((a, b) => a.label.localeCompare(b.label));

      return items;
    } catch (error) {
      console.error('Error getting prompts:', error);
      vscode.window.showErrorMessage(`Failed to load prompts: ${error}`);
      return [];
    }
  }
}
