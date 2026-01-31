import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { PromptsTreeProvider } from './views/PromptsTreeProvider';
import { MCPClient } from './mcpClient';
import { ConfigManager } from './config/ConfigManager';
import { registerCommands } from './commands/index';
import { PromptCompletionProvider } from './completion/PromptCompletionProvider';
import { registerChatParticipant } from './chat/ChatParticipant';
import { registerLanguageModelTools } from './tools/LanguageModelTools';

let mcpClient: MCPClient;
let treeProvider: PromptsTreeProvider;
let statusBarItem: vscode.StatusBarItem;

export async function activate(context: vscode.ExtensionContext) {
  console.log('MCP AI Prompts extension is now active!');

  // Register MCP Server Definition Provider (exposes tools directly to Copilot)
  registerMcpServerProvider(context);

  // Initialize configuration manager
  const configManager = new ConfigManager();
  
  // Initialize MCP client
  mcpClient = new MCPClient(context);
  
  // Initialize tree provider (will show error state if not connected)
  treeProvider = new PromptsTreeProvider(mcpClient, configManager);
  
  // Register tree view first so it's always visible
  const treeView = vscode.window.createTreeView('aiPromptsExplorer', {
    treeDataProvider: treeProvider,
    showCollapseAll: true,
    canSelectMany: false
  });
  context.subscriptions.push(treeView);

  // Register all commands (always register so they appear in command palette)
  registerCommands(context, mcpClient, treeProvider, configManager);

  // Register command to copy prompt content (used by chat participant)
  context.subscriptions.push(
    vscode.commands.registerCommand('aiPrompts.copyPromptContent', async (content: string) => {
      if (content) {
        await vscode.env.clipboard.writeText(content);
        vscode.window.showInformationMessage('Prompt copied to clipboard!');
      }
    })
  );

  // Register Chat Participant for GitHub Copilot integration
  registerChatParticipant(context, mcpClient);

  // Register Language Model Tools (exposes MCP tools to Copilot)
  registerLanguageModelTools(context, mcpClient);

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

  // Try to connect to MCP server (non-blocking)
  try {
    await mcpClient.connect();
    vscode.window.showInformationMessage('AI Prompts extension loaded successfully!');
    treeProvider.refresh();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    vscode.window.showErrorMessage(`AI Prompts: Failed to connect to MCP server. ${errorMessage}`);
    console.error('MCP connection error:', error);
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

/**
 * Register MCP Server Definition Provider
 * This exposes the MCP Server tools directly to GitHub Copilot Chat
 */
function registerMcpServerProvider(context: vscode.ExtensionContext) {
  console.log('Registering MCP Server Definition Provider...');
  
  const mcpServerPath = path.join(context.extensionPath, 'server', 'index.js');
  console.log(`MCP Server path: ${mcpServerPath}`);
  
  // Verify the server file exists
  if (!fs.existsSync(mcpServerPath)) {
    console.error(`MCP Server file not found at: ${mcpServerPath}`);
    return;
  }
  
  console.log('MCP Server file found successfully');
  
  // Register the MCP Server Definition Provider
  // This makes the MCP tools automatically available to Copilot
  context.subscriptions.push(
    vscode.lm.registerMcpServerDefinitionProvider('mcp-ai-prompts', {
      provideMcpServerDefinitions() {
        console.log('Providing MCP Server definitions for AI Prompts...');
        return [
          new vscode.McpStdioServerDefinition(
            'mcp-ai-prompts',
            'node',
            [mcpServerPath]
          )
        ];
      }
    })
  );
  
  console.log('MCP Server Definition Provider registered successfully');
}
