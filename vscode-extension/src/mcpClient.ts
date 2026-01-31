import * as vscode from 'vscode';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';

export interface Prompt {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  content: string;
  createdAt: string;
  updatedAt: string;
}

export class MCPClient {
  private client: Client | null = null;
  private transport: StdioClientTransport | null = null;

  constructor(private context: vscode.ExtensionContext) {}

  /**
   * Finds the MCP server path using multiple strategies:
   * 1. Configuration setting (user defined)
   * 2. Bundled server (within extension)
   * 3. Global npm installation
   * 4. Local development path
   */
  private findServerPath(): string {
    // Strategy 1: User configured path
    const configPath = vscode.workspace.getConfiguration('aiPrompts').get<string>('mcpServerPath');
    if (configPath && fs.existsSync(configPath)) {
      console.log('Using configured MCP server path:', configPath);
      return configPath;
    }

    // Strategy 2: Bundled server (server files inside extension)
    const bundledPath = path.join(this.context.extensionPath, 'server', 'index.js');
    if (fs.existsSync(bundledPath)) {
      console.log('Using bundled MCP server:', bundledPath);
      return bundledPath;
    }

    // Strategy 3: Check npx global package
    const globalNpmPaths = [
      // macOS/Linux global npm
      path.join(os.homedir(), '.npm-global', 'lib', 'node_modules', 'mcp-ai-prompts', 'build', 'index.js'),
      path.join('/usr', 'local', 'lib', 'node_modules', 'mcp-ai-prompts', 'build', 'index.js'),
      // Windows global npm
      path.join(process.env.APPDATA || '', 'npm', 'node_modules', 'mcp-ai-prompts', 'build', 'index.js'),
    ];
    
    for (const globalPath of globalNpmPaths) {
      if (fs.existsSync(globalPath)) {
        console.log('Using global npm MCP server:', globalPath);
        return globalPath;
      }
    }

    // Strategy 4: Development - sibling folder or parent folder
    const devPaths = [
      // Sibling to extension folder (monorepo structure) - check both dist and build
      path.join(this.context.extensionPath, '..', 'dist', 'index.js'),
      path.join(this.context.extensionPath, '..', 'build', 'index.js'),
      // Parent folder (for local dev when extension is in vscode-extension/)
      path.join(this.context.extensionPath, '..', '..', 'dist', 'index.js'),
      path.join(this.context.extensionPath, '..', '..', 'build', 'index.js'),
    ];

    for (const devPath of devPaths) {
      const resolvedPath = path.resolve(devPath);
      if (fs.existsSync(resolvedPath)) {
        console.log('Using development MCP server:', resolvedPath);
        return resolvedPath;
      }
    }

    // Fallback: Use npx to run the package (will download if needed)
    throw new Error(
      'MCP server not found. Please install it globally with: npm install -g mcp-ai-prompts\n' +
      'Or configure the path in settings: aiPrompts.mcpServerPath'
    );
  }

  async connect(): Promise<void> {
    try {
      // Find server path using multiple strategies
      const serverPath = this.findServerPath();

      // Create stdio transport
      this.transport = new StdioClientTransport({
        command: 'node',
        args: [serverPath]
      });

      // Create MCP client
      this.client = new Client(
        {
          name: 'vscode-ai-prompts-client',
          version: '1.0.0'
        },
        {
          capabilities: {}
        }
      );

      // Connect to server
      await this.client.connect(this.transport);
      console.log('Connected to MCP server at:', serverPath);
    } catch (error) {
      console.error('Failed to connect to MCP server:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.close();
      this.client = null;
    }
    if (this.transport) {
      await this.transport.close();
      this.transport = null;
    }
  }

  /**
   * Check if the MCP client is connected
   */
  isConnected(): boolean {
    return this.client !== null;
  }

  async listPrompts(): Promise<Prompt[]> {
    if (!this.client) {
      throw new Error('MCP client not connected');
    }

    try {
      const response = await this.client.callTool({
        name: 'list_prompts',
        arguments: { format: 'json' }
      });

      if (response.content && Array.isArray(response.content) && response.content.length > 0) {
        const content = response.content[0] as any;
        if (content.type === 'text') {
          const data = JSON.parse(content.text);
          return data.prompts || [];
        }
      }

      return [];
    } catch (error) {
      console.error('Error listing prompts:', error);
      throw error;
    }
  }

  async getPrompt(id: string): Promise<Prompt | null> {
    if (!this.client) {
      throw new Error('MCP client not connected');
    }

    try {
      const response = await this.client.callTool({
        name: 'get_prompt',
        arguments: { id, format: 'json' }
      });

      if (response.content && Array.isArray(response.content) && response.content.length > 0) {
        const content = response.content[0] as any;
        if (content.type === 'text') {
          const data = JSON.parse(content.text);
          return data.prompt || null;
        }
      }

      return null;
    } catch (error) {
      console.error('Error getting prompt:', error);
      throw error;
    }
  }

  async addPrompt(
    name: string,
    description: string,
    category: string,
    tags: string[],
    content: string
  ): Promise<Prompt> {
    if (!this.client) {
      throw new Error('MCP client not connected');
    }

    try {
      const response = await this.client.callTool({
        name: 'add_prompt',
        arguments: {
          name,
          description,
          category,
          tags,
          content,
          format: 'json'
        }
      });

      if (response.content && Array.isArray(response.content) && response.content.length > 0) {
        const responseContent = response.content[0] as any;
        if (responseContent.type === 'text') {
          const data = JSON.parse(responseContent.text);
          return data.prompt;
        }
      }

      throw new Error('Invalid response from server');
    } catch (error) {
      console.error('Error adding prompt:', error);
      throw error;
    }
  }

  async updatePrompt(
    id: string,
    updates: Partial<Omit<Prompt, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<Prompt> {
    if (!this.client) {
      throw new Error('MCP client not connected');
    }

    try {
      const response = await this.client.callTool({
        name: 'update_prompt',
        arguments: {
          id,
          ...updates,
          format: 'json'
        }
      });

      if (response.content && Array.isArray(response.content) && response.content.length > 0) {
        const content = response.content[0] as any;
        if (content.type === 'text') {
          const data = JSON.parse(content.text);
          return data.prompt;
        }
      }

      throw new Error('Invalid response from server');
    } catch (error) {
      console.error('Error updating prompt:', error);
      throw error;
    }
  }

  async deletePrompt(id: string): Promise<void> {
    if (!this.client) {
      throw new Error('MCP client not connected');
    }

    try {
      await this.client.callTool({
        name: 'delete_prompt',
        arguments: { id, format: 'json' }
      });
    } catch (error) {
      console.error('Error deleting prompt:', error);
      throw error;
    }
  }

  async getCategories(): Promise<string[]> {
    if (!this.client) {
      throw new Error('MCP client not connected');
    }

    try {
      const response = await this.client.callTool({
        name: 'get_categories',
        arguments: { format: 'json' }
      });

      if (response.content && Array.isArray(response.content) && response.content.length > 0) {
        const content = response.content[0] as any;
        if (content.type === 'text') {
          const data = JSON.parse(content.text);
          return data.categories || [];
        }
      }

      return [];
    } catch (error) {
      console.error('Error getting categories:', error);
      throw error;
    }
  }

  async getTags(): Promise<string[]> {
    if (!this.client) {
      throw new Error('MCP client not connected');
    }

    try {
      const response = await this.client.callTool({
        name: 'get_tags',
        arguments: { format: 'json' }
      });

      if (response.content && Array.isArray(response.content) && response.content.length > 0) {
        const content = response.content[0] as any;
        if (content.type === 'text') {
          const data = JSON.parse(content.text);
          return data.tags || [];
        }
      }

      return [];
    } catch (error) {
      console.error('Error getting tags:', error);
      throw error;
    }
  }

  async configureStorage(provider: string, customPath?: string): Promise<void> {
    if (!this.client) {
      throw new Error('MCP client not connected');
    }

    try {
      await this.client.callTool({
        name: 'configure_storage',
        arguments: {
          provider,
          ...(customPath && { customPath })
        }
      });
    } catch (error) {
      console.error('Error configuring storage:', error);
      throw error;
    }
  }

  async listStorageProviders(): Promise<any[]> {
    if (!this.client) {
      throw new Error('MCP client not connected');
    }

    try {
      const response = await this.client.callTool({
        name: 'list_storage_providers',
        arguments: { format: 'json' }
      });

      if (response.content && Array.isArray(response.content) && response.content.length > 0) {
        const content = response.content[0] as any;
        if (content.type === 'text') {
          const data = JSON.parse(content.text);
          return data.providers || [];
        }
      }

      return [];
    } catch (error) {
      console.error('Error listing storage providers:', error);
      throw error;
    }
  }
}
