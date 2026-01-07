import * as vscode from 'vscode';
import { MCPClient } from '../mcpClient.js';
import { PromptsTreeProvider } from '../views/PromptsTreeProvider.js';
import { ConfigManager } from '../config/ConfigManager.js';
import { PromptWebView } from '../views/PromptWebView.js';

export function registerCommands(
  context: vscode.ExtensionContext,
  mcpClient: MCPClient,
  treeProvider: PromptsTreeProvider,
  configManager: ConfigManager
): void {
  // Initialize WebView
  const webView = new PromptWebView(context.extensionUri, mcpClient);
  context.subscriptions.push({ dispose: () => webView.dispose() });

  // Add Prompt
  context.subscriptions.push(
    vscode.commands.registerCommand('aiPrompts.addPrompt', async () => {
      await webView.createNew();
      // Refresh tree after potential save
      setTimeout(() => treeProvider.refresh(), 1000);
    })
  );

  // Edit Prompt
  context.subscriptions.push(
    vscode.commands.registerCommand('aiPrompts.editPrompt', async (item: any) => {
      if (!item?.prompt) return;

      await webView.show(item.prompt);
      // Refresh tree after potential save
      setTimeout(() => treeProvider.refresh(), 1000);
    })
  );

  // Delete Prompt
  context.subscriptions.push(
    vscode.commands.registerCommand('aiPrompts.deletePrompt', async (item: any) => {
      if (!item?.prompt) return;

      const prompt = item.prompt;
      const answer = await vscode.window.showWarningMessage(
        `Delete prompt "${prompt.name}"?`,
        'Yes',
        'No'
      );

      if (answer !== 'Yes') return;

      try {
        await mcpClient.deletePrompt(prompt.id);
        vscode.window.showInformationMessage(`Prompt "${prompt.name}" deleted`);
        treeProvider.refresh();
      } catch (error) {
        vscode.window.showErrorMessage(`Failed to delete prompt: ${error}`);
      }
    })
  );

  // Copy Prompt
  context.subscriptions.push(
    vscode.commands.registerCommand('aiPrompts.copyPrompt', async (item: any) => {
      if (!item?.prompt) return;

      await vscode.env.clipboard.writeText(item.prompt.content);
      vscode.window.showInformationMessage(`Copied "${item.prompt.name}" to clipboard`);
    })
  );

  // Insert Prompt
  context.subscriptions.push(
    vscode.commands.registerCommand('aiPrompts.insertPrompt', async (item: any) => {
      if (!item?.prompt) return;

      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showWarningMessage('No active editor');
        return;
      }

      await editor.edit(editBuilder => {
        editBuilder.insert(editor.selection.active, item.prompt.content);
      });

      vscode.window.showInformationMessage(`Inserted "${item.prompt.name}"`);
    })
  );

  // Refresh Prompts
  context.subscriptions.push(
    vscode.commands.registerCommand('aiPrompts.refreshPrompts', () => {
      treeProvider.refresh();
      vscode.window.showInformationMessage('Prompts refreshed');
    })
  );

  // Configure Storage
  context.subscriptions.push(
    vscode.commands.registerCommand('aiPrompts.configureStorage', async () => {
      const providers = await mcpClient.listStorageProviders();

      const items = providers.map(p => ({
        label: `${p.available ? '✅' : '❌'} ${p.name}`,
        description: p.available ? 'Available' : 'Not available',
        provider: p.type
      }));

      const selected = await vscode.window.showQuickPick(items, {
        placeHolder: 'Select storage provider'
      });

      if (!selected) return;

      try {
        await mcpClient.configureStorage(selected.provider);
        await configManager.setStorageProvider(selected.provider);
        vscode.window.showInformationMessage(`Storage set to ${selected.label}`);
        treeProvider.refresh();
      } catch (error) {
        vscode.window.showErrorMessage(`Failed to configure storage: ${error}`);
      }
    })
  );

  // Search Prompts
  context.subscriptions.push(
    vscode.commands.registerCommand('aiPrompts.searchPrompts', async () => {
      const prompts = await mcpClient.listPrompts();

      const items = prompts.map(p => ({
        label: p.name,
        description: p.category,
        detail: p.description,
        prompt: p
      }));

      const selected = await vscode.window.showQuickPick(items, {
        placeHolder: 'Search and select a prompt',
        matchOnDescription: true,
        matchOnDetail: true
      });

      if (!selected) return;

      // Show options for selected prompt
      const action = await vscode.window.showQuickPick(
        ['Copy to Clipboard', 'Insert at Cursor', 'Edit', 'Delete'],
        { placeHolder: `What to do with "${selected.label}"?` }
      );

      switch (action) {
        case 'Copy to Clipboard':
          await vscode.env.clipboard.writeText(selected.prompt.content);
          vscode.window.showInformationMessage('Copied to clipboard');
          break;
        case 'Insert at Cursor':
          const editor = vscode.window.activeTextEditor;
          if (editor) {
            await editor.edit(editBuilder => {
              editBuilder.insert(editor.selection.active, selected.prompt.content);
            });
            vscode.window.showInformationMessage('Inserted at cursor');
          }
          break;
        case 'Edit':
          vscode.commands.executeCommand('aiPrompts.editPrompt', { prompt: selected.prompt });
          break;
        case 'Delete':
          vscode.commands.executeCommand('aiPrompts.deletePrompt', { prompt: selected.prompt });
          break;
      }
    })
  );

  // Show Prompt Stats
  context.subscriptions.push(
    vscode.commands.registerCommand('aiPrompts.showStats', async () => {
      try {
        const prompts = await mcpClient.listPrompts();
        const categories = await mcpClient.getCategories();
        const tags = await mcpClient.getTags();

        const statsMessage = `📊 **AI Prompts Statistics**\n\n` +
          `• Total Prompts: ${prompts.length}\n` +
          `• Categories: ${categories.length}\n` +
          `• Tags: ${tags.length}\n` +
          `• Storage: ${configManager.getStorageProvider()}`;

        vscode.window.showInformationMessage(statsMessage, { modal: false });
      } catch (error) {
        vscode.window.showErrorMessage(`Failed to load stats: ${error}`);
      }
    })
  );
}
