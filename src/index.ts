#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ErrorCode,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import { loadPrompts, savePrompts, generateId } from './storage.js';
import { getStorageFactory } from './storage/StorageFactory.js';
import { StorageConfig } from './storage/config.js';
import {
  Prompt,
  AddPromptParams,
  UpdatePromptParams,
  ListPromptsParams,
} from './types.js';
import {
  formatPromptListCompact,
  estimateTokens,
  needsCompaction,
  extractSummary,
} from './compaction.js';

/**
 * Cria uma instância do servidor MCP
 */
const server = new Server(
  {
    name: 'ai-prompts-management',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

/**
 * Handler para listar as ferramentas disponíveis
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'add_prompt',
        description:
          'Adiciona um novo prompt de AI à coleção. Requer nome, descrição, conteúdo, categoria e opcionalmente tags.',
        inputSchema: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'Nome identificador do prompt',
            },
            description: {
              type: 'string',
              description: 'Descrição do propósito do prompt',
            },
            content: {
              type: 'string',
              description: 'Conteúdo completo do prompt',
            },
            category: {
              type: 'string',
              description:
                'Categoria do prompt (ex: development, writing, analysis)',
            },
            tags: {
              type: 'array',
              items: { type: 'string' },
              description: 'Tags para organizar o prompt (opcional)',
            },
          },
          required: ['name', 'description', 'content', 'category'],
        },
      },
      {
        name: 'list_prompts',
        description:
          'Lista prompts salvos (retorna apenas metadata para eficiência de contexto). Suporta filtros por categoria, tags ou busca. Use get_prompt para conteúdo completo.',
        inputSchema: {
          type: 'object',
          properties: {
            category: {
              type: 'string',
              description: 'Filtrar por categoria específica (opcional)',
            },
            tags: {
              type: 'array',
              items: { type: 'string' },
              description: 'Filtrar por tags específicas (opcional)',
            },
            search: {
              type: 'string',
              description:
                'Buscar por palavra-chave no nome ou descrição (opcional)',
            },
            compact: {
              type: 'boolean',
              description: 'Se true (padrão), retorna apenas metadata. Se false, inclui descrição completa.',
            },
          },
        },
      },
      {
        name: 'get_prompt',
        description:
          'Obtém o conteúdo COMPLETO de um prompt pelo ID ou nome. Use apenas quando precisar do conteúdo inteiro.',
        inputSchema: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'ID do prompt (use id OU name)',
            },
            name: {
              type: 'string',
              description: 'Nome do prompt (use id OU name)',
            },
          },
        },
      },
      {
        name: 'get_prompt_summary',
        description:
          'Obtém apenas resumo/descrição de um prompt (eficiente para contexto). Use get_prompt para conteúdo completo.',
        inputSchema: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'ID do prompt',
            },
          },
          required: ['id'],
        },
      },
      {
        name: 'update_prompt',
        description:
          'Atualiza um prompt existente. Pode atualizar qualquer campo.',
        inputSchema: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'ID do prompt a ser atualizado',
            },
            name: {
              type: 'string',
              description: 'Novo nome (opcional)',
            },
            description: {
              type: 'string',
              description: 'Nova descrição (opcional)',
            },
            content: {
              type: 'string',
              description: 'Novo conteúdo (opcional)',
            },
            category: {
              type: 'string',
              description: 'Nova categoria (opcional)',
            },
            tags: {
              type: 'array',
              items: { type: 'string' },
              description: 'Novas tags (opcional)',
            },
          },
          required: ['id'],
        },
      },
      {
        name: 'delete_prompt',
        description: 'Remove um prompt da coleção pelo ID.',
        inputSchema: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'ID do prompt a ser removido',
            },
          },
          required: ['id'],
        },
      },
      {
        name: 'get_categories',
        description: 'Lista todas as categorias únicas dos prompts salvos.',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'get_tags',
        description: 'Lista todas as tags únicas usadas nos prompts.',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'get_context_stats',
        description:
          'Retorna estatísticas de uso de contexto (tokens estimados por categoria). Útil para planejamento de context budget.',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'list_storage_providers',
        description:
          'Lista todos os storage providers disponíveis, indicando qual está ativo e quais estão disponíveis no sistema.',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'get_storage_config',
        description:
          'Retorna a configuração atual do storage (provider ativo, caminho, última sincronização).',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'configure_storage',
        description:
          'Configura o storage provider e caminho. Permite trocar entre local, OneDrive, Google Drive, etc.',
        inputSchema: {
          type: 'object',
          properties: {
            provider: {
              type: 'string',
              enum: ['local', 'onedrive', 'googledrive', 'dropbox', 'icloud'],
              description: 'Provider de storage a usar',
            },
            path: {
              type: 'string',
              description: 'Caminho absoluto do arquivo (opcional, usa padrão do provider)',
            },
            migrate: {
              type: 'boolean',
              description: 'Se true, migra dados do storage atual (default: false)',
            },
          },
          required: ['provider'],
        },
      },
    ],
  };
});

/**
 * Handler para executar as ferramentas
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    const { name, arguments: args } = request.params;

    switch (name) {
      case 'add_prompt': {
        const params = args as unknown as AddPromptParams;
        const prompts = await loadPrompts();

        // Verifica se já existe um prompt com o mesmo nome
        if (prompts.some((p) => p.name === params.name)) {
          throw new McpError(
            ErrorCode.InvalidRequest,
            `Já existe um prompt com o nome "${params.name}"`
          );
        }

        const newPrompt: Prompt = {
          id: generateId(),
          name: params.name,
          description: params.description,
          content: params.content,
          category: params.category,
          tags: params.tags || [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        prompts.push(newPrompt);
        await savePrompts(prompts);

        return {
          content: [
            {
              type: 'text',
              text: `✅ Prompt "${newPrompt.name}" adicionado com sucesso!\n\nID: ${newPrompt.id}\nCategoria: ${newPrompt.category}\nTags: ${newPrompt.tags.join(', ') || 'nenhuma'}`,
            },
          ],
        };
      }

      case 'list_prompts': {
        const params = args as unknown as ListPromptsParams & { compact?: boolean };
        let prompts = await loadPrompts();
        const useCompact = params.compact !== false; // Default to compact mode

        // Aplicar filtros
        if (params.category) {
          prompts = prompts.filter(
            (p) => p.category.toLowerCase() === params.category!.toLowerCase()
          );
        }

        if (params.tags && params.tags.length > 0) {
          prompts = prompts.filter((p) =>
            params.tags!.some((tag) =>
              p.tags.some((t) => t.toLowerCase() === tag.toLowerCase())
            )
          );
        }

        if (params.search) {
          const searchLower = params.search.toLowerCase();
          prompts = prompts.filter(
            (p) =>
              p.name.toLowerCase().includes(searchLower) ||
              p.description.toLowerCase().includes(searchLower)
          );
        }

        if (prompts.length === 0) {
          return {
            content: [
              {
                type: 'text',
                text: 'Nenhum prompt encontrado com os critérios especificados.',
              },
            ],
          };
        }

        // Progressive Context Enrichment: return compact by default
        if (useCompact) {
          return {
            content: [
              {
                type: 'text',
                text: formatPromptListCompact(prompts),
              },
            ],
          };
        }

        // Full mode (backward compatibility)
        const promptList = prompts
          .map(
            (p) =>
              `📌 **${p.name}** (${p.id})\n` +
              `   Categoria: ${p.category}\n` +
              `   Tags: ${p.tags.join(', ') || 'nenhuma'}\n` +
              `   Descrição: ${p.description}\n` +
              `   Criado: ${new Date(p.createdAt).toLocaleDateString('pt-BR')}\n`
          )
          .join('\n');

        return {
          content: [
            {
              type: 'text',
              text: `📚 **${prompts.length} prompt(s) encontrado(s)**\n\n${promptList}`,
            },
          ],
        };
      }

      case 'get_prompt': {
        const params = args as unknown as { id?: string; name?: string };
        const prompts = await loadPrompts();

        let prompt: Prompt | undefined;

        if (params.id) {
          prompt = prompts.find((p) => p.id === params.id);
        } else if (params.name) {
          prompt = prompts.find(
            (p) => p.name.toLowerCase() === params.name!.toLowerCase()
          );
        } else {
          throw new McpError(
            ErrorCode.InvalidRequest,
            'Forneça o ID ou nome do prompt'
          );
        }

        if (!prompt) {
          throw new McpError(
            ErrorCode.InvalidRequest,
            'Prompt não encontrado'
          );
        }

        // Add token estimation for context awareness
        const tokenEstimate = estimateTokens(prompt.content);
        const contentWarning = tokenEstimate > 1000 
          ? `\n\n⚠️ **Conteúdo extenso** (~${tokenEstimate} tokens). Considere usar get_prompt_summary para resumo.`
          : '';

        return {
          content: [
            {
              type: 'text',
              text:
                `📝 **${prompt.name}**\n\n` +
                `**Descrição:** ${prompt.description}\n\n` +
                `**Categoria:** ${prompt.category}\n` +
                `**Tags:** ${prompt.tags.join(', ') || 'nenhuma'}\n\n` +
                `**Conteúdo:**\n\n${prompt.content}\n\n` +
                `---\n` +
                `ID: ${prompt.id}\n` +
                `Criado: ${new Date(prompt.createdAt).toLocaleDateString('pt-BR')}\n` +
                `Atualizado: ${new Date(prompt.updatedAt).toLocaleDateString('pt-BR')}` +
                contentWarning,
            },
          ],
        };
      }

      case 'get_prompt_summary': {
        const params = args as unknown as { id: string };
        const prompts = await loadPrompts();
        const prompt = prompts.find((p) => p.id === params.id);

        if (!prompt) {
          throw new McpError(
            ErrorCode.InvalidRequest,
            'Prompt não encontrado'
          );
        }

        // Progressive disclosure: return summary only
        const contentPreview = extractSummary(prompt.content, 200);
        const tokenEstimate = estimateTokens(prompt.content);

        return {
          content: [
            {
              type: 'text',
              text:
                `📋 **${prompt.name}** (Resumo)\n\n` +
                `**Descrição:** ${prompt.description}\n\n` +
                `**Categoria:** ${prompt.category}\n` +
                `**Tags:** ${prompt.tags.join(', ') || 'nenhuma'}\n\n` +
                `**Preview:** ${contentPreview}\n\n` +
                `---\n` +
                `Tokens estimados: ~${tokenEstimate}\n` +
                `💡 Use \`get_prompt\` com id "${prompt.id}" para conteúdo completo.`,
            },
          ],
        };
      }

      case 'update_prompt': {
        const params = args as unknown as UpdatePromptParams;
        const prompts = await loadPrompts();

        const promptIndex = prompts.findIndex((p) => p.id === params.id);

        if (promptIndex === -1) {
          throw new McpError(
            ErrorCode.InvalidRequest,
            'Prompt não encontrado'
          );
        }

        const updatedPrompt: Prompt = {
          ...prompts[promptIndex],
          ...(params.name && { name: params.name }),
          ...(params.description && { description: params.description }),
          ...(params.content && { content: params.content }),
          ...(params.category && { category: params.category }),
          ...(params.tags && { tags: params.tags }),
          updatedAt: new Date().toISOString(),
        };

        prompts[promptIndex] = updatedPrompt;
        await savePrompts(prompts);

        return {
          content: [
            {
              type: 'text',
              text: `✅ Prompt "${updatedPrompt.name}" atualizado com sucesso!`,
            },
          ],
        };
      }

      case 'delete_prompt': {
        const params = args as unknown as { id: string };
        const prompts = await loadPrompts();

        const promptIndex = prompts.findIndex((p) => p.id === params.id);

        if (promptIndex === -1) {
          throw new McpError(
            ErrorCode.InvalidRequest,
            'Prompt não encontrado'
          );
        }

        const deletedPrompt = prompts[promptIndex];
        prompts.splice(promptIndex, 1);
        await savePrompts(prompts);

        return {
          content: [
            {
              type: 'text',
              text: `🗑️ Prompt "${deletedPrompt.name}" removido com sucesso!`,
            },
          ],
        };
      }

      case 'get_categories': {
        const prompts = await loadPrompts();
        const categories = [...new Set(prompts.map((p) => p.category))].sort();

        if (categories.length === 0) {
          return {
            content: [
              {
                type: 'text',
                text: 'Nenhuma categoria encontrada. Adicione alguns prompts primeiro!',
              },
            ],
          };
        }

        return {
          content: [
            {
              type: 'text',
              text: `🏷️ **Categorias disponíveis:**\n\n${categories.map((c) => `• ${c}`).join('\n')}`,
            },
          ],
        };
      }

      case 'get_tags': {
        const prompts = await loadPrompts();
        const allTags = prompts.flatMap((p) => p.tags);
        const uniqueTags = [...new Set(allTags)].sort();

        if (uniqueTags.length === 0) {
          return {
            content: [
              {
                type: 'text',
                text: 'Nenhuma tag encontrada. Adicione tags aos seus prompts!',
              },
            ],
          };
        }

        return {
          content: [
            {
              type: 'text',
              text: `🔖 **Tags disponíveis:**\n\n${uniqueTags.map((t) => `• ${t}`).join('\n')}`,
            },
          ],
        };
      }

      case 'get_context_stats': {
        const prompts = await loadPrompts();
        
        // Calculate stats per category
        const categoryStats: Record<string, { count: number; tokens: number }> = {};
        let totalTokens = 0;

        for (const prompt of prompts) {
          const tokens = estimateTokens(prompt.content);
          totalTokens += tokens;

          if (!categoryStats[prompt.category]) {
            categoryStats[prompt.category] = { count: 0, tokens: 0 };
          }
          categoryStats[prompt.category].count++;
          categoryStats[prompt.category].tokens += tokens;
        }

        // Format output
        const categoryList = Object.entries(categoryStats)
          .sort((a, b) => b[1].tokens - a[1].tokens)
          .map(([cat, stats]) => 
            `• **${cat}**: ${stats.count} prompt(s), ~${stats.tokens} tokens`
          )
          .join('\n');

        // Identify large prompts that might need compaction
        const largePrompts = prompts
          .filter(p => needsCompaction(p.content))
          .map(p => `• ${p.name}: ~${estimateTokens(p.content)} tokens`)
          .join('\n');

        return {
          content: [
            {
              type: 'text',
              text:
                `📊 **Context Stats**\n\n` +
                `**Total:** ${prompts.length} prompts, ~${totalTokens} tokens\n\n` +
                `**Por Categoria:**\n${categoryList}\n\n` +
                (largePrompts ? `**⚠️ Prompts Grandes (>1000 tokens):**\n${largePrompts}\n\n` : '') +
                `💡 Use filtros em \`list_prompts\` para reduzir uso de contexto.`,
            },
          ],
        };
      }

      case 'list_storage_providers': {
        const factory = getStorageFactory();
        const providers = await factory.listProviders();

        const providerList = providers
          .map(
            (p) =>
              `${p.active ? '✅' : '⭕'} **${p.name}** (${p.type})\n` +
              `   ${p.available ? '✓ Disponível' : '✗ Não disponível'}\n` +
              `   ${p.active ? '← Ativo no momento' : ''}`
          )
          .join('\n');

        return {
          content: [
            {
              type: 'text',
              text: `☁️ **Storage Providers**\n\n${providerList}`,
            },
          ],
        };
      }

      case 'get_storage_config': {
        const factory = getStorageFactory();
        const config = factory.getConfig();

        const lastSync = config.lastSyncAt
          ? new Date(config.lastSyncAt).toLocaleString('pt-BR')
          : 'Nunca';

        return {
          content: [
            {
              type: 'text',
              text:
                `⚙️ **Configuração de Storage**\n\n` +
                `**Provider:** ${config.provider}\n` +
                `**Caminho:** ${config.path}\n` +
                `**Auto Sync:** ${config.autoSync ? 'Sim' : 'Não'}\n` +
                `**Fallback Local:** ${config.fallbackToLocal ? 'Sim' : 'Não'}\n` +
                `**Última Sincronização:** ${lastSync}\n` +
                (config.metadata?.deviceName ? `**Dispositivo:** ${config.metadata.deviceName}\n` : ''),
            },
          ],
        };
      }

      case 'configure_storage': {
        const params = args as unknown as {
          provider: string;
          path?: string;
          migrate?: boolean;
        };

        const factory = getStorageFactory();
        const currentConfig = factory.getConfig();
        const oldPath = currentConfig.path;
        const oldProvider = currentConfig.provider;

        // Obtém provider
        const providers = await factory.listProviders();
        const targetProvider = providers.find((p) => p.type === params.provider);

        if (!targetProvider) {
          throw new McpError(
            ErrorCode.InvalidRequest,
            `Provider desconhecido: ${params.provider}`
          );
        }

        if (!targetProvider.available) {
          throw new McpError(
            ErrorCode.InvalidRequest,
            `Provider ${params.provider} não está disponível no sistema`
          );
        }

        // Obtém caminho (usa padrão se não fornecido)
        const providerInstance = factory['providers'].get(params.provider as any);
        const targetPath = params.path || providerInstance!.getDefaultPath();

        // Cria nova configuração
        const newConfig: StorageConfig = {
          provider: params.provider as any,
          path: targetPath,
          autoSync: true,
          fallbackToLocal: true,
        };

        // Aplica configuração
        await factory.setConfig(newConfig);

        // Migra dados se solicitado
        if (params.migrate && oldPath !== targetPath) {
          try {
            await factory.migrateData(oldPath, targetPath, oldProvider as any);
            return {
              content: [
                {
                  type: 'text',
                  text:
                    `✅ Storage configurado com sucesso!\n\n` +
                    `**Provider:** ${params.provider}\n` +
                    `**Caminho:** ${targetPath}\n` +
                    `**Dados migrados:** Sim\n\n` +
                    `Seus prompts agora estão salvos em ${targetPath}`,
                },
              ],
            };
          } catch (error) {
            return {
              content: [
                {
                  type: 'text',
                  text:
                    `⚠️ Storage configurado mas migração falhou\n\n` +
                    `**Provider:** ${params.provider}\n` +
                    `**Caminho:** ${targetPath}\n` +
                    `**Erro:** ${error}\n\n` +
                    `Você precisará migrar os dados manualmente.`,
                },
              ],
            };
          }
        }

        return {
          content: [
            {
              type: 'text',
              text:
                `✅ Storage configurado com sucesso!\n\n` +
                `**Provider:** ${params.provider}\n` +
                `**Caminho:** ${targetPath}\n\n` +
                (oldPath !== targetPath
                  ? `💡 **Dica:** Use \`configure_storage\` com \`migrate: true\` para migrar seus dados automaticamente.`
                  : ''),
            },
          ],
        };
      }

      default:
        throw new McpError(
          ErrorCode.MethodNotFound,
          `Ferramenta desconhecida: ${name}`
        );
    }
  } catch (error) {
    if (error instanceof McpError) {
      throw error;
    }
    throw new McpError(
      ErrorCode.InternalError,
      `Erro ao executar ferramenta: ${error}`
    );
  }
});

/**
 * Inicia o servidor
 */
async function main() {
  // Inicializa o storage factory
  const factory = getStorageFactory();
  await factory.initialize();

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('MCP AI Prompts Management Server rodando...');
}

main().catch((error) => {
  console.error('Erro ao iniciar servidor:', error);
  process.exit(1);
});
