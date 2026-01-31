import * as vscode from 'vscode';
import { MCPClient } from '../mcpClient';
import { PromptsTreeProvider } from '../views/PromptsTreeProvider';
import { ConfigManager } from '../config/ConfigManager';
import { PromptWebView } from '../views/PromptWebView';

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

      await webView.show(item.prompt, false); // false = edit mode
      // Refresh tree after potential save
      setTimeout(() => treeProvider.refresh(), 1000);
    })
  );

  // View Prompt (Read-only)
  context.subscriptions.push(
    vscode.commands.registerCommand('aiPrompts.viewPrompt', async (item: any) => {
      if (!item?.prompt) return;

      await webView.show(item.prompt, true); // true = view mode
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

      // Separate available and unavailable providers
      const availableProviders = providers.filter(p => p.available);
      const unavailableProviders = providers.filter(p => !p.available);

      if (availableProviders.length === 0) {
        vscode.window.showWarningMessage(
          'No cloud storage providers available. Using local storage.',
          'Learn More'
        ).then(selection => {
          if (selection === 'Learn More') {
            vscode.env.openExternal(vscode.Uri.parse('https://github.com/GleidsonFerSanP/mcp-ai-prompts-management#storage-providers'));
          }
        });
        return;
      }

      // Build items list with available providers first
      const items: vscode.QuickPickItem[] = [
        { label: 'Available Providers', kind: vscode.QuickPickItemKind.Separator },
        ...availableProviders.map(p => ({
          label: `✅ ${p.name}`,
          description: p.active ? '(Currently active)' : 'Ready to use',
          detail: `Store prompts in ${p.name}`,
          provider: p.type
        } as vscode.QuickPickItem & { provider: string }))
      ];

      // Add unavailable providers section if any
      if (unavailableProviders.length > 0) {
        items.push(
          { label: 'Unavailable (Not installed)', kind: vscode.QuickPickItemKind.Separator },
          ...unavailableProviders.map(p => ({
            label: `❌ ${p.name}`,
            description: 'Not detected on this system',
            detail: `Install ${p.name} desktop app to enable`,
            provider: p.type
          } as vscode.QuickPickItem & { provider: string }))
        );
      }

      const selected = await vscode.window.showQuickPick(items, {
        placeHolder: 'Select storage provider',
        title: 'Configure Storage Provider'
      }) as (vscode.QuickPickItem & { provider?: string }) | undefined;

      if (!selected || !selected.provider) return;

      // Check if selected provider is unavailable
      const selectedProvider = providers.find(p => p.type === selected.provider);
      if (selectedProvider && !selectedProvider.available) {
        const action = await vscode.window.showWarningMessage(
          `${selectedProvider.name} is not installed on this system. Please install the desktop app first.`,
          'Use Local Storage',
          'Cancel'
        );
        
        if (action === 'Use Local Storage') {
          try {
            await mcpClient.configureStorage('local');
            await configManager.setStorageProvider('local');
            vscode.window.showInformationMessage('Storage set to Local');
            treeProvider.refresh();
          } catch (error) {
            vscode.window.showErrorMessage(`Failed to configure storage: ${error}`);
          }
        }
        return;
      }

      try {
        await mcpClient.configureStorage(selected.provider);
        await configManager.setStorageProvider(selected.provider);
        vscode.window.showInformationMessage(`Storage set to ${selectedProvider?.name || selected.provider}`);
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
