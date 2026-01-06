import * as vscode from 'vscode';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import * as path from 'path';

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

  async connect(): Promise<void> {
    try {
      // Path to the MCP server
      const serverPath = path.join(
        this.context.extensionPath,
        '..',
        'build',
        'index.js'
      );

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
      console.log('Connected to MCP server');
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

  async listPrompts(): Promise<Prompt[]> {
    if (!this.client) {
      throw new Error('MCP client not connected');
    }

    try {
      const response = await this.client.callTool({
        name: 'list_prompts',
        arguments: {}
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
        arguments: { id }
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
          content
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
          ...updates
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
        arguments: { id }
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
        arguments: {}
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
        arguments: {}
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
        arguments: {}
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
