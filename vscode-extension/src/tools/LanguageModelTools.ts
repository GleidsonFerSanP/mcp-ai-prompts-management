import * as vscode from 'vscode';
import { MCPClient } from '../mcpClient';

/**
 * Registers Language Model Tools that expose MCP functionality to Copilot
 * 
 * These tools allow Copilot to:
 * - List and search prompts
 * - Get specific prompt content
 * - Add new prompts
 * 
 * @returns true if tools were registered successfully, false otherwise
 */
export function registerLanguageModelTools(
  context: vscode.ExtensionContext,
  mcpClient: MCPClient
): boolean {
  // Check if user explicitly disabled MCP
  const config = vscode.workspace.getConfiguration('aiPrompts');
  const mcpDisabled = config.get<boolean>('disableMCP', false);
  
  if (mcpDisabled) {
    console.log('Language Model Tools registration skipped: disabled via aiPrompts.disableMCP setting');
    return false;
  }

  try {
    // Check if LM API is available
    if (typeof vscode.lm?.registerTool !== 'function') {
      console.log('Language Model Tools API not available in this VS Code version');
      return false;
    }

  // Tool: List Prompts
  const listPromptsTool = vscode.lm.registerTool<{ category?: string; search?: string }>(
    'mcp-ai-prompts_listPrompts',
    {
      async invoke(options, token) {
        try {
          if (!mcpClient.isConnected()) {
            await mcpClient.connect();
          }

          const prompts = await mcpClient.listPrompts();
          let filtered = prompts;

          // Apply filters
          if (options.input.category) {
            filtered = filtered.filter(p => 
              p.category.toLowerCase() === options.input.category!.toLowerCase()
            );
          }

          if (options.input.search) {
            const search = options.input.search.toLowerCase();
            filtered = filtered.filter(p =>
              p.name.toLowerCase().includes(search) ||
              p.description?.toLowerCase().includes(search) ||
              p.tags?.some(t => t.toLowerCase().includes(search))
            );
          }

          const result = filtered.map(p => ({
            id: p.id,
            name: p.name,
            description: p.description,
            category: p.category,
            tags: p.tags
          }));

          return new vscode.LanguageModelToolResult([
            new vscode.LanguageModelTextPart(JSON.stringify(result, null, 2))
          ]);
        } catch (error) {
          return new vscode.LanguageModelToolResult([
            new vscode.LanguageModelTextPart(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
          ]);
        }
      },

      prepareInvocation(options, token) {
        const search = options.input.search ? ` matching "${options.input.search}"` : '';
        const category = options.input.category ? ` in category "${options.input.category}"` : '';
        return {
          invocationMessage: `Listing prompts${category}${search}...`
        };
      }
    }
  );

  // Tool: Get Prompt
  const getPromptTool = vscode.lm.registerTool<{ id?: string; name?: string }>(
    'mcp-ai-prompts_getPrompt',
    {
      async invoke(options, token) {
        try {
          if (!mcpClient.isConnected()) {
            await mcpClient.connect();
          }

          let prompt;
          
          if (options.input.id) {
            prompt = await mcpClient.getPrompt(options.input.id);
          } else if (options.input.name) {
            const prompts = await mcpClient.listPrompts();
            const found = prompts.find(p => 
              p.name.toLowerCase() === options.input.name!.toLowerCase() ||
              p.name.toLowerCase().includes(options.input.name!.toLowerCase())
            );
            if (found) {
              prompt = await mcpClient.getPrompt(found.id);
            }
          }

          if (!prompt) {
            return new vscode.LanguageModelToolResult([
              new vscode.LanguageModelTextPart('Prompt not found')
            ]);
          }

          return new vscode.LanguageModelToolResult([
            new vscode.LanguageModelTextPart(JSON.stringify({
              id: prompt.id,
              name: prompt.name,
              description: prompt.description,
              category: prompt.category,
              tags: prompt.tags,
              content: prompt.content,
              createdAt: prompt.createdAt,
              updatedAt: prompt.updatedAt
            }, null, 2))
          ]);
        } catch (error) {
          return new vscode.LanguageModelToolResult([
            new vscode.LanguageModelTextPart(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
          ]);
        }
      },

      prepareInvocation(options, token) {
        const identifier = options.input.name || options.input.id || 'unknown';
        return {
          invocationMessage: `Getting prompt "${identifier}"...`
        };
      }
    }
  );

  // Tool: Search Prompts
  const searchPromptsTool = vscode.lm.registerTool<{ query: string }>(
    'mcp-ai-prompts_searchPrompts',
    {
      async invoke(options, token) {
        try {
          if (!mcpClient.isConnected()) {
            await mcpClient.connect();
          }

          const prompts = await mcpClient.listPrompts();
          const query = options.input.query.toLowerCase();

          const matches = prompts.filter(p =>
            p.name.toLowerCase().includes(query) ||
            p.description?.toLowerCase().includes(query) ||
            p.content.toLowerCase().includes(query) ||
            p.category.toLowerCase().includes(query) ||
            p.tags?.some(t => t.toLowerCase().includes(query))
          );

          const result = matches.map(p => ({
            id: p.id,
            name: p.name,
            description: p.description,
            category: p.category,
            tags: p.tags,
            // Include a preview of content
            contentPreview: p.content.substring(0, 200) + (p.content.length > 200 ? '...' : '')
          }));

          return new vscode.LanguageModelToolResult([
            new vscode.LanguageModelTextPart(JSON.stringify({
              query: options.input.query,
              count: result.length,
              prompts: result
            }, null, 2))
          ]);
        } catch (error) {
          return new vscode.LanguageModelToolResult([
            new vscode.LanguageModelTextPart(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
          ]);
        }
      },

      prepareInvocation(options, token) {
        return {
          invocationMessage: `Searching prompts for "${options.input.query}"...`
        };
      }
    }
  );

  // Tool: Get Categories
  const getCategoriesTool = vscode.lm.registerTool<Record<string, never>>(
    'mcp-ai-prompts_getCategories',
    {
      async invoke(options, token) {
        try {
          if (!mcpClient.isConnected()) {
            await mcpClient.connect();
          }

          const categories = await mcpClient.getCategories();

          return new vscode.LanguageModelToolResult([
            new vscode.LanguageModelTextPart(JSON.stringify(categories, null, 2))
          ]);
        } catch (error) {
          return new vscode.LanguageModelToolResult([
            new vscode.LanguageModelTextPart(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
          ]);
        }
      },

      prepareInvocation(options, token) {
        return {
          invocationMessage: 'Getting prompt categories...'
        };
      }
    }
  );

  // Tool: Get Tags
  const getTagsTool = vscode.lm.registerTool<Record<string, never>>(
    'mcp-ai-prompts_getTags',
    {
      async invoke(options, token) {
        try {
          if (!mcpClient.isConnected()) {
            await mcpClient.connect();
          }

          const tags = await mcpClient.getTags();

          return new vscode.LanguageModelToolResult([
            new vscode.LanguageModelTextPart(JSON.stringify(tags, null, 2))
          ]);
        } catch (error) {
          return new vscode.LanguageModelToolResult([
            new vscode.LanguageModelTextPart(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
          ]);
        }
      },

      prepareInvocation(options, token) {
        return {
          invocationMessage: 'Getting prompt tags...'
        };
      }
    }
  );

  // Tool: Add Prompt
  const addPromptTool = vscode.lm.registerTool<{
    name: string;
    description?: string;
    category?: string;
    tags?: string[];
    content: string;
  }>(
    'mcp-ai-prompts_addPrompt',
    {
      async invoke(options, token) {
        try {
          if (!mcpClient.isConnected()) {
            await mcpClient.connect();
          }

          const result = await mcpClient.addPrompt(
            options.input.name,
            options.input.description || '',
            options.input.category || 'General',
            options.input.tags || [],
            options.input.content
          );

          // Refresh the tree view
          vscode.commands.executeCommand('aiPrompts.refreshPrompts');

          return new vscode.LanguageModelToolResult([
            new vscode.LanguageModelTextPart(JSON.stringify({
              success: true,
              message: `Prompt "${options.input.name}" saved successfully`,
              prompt: {
                id: result.id,
                name: options.input.name,
                category: options.input.category || 'General',
                tags: options.input.tags || []
              }
            }, null, 2))
          ]);
        } catch (error) {
          return new vscode.LanguageModelToolResult([
            new vscode.LanguageModelTextPart(JSON.stringify({
              success: false,
              error: error instanceof Error ? error.message : 'Unknown error'
            }, null, 2))
          ]);
        }
      },

      prepareInvocation(options, token) {
        return {
          invocationMessage: `Saving prompt "${options.input.name}" to library...`,
          confirmationMessages: {
            title: 'Save Prompt',
            message: `Save prompt "${options.input.name}" to your library in category "${options.input.category || 'General'}"?`
          }
        };
      }
    }
  );

  // Tool: Update Prompt
  const updatePromptTool = vscode.lm.registerTool<{
    id?: string;
    name?: string;
    newName?: string;
    description?: string;
    category?: string;
    tags?: string[];
    content?: string;
  }>(
    'mcp-ai-prompts_updatePrompt',
    {
      async invoke(options, token) {
        try {
          if (!mcpClient.isConnected()) {
            await mcpClient.connect();
          }

          // Find prompt by id or name
          let promptId = options.input.id;
          
          if (!promptId && options.input.name) {
            const prompts = await mcpClient.listPrompts();
            const found = prompts.find(p => 
              p.name.toLowerCase() === options.input.name!.toLowerCase()
            );
            if (found) {
              promptId = found.id;
            }
          }

          if (!promptId) {
            return new vscode.LanguageModelToolResult([
              new vscode.LanguageModelTextPart(JSON.stringify({
                success: false,
                error: 'Prompt not found'
              }, null, 2))
            ]);
          }

          // Build update object with only provided fields
          const updates: Record<string, unknown> = {};
          if (options.input.newName) updates.name = options.input.newName;
          if (options.input.description !== undefined) updates.description = options.input.description;
          if (options.input.category) updates.category = options.input.category;
          if (options.input.tags) updates.tags = options.input.tags;
          if (options.input.content) updates.content = options.input.content;

          await mcpClient.updatePrompt(promptId, updates);

          // Refresh the tree view
          vscode.commands.executeCommand('aiPrompts.refreshPrompts');

          return new vscode.LanguageModelToolResult([
            new vscode.LanguageModelTextPart(JSON.stringify({
              success: true,
              message: `Prompt updated successfully`,
              promptId: promptId
            }, null, 2))
          ]);
        } catch (error) {
          return new vscode.LanguageModelToolResult([
            new vscode.LanguageModelTextPart(JSON.stringify({
              success: false,
              error: error instanceof Error ? error.message : 'Unknown error'
            }, null, 2))
          ]);
        }
      },

      prepareInvocation(options, token) {
        const identifier = options.input.name || options.input.id || 'prompt';
        return {
          invocationMessage: `Updating prompt "${identifier}"...`,
          confirmationMessages: {
            title: 'Update Prompt',
            message: `Update prompt "${identifier}"?`
          }
        };
      }
    }
  );

  // Tool: Delete Prompt
  const deletePromptTool = vscode.lm.registerTool<{
    id?: string;
    name?: string;
  }>(
    'mcp-ai-prompts_deletePrompt',
    {
      async invoke(options, token) {
        try {
          if (!mcpClient.isConnected()) {
            await mcpClient.connect();
          }

          // Find prompt by id or name
          let promptId = options.input.id;
          let promptName = options.input.name;
          
          if (!promptId && options.input.name) {
            const prompts = await mcpClient.listPrompts();
            const found = prompts.find(p => 
              p.name.toLowerCase() === options.input.name!.toLowerCase()
            );
            if (found) {
              promptId = found.id;
              promptName = found.name;
            }
          }

          if (!promptId) {
            return new vscode.LanguageModelToolResult([
              new vscode.LanguageModelTextPart(JSON.stringify({
                success: false,
                error: 'Prompt not found'
              }, null, 2))
            ]);
          }

          await mcpClient.deletePrompt(promptId);

          // Refresh the tree view
          vscode.commands.executeCommand('aiPrompts.refreshPrompts');

          return new vscode.LanguageModelToolResult([
            new vscode.LanguageModelTextPart(JSON.stringify({
              success: true,
              message: `Prompt "${promptName}" deleted successfully`
            }, null, 2))
          ]);
        } catch (error) {
          return new vscode.LanguageModelToolResult([
            new vscode.LanguageModelTextPart(JSON.stringify({
              success: false,
              error: error instanceof Error ? error.message : 'Unknown error'
            }, null, 2))
          ]);
        }
      },

      prepareInvocation(options, token) {
        const identifier = options.input.name || options.input.id || 'prompt';
        return {
          invocationMessage: `Deleting prompt "${identifier}"...`,
          confirmationMessages: {
            title: 'Delete Prompt',
            message: `Are you sure you want to delete prompt "${identifier}"? This cannot be undone.`
          }
        };
      }
    }
  );

  // Tool: Improve Prompt
  const improvePromptTool = vscode.lm.registerTool<{
    promptContent?: string;
    promptName?: string;
    focus?: string;
  }>(
    'mcp-ai-prompts_improvePrompt',
    {
      async invoke(options, token) {
        try {
          let content = options.input.promptContent;
          let originalPrompt = null;

          // If promptName provided, fetch from library
          if (options.input.promptName && !content) {
            if (!mcpClient.isConnected()) {
              await mcpClient.connect();
            }

            const prompts = await mcpClient.listPrompts();
            const found = prompts.find(p => 
              p.name.toLowerCase() === options.input.promptName!.toLowerCase() ||
              p.name.toLowerCase().includes(options.input.promptName!.toLowerCase())
            );

            if (found) {
              originalPrompt = await mcpClient.getPrompt(found.id);
              content = originalPrompt.content;
            }
          }

          if (!content) {
            return new vscode.LanguageModelToolResult([
              new vscode.LanguageModelTextPart(JSON.stringify({
                success: false,
                error: 'No prompt content provided. Please provide promptContent or a valid promptName.'
              }, null, 2))
            ]);
          }

          // Analyze the prompt and provide improvement suggestions
          const analysis = analyzePrompt(content, options.input.focus);

          return new vscode.LanguageModelToolResult([
            new vscode.LanguageModelTextPart(JSON.stringify({
              success: true,
              originalPrompt: originalPrompt ? {
                id: originalPrompt.id,
                name: originalPrompt.name,
                category: originalPrompt.category
              } : null,
              analysis: analysis,
              instructions: 'Based on this analysis, you can suggest improvements and then use mcp-ai-prompts_updatePrompt (if improving existing) or mcp-ai-prompts_addPrompt (if saving as new) to save the improved version.'
            }, null, 2))
          ]);
        } catch (error) {
          return new vscode.LanguageModelToolResult([
            new vscode.LanguageModelTextPart(JSON.stringify({
              success: false,
              error: error instanceof Error ? error.message : 'Unknown error'
            }, null, 2))
          ]);
        }
      },

      prepareInvocation(options, token) {
        const target = options.input.promptName || 'provided prompt';
        return {
          invocationMessage: `Analyzing prompt "${target}" for improvements...`
        };
      }
    }
  );

  // Register all tools
  context.subscriptions.push(
    listPromptsTool,
    getPromptTool,
    searchPromptsTool,
    getCategoriesTool,
    getTagsTool,
    addPromptTool,
    updatePromptTool,
    deletePromptTool,
    improvePromptTool
  );

  console.log('Language Model Tools registered: listPrompts, getPrompt, searchPrompts, getCategories, getTags, addPrompt, updatePrompt, deletePrompt, improvePrompt');
  return true;
  } catch (error) {
    // LM Tools registration failed - this can happen if:
    // - Enterprise security policies block LM APIs
    // - VS Code API changed
    // - Other runtime issues
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`Language Model Tools registration failed: ${errorMessage}`);
    console.log('Extension will continue without Language Model Tools');
    console.log('All other features (prompts management, chat participant, etc.) will work normally');
    return false;
  }
}

/**
 * Analyze a prompt and provide improvement suggestions
 */
function analyzePrompt(content: string, focus?: string): {
  score: number;
  strengths: string[];
  improvements: string[];
  suggestions: {
    clarity?: string;
    specificity?: string;
    structure?: string;
    examples?: string;
    constraints?: string;
  };
  promptType: string;
  wordCount: number;
} {
  const wordCount = content.split(/\s+/).length;
  const hasExamples = /example|for instance|e\.g\.|such as|like this/i.test(content);
  const hasConstraints = /must|should|always|never|don't|do not|important|required/i.test(content);
  const hasPersona = /you are|act as|behave as|role:|persona:/i.test(content);
  const hasSteps = /step \d|first,|then,|finally,|1\.|2\.|3\./i.test(content);
  const hasContext = /context:|background:|given:|assuming/i.test(content);
  const hasOutput = /output:|format:|respond with|return:/i.test(content);

  const strengths: string[] = [];
  const improvements: string[] = [];

  // Analyze strengths
  if (hasExamples) strengths.push('Includes examples for clarity');
  if (hasConstraints) strengths.push('Has clear constraints/requirements');
  if (hasPersona) strengths.push('Defines a persona/role');
  if (hasSteps) strengths.push('Uses step-by-step structure');
  if (hasContext) strengths.push('Provides context');
  if (hasOutput) strengths.push('Specifies output format');
  if (wordCount > 50) strengths.push('Detailed instructions');

  // Analyze improvements needed
  if (!hasExamples) improvements.push('Add examples to clarify expectations');
  if (!hasConstraints) improvements.push('Add constraints to guide behavior');
  if (!hasPersona) improvements.push('Consider adding a persona/role');
  if (!hasSteps && wordCount > 100) improvements.push('Consider breaking into steps');
  if (!hasContext) improvements.push('Add context for better understanding');
  if (!hasOutput) improvements.push('Specify expected output format');
  if (wordCount < 20) improvements.push('Prompt may be too brief - add more detail');
  if (wordCount > 500) improvements.push('Consider making more concise');

  // Determine prompt type
  let promptType = 'Zero-shot';
  if (hasExamples) promptType = 'Few-shot';
  if (hasSteps && /think|reason|because|therefore/i.test(content)) promptType = 'Chain-of-Thought';
  if (/thought:|action:|observation:/i.test(content)) promptType = 'ReAct';

  // Calculate score
  let score = 50;
  score += strengths.length * 10;
  score -= improvements.length * 5;
  score = Math.max(0, Math.min(100, score));

  // Build suggestions based on focus
  const suggestions: {
    clarity?: string;
    specificity?: string;
    structure?: string;
    examples?: string;
    constraints?: string;
  } = {};

  if (!focus || focus === 'clarity') {
    suggestions.clarity = hasPersona ? 'Good persona definition' : 'Add "You are a [role]..." to define behavior';
  }
  if (!focus || focus === 'specificity') {
    suggestions.specificity = hasOutput ? 'Output format defined' : 'Add "Respond in [format]..." to specify output';
  }
  if (!focus || focus === 'structure') {
    suggestions.structure = hasSteps ? 'Good step structure' : 'Consider numbered steps for complex tasks';
  }
  if (!focus || focus === 'examples') {
    suggestions.examples = hasExamples ? 'Examples included' : 'Add 1-2 examples showing expected input/output';
  }
  if (!focus || focus === 'constraints') {
    suggestions.constraints = hasConstraints ? 'Constraints defined' : 'Add "Important:" or "Never..." for boundaries';
  }

  return {
    score,
    strengths,
    improvements,
    suggestions,
    promptType,
    wordCount
  };
}