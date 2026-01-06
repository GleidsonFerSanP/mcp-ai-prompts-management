import * as vscode from 'vscode';
import { PromptsTreeProvider } from './views/PromptsTreeProvider.js';
import { MCPClient } from './mcpClient.js';
import { ConfigManager } from './config/ConfigManager.js';
import { registerCommands } from './commands/index.js';

let mcpClient: MCPClient;
let treeProvider: PromptsTreeProvider;

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

    // Show status bar with storage info
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
  console.log('MCP AI Prompts extension deactivated');
}

function updateStorageStatusBar(configManager: ConfigManager) {
  const provider = configManager.getStorageProvider();
  const providerNames: Record<string, string> = {
    local: '💾 Local',
    onedrive: '☁️ OneDrive',
    googledrive: '☁️ Google Drive',
    dropbox: '☁️ Dropbox'
  };

  const statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    100
  );
  statusBarItem.text = providerNames[provider] || '💾 Local';
  statusBarItem.tooltip = `Storage: ${provider}`;
  statusBarItem.command = 'aiPrompts.configureStorage';
  statusBarItem.show();
}
