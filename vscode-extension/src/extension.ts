import * as vscode from 'vscode';
import { PromptsTreeProvider } from './views/PromptsTreeProvider.js';
import { MCPClient } from './mcpClient.js';
import { ConfigManager } from './config/ConfigManager.js';
import { registerCommands } from './commands/index.js';
import { PromptCompletionProvider } from './completion/PromptCompletionProvider.js';

let mcpClient: MCPClient;
let treeProvider: PromptsTreeProvider;
let statusBarItem: vscode.StatusBarItem;

export async function activate(context: vscode.ExtensionContext) {
  console.log('MCP AI Prompts extension is now active!');

  try {
    // Initialize configuration manager
    const configManager = new ConfigManager();
    
    // Initialize MCP client
    mcpClient = new MCPClient(context);
    await mcpClient.connect();

    // Initialize tree provider
    treeProvider = new PromptsTreeProvider(mcpClient, configManager);
    
    // Register tree view
    const treeView = vscode.window.createTreeView('aiPromptsExplorer', {
      treeDataProvider: treeProvider,
      showCollapseAll: true,
      canSelectMany: false
    });
    context.subscriptions.push(treeView);

    // Register all commands
    registerCommands(context, mcpClient, treeProvider, configManager);

    // Register completion provider for all file types
    const completionProvider = new PromptCompletionProvider(mcpClient);
    context.subscriptions.push(
      vscode.languages.registerCompletionItemProvider(
        { scheme: 'file', pattern: '**/*' },
        completionProvider,
        '-' // Trigger on '-' character (for "prompt-")
      )
    );

    // Show status bar with storage info
    statusBarItem = createStorageStatusBar(configManager);
    context.subscriptions.push(statusBarItem);
    updateStorageStatusBar(configManager);

    // Listen for configuration changes
    context.subscriptions.push(
      vscode.workspace.onDidChangeConfiguration(e => {
        if (e.affectsConfiguration('aiPrompts')) {
          treeProvider.refresh();
          updateStorageStatusBar(configManager);
        }
      })
    );

    vscode.window.showInformationMessage('AI Prompts extension loaded successfully!');
  } catch (error) {
    vscode.window.showErrorMessage(`Failed to activate AI Prompts: ${error}`);
    console.error('Activation error:', error);
  }
}

export function deactivate() {
  if (mcpClient) {
    mcpClient.disconnect();
  }
  if (statusBarItem) {
    statusBarItem.dispose();
  }
  console.log('MCP AI Prompts extension deactivated');
}

function createStorageStatusBar(configManager: ConfigManager): vscode.StatusBarItem {
  const item = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    100
  );
  item.command = 'aiPrompts.configureStorage';
  return item;
}

function updateStorageStatusBar(configManager: ConfigManager) {
  if (!statusBarItem) return;

  const provider = configManager.getStorageProvider();
  const providerNames: Record<string, string> = {
    local: '💾 Local',
    onedrive: '☁️ OneDrive',
    googledrive: '☁️ Google Drive',
    dropbox: '☁️ Dropbox'
  };

  statusBarItem.text = `$(database) ${providerNames[provider] || 'Local'}`;
  statusBarItem.tooltip = `AI Prompts Storage: ${provider}\nClick to change`;
  statusBarItem.show();
}
