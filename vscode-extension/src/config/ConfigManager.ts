import * as vscode from 'vscode';

export class ConfigManager {
  private config: vscode.WorkspaceConfiguration;

  constructor() {
    this.config = vscode.workspace.getConfiguration('aiPrompts');
  }

  getStorageProvider(): string {
    return this.config.get<string>('storage.provider', 'local');
  }

  getStoragePath(): string {
    return this.config.get<string>('storage.path', '');
  }

  getDefaultCategory(): string {
    return this.config.get<string>('defaultCategory', 'development');
  }

  getSnippetPrefix(): string {
    return this.config.get<string>('snippetPrefix', 'prompt-');
  }

  getShowCategoryIcons(): boolean {
    return this.config.get<boolean>('showCategoryIcons', true);
  }

  async setStorageProvider(provider: string): Promise<void> {
    await this.config.update(
      'storage.provider',
      provider,
      vscode.ConfigurationTarget.Global
    );
    this.config = vscode.workspace.getConfiguration('aiPrompts');
  }

  async setStoragePath(path: string): Promise<void> {
    await this.config.update(
      'storage.path',
      path,
      vscode.ConfigurationTarget.Global
    );
    this.config = vscode.workspace.getConfiguration('aiPrompts');
  }

  async setDefaultCategory(category: string): Promise<void> {
    await this.config.update(
      'defaultCategory',
      category,
      vscode.ConfigurationTarget.Global
    );
    this.config = vscode.workspace.getConfiguration('aiPrompts');
  }

  refresh(): void {
    this.config = vscode.workspace.getConfiguration('aiPrompts');
  }
}
