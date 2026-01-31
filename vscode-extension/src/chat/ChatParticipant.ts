import * as vscode from 'vscode';
import { MCPClient, Prompt } from '../mcpClient';

/**
 * Registers the @prompts chat participant for GitHub Copilot Chat
 * 
 * Usage in chat:
 * - @prompts list - List all available prompts
 * - @prompts search <query> - Search prompts by name/description
 * - @prompts use <name> - Get a specific prompt to use
 * - @prompts suggest - Get prompt suggestions based on current context
 */
export function registerChatParticipant(
  context: vscode.ExtensionContext,
  mcpClient: MCPClient
): void {
  // Register the chat participant
  const participant = vscode.chat.createChatParticipant(
    'mcp-ai-prompts.prompts',
    async (request, chatContext, stream, token) => {
      return handleChatRequest(request, chatContext, stream, token, mcpClient);
    }
  );

  participant.iconPath = new vscode.ThemeIcon('hubot');

  context.subscriptions.push(participant);

  console.log('Chat participant @prompts registered');
}

/**
 * Handles chat requests to the @prompts participant
 */
async function handleChatRequest(
  request: vscode.ChatRequest,
  context: vscode.ChatContext,
  stream: vscode.ChatResponseStream,
  token: vscode.CancellationToken,
  mcpClient: MCPClient
): Promise<vscode.ChatResult> {
  const command = request.command;
  const prompt = request.prompt.trim();

  try {
    // Ensure MCP client is connected
    if (!mcpClient.isConnected()) {
      await mcpClient.connect();
    }

    switch (command) {
      case 'list':
        return await handleListCommand(stream, mcpClient, prompt);

      case 'search':
        return await handleSearchCommand(stream, mcpClient, prompt);

      case 'use':
        return await handleUseCommand(stream, mcpClient, prompt, request);

      case 'save':
        return await handleSaveCommand(stream, mcpClient, prompt, request, context);

      case 'suggest':
        return await handleSuggestCommand(stream, mcpClient, prompt, request);

      default:
        // No command - intelligent routing based on prompt
        return await handleDefaultRequest(stream, mcpClient, prompt, request, context);
    }
  } catch (error) {
    stream.markdown(`❌ **Error**: ${error instanceof Error ? error.message : 'Unknown error'}\n\n`);
    stream.markdown(`Make sure the MCP AI Prompts extension is properly configured.`);
    return { metadata: { command: 'error' } };
  }
}

/**
 * Handle /list command - List all prompts
 */
async function handleListCommand(
  stream: vscode.ChatResponseStream,
  mcpClient: MCPClient,
  filter: string
): Promise<vscode.ChatResult> {
  const prompts = await mcpClient.listPrompts();
  const categories = await mcpClient.getCategories();

  stream.markdown(`## 📚 Your Prompts Library\n\n`);
  stream.markdown(`**${prompts.length}** prompts in **${categories.length}** categories\n\n`);

  // Group by category
  const byCategory: Record<string, Prompt[]> = {};
  for (const prompt of prompts) {
    const cat = prompt.category || 'Uncategorized';
    if (!byCategory[cat]) byCategory[cat] = [];
    
    // Apply filter if provided
    if (!filter || 
        prompt.name.toLowerCase().includes(filter.toLowerCase()) ||
        prompt.description?.toLowerCase().includes(filter.toLowerCase())) {
      byCategory[cat].push(prompt);
    }
  }

  for (const [category, categoryPrompts] of Object.entries(byCategory)) {
    if (categoryPrompts.length === 0) continue;
    
    stream.markdown(`### 📁 ${category}\n\n`);
    
    for (const p of categoryPrompts) {
      const tags = p.tags?.length ? ` 🏷️ ${p.tags.join(', ')}` : '';
      stream.markdown(`- **${p.name}**${tags}\n`);
      if (p.description) {
        stream.markdown(`  _${p.description}_\n`);
      }
    }
    stream.markdown('\n');
  }

  stream.markdown(`\n---\n`);
  stream.markdown(`💡 **Tip**: Use \`@prompts /use <name>\` to get a specific prompt\n`);

  return { metadata: { command: 'list', count: prompts.length } };
}

/**
 * Handle /search command - Search prompts
 */
async function handleSearchCommand(
  stream: vscode.ChatResponseStream,
  mcpClient: MCPClient,
  query: string
): Promise<vscode.ChatResult> {
  if (!query) {
    stream.markdown(`⚠️ Please provide a search query.\n\n`);
    stream.markdown(`**Usage**: \`@prompts /search code review\`\n`);
    return { metadata: { command: 'search', error: 'no-query' } };
  }

  const prompts = await mcpClient.listPrompts();
  const queryLower = query.toLowerCase();

  const matches = prompts.filter(p =>
    p.name.toLowerCase().includes(queryLower) ||
    p.description?.toLowerCase().includes(queryLower) ||
    p.content.toLowerCase().includes(queryLower) ||
    p.tags?.some(t => t.toLowerCase().includes(queryLower))
  );

  stream.markdown(`## 🔍 Search Results for "${query}"\n\n`);

  if (matches.length === 0) {
    stream.markdown(`No prompts found matching your query.\n\n`);
    stream.markdown(`💡 **Suggestions**:\n`);
    stream.markdown(`- Try different keywords\n`);
    stream.markdown(`- Use \`@prompts /list\` to see all prompts\n`);
  } else {
    stream.markdown(`Found **${matches.length}** matching prompt${matches.length > 1 ? 's' : ''}:\n\n`);

    for (const p of matches) {
      stream.markdown(`### 📝 ${p.name}\n\n`);
      stream.markdown(`**Category**: ${p.category}`);
      if (p.tags?.length) {
        stream.markdown(` | **Tags**: ${p.tags.join(', ')}`);
      }
      stream.markdown('\n\n');
      
      if (p.description) {
        stream.markdown(`_${p.description}_\n\n`);
      }

      // Show preview of content
      const preview = p.content.substring(0, 200);
      stream.markdown(`\`\`\`\n${preview}${p.content.length > 200 ? '...' : ''}\n\`\`\`\n\n`);
    }
  }

  return { metadata: { command: 'search', query, count: matches.length } };
}

/**
 * Handle /use command - Get a specific prompt
 */
async function handleUseCommand(
  stream: vscode.ChatResponseStream,
  mcpClient: MCPClient,
  promptName: string,
  request: vscode.ChatRequest
): Promise<vscode.ChatResult> {
  if (!promptName) {
    stream.markdown(`⚠️ Please specify a prompt name.\n\n`);
    stream.markdown(`**Usage**: \`@prompts /use Code Review Assistant\`\n`);
    return { metadata: { command: 'use', error: 'no-name' } };
  }

  const prompts = await mcpClient.listPrompts();
  const nameLower = promptName.toLowerCase();

  // Find exact or partial match
  let match = prompts.find(p => p.name.toLowerCase() === nameLower);
  if (!match) {
    match = prompts.find(p => p.name.toLowerCase().includes(nameLower));
  }

  if (!match) {
    stream.markdown(`❌ Prompt "${promptName}" not found.\n\n`);
    
    // Suggest similar prompts
    const similar = prompts
      .filter(p => p.name.toLowerCase().includes(nameLower.substring(0, 3)))
      .slice(0, 5);
    
    if (similar.length > 0) {
      stream.markdown(`**Did you mean?**\n`);
      for (const p of similar) {
        stream.markdown(`- ${p.name}\n`);
      }
    }
    
    return { metadata: { command: 'use', error: 'not-found' } };
  }

  // Get full prompt content
  const fullPrompt = await mcpClient.getPrompt(match.id);

  // Inject the prompt content as a reference so it becomes part of the context
  stream.markdown(`## 🚀 Using Prompt: ${fullPrompt.name}\n\n`);
  
  if (fullPrompt.description) {
    stream.markdown(`_${fullPrompt.description}_\n\n`);
  }

  // Show the prompt content that will be used
  stream.markdown(`### 📝 Prompt Instructions\n\n`);
  stream.markdown(`${fullPrompt.content}\n\n`);
  
  stream.markdown(`---\n\n`);
  stream.markdown(`✅ **This prompt is now active!** Continue the conversation and I will follow these instructions.\n\n`);
  stream.markdown(`💡 **Examples**:\n`);
  stream.markdown(`- Just describe your task and I'll apply this prompt\n`);
  stream.markdown(`- Paste code or text you want me to work with\n`);
  stream.markdown(`- Ask follow-up questions\n\n`);

  // Provide quick actions
  stream.button({
    title: '📋 Copy Prompt',
    command: 'aiPrompts.copyPromptContent',
    arguments: [fullPrompt.content]
  });

  // Return the prompt content as part of the result so it can be used as context
  return { 
    metadata: { 
      command: 'use', 
      promptId: fullPrompt.id,
      promptContent: fullPrompt.content,
      promptName: fullPrompt.name
    }
  };
}

/**
 * Handle /suggest command - Get AI-powered suggestions
 */
async function handleSuggestCommand(
  stream: vscode.ChatResponseStream,
  mcpClient: MCPClient,
  task: string,
  request: vscode.ChatRequest
): Promise<vscode.ChatResult> {
  const prompts = await mcpClient.listPrompts();

  stream.markdown(`## 💡 Prompt Suggestions\n\n`);

  if (!task) {
    // Show general suggestions
    stream.markdown(`Here are some popular prompts you might find useful:\n\n`);
    
    const suggestions = prompts.slice(0, 5);
    for (const p of suggestions) {
      stream.markdown(`### ${p.name}\n`);
      stream.markdown(`_${p.description || 'No description'}_\n\n`);
    }
  } else {
    // Find relevant prompts based on task
    const taskLower = task.toLowerCase();
    const relevant = prompts.filter(p =>
      p.name.toLowerCase().includes(taskLower) ||
      p.description?.toLowerCase().includes(taskLower) ||
      p.category.toLowerCase().includes(taskLower) ||
      p.tags?.some(t => t.toLowerCase().includes(taskLower))
    ).slice(0, 5);

    if (relevant.length > 0) {
      stream.markdown(`Based on your task "${task}", I suggest:\n\n`);
      
      for (const p of relevant) {
        stream.markdown(`### 📝 ${p.name}\n`);
        stream.markdown(`_${p.description || 'No description'}_\n`);
        stream.markdown(`**Category**: ${p.category}\n\n`);
      }
    } else {
      stream.markdown(`No existing prompts match your task. Would you like to create a new one?\n\n`);
      
      stream.button({
        title: '➕ Create New Prompt',
        command: 'aiPrompts.addPrompt'
      });
    }
  }

  return { metadata: { command: 'suggest', task } };
}

/**
 * Handle /save command - Save a new prompt to the library
 */
async function handleSaveCommand(
  stream: vscode.ChatResponseStream,
  mcpClient: MCPClient,
  input: string,
  request: vscode.ChatRequest,
  context: vscode.ChatContext
): Promise<vscode.ChatResult> {
  stream.markdown(`## 💾 Save Prompt to Library\n\n`);

  // Try to extract prompt details from input
  // Format: /save [name] or just /save (will prompt for details)
  
  if (!input) {
    // Check if there's a prompt in the conversation history to save
    const lastAssistantMessage = context.history
      .filter((h): h is vscode.ChatResponseTurn => h instanceof vscode.ChatResponseTurn)
      .pop();
    
    if (lastAssistantMessage) {
      // Extract content from last response
      let contentToSave = '';
      for (const part of lastAssistantMessage.response) {
        if (part instanceof vscode.ChatResponseMarkdownPart) {
          contentToSave += part.value.value;
        }
      }
      
      if (contentToSave) {
        stream.markdown(`I found content from the previous response that could be saved.\n\n`);
        stream.markdown(`**Preview** (first 300 chars):\n`);
        stream.markdown(`\`\`\`\n${contentToSave.substring(0, 300)}${contentToSave.length > 300 ? '...' : ''}\n\`\`\`\n\n`);
        stream.markdown(`To save this, please tell me:\n`);
        stream.markdown(`- **Name**: What should I call this prompt?\n`);
        stream.markdown(`- **Category**: Which category? (e.g., Code, Writing, Analysis)\n`);
        stream.markdown(`- **Description**: Brief description of what it does\n\n`);
        stream.markdown(`**Example**: \`@prompts /save name="Code Review" category="Code" description="Reviews code for issues"\`\n`);
        
        return { 
          metadata: { 
            command: 'save', 
            pendingContent: contentToSave,
            status: 'awaiting-details'
          } 
        };
      }
    }
    
    stream.markdown(`To save a prompt, provide the details:\n\n`);
    stream.markdown(`**Format**: \`@prompts /save name="My Prompt" category="Code" description="What it does"\`\n\n`);
    stream.markdown(`Then in your next message, provide the prompt content.\n\n`);
    stream.markdown(`**Or** you can ask me to improve/create a prompt and then say "save that as [name]".\n`);
    
    return { metadata: { command: 'save', status: 'awaiting-input' } };
  }

  // Parse input for name, category, description
  const nameMatch = input.match(/name\s*=\s*["']([^"']+)["']/i);
  const categoryMatch = input.match(/category\s*=\s*["']([^"']+)["']/i);
  const descriptionMatch = input.match(/description\s*=\s*["']([^"']+)["']/i);
  const contentMatch = input.match(/content\s*=\s*["']([^"']+)["']/i) || 
                       input.match(/```([\s\S]*?)```/);

  const name = nameMatch?.[1];
  const category = categoryMatch?.[1] || 'General';
  const description = descriptionMatch?.[1] || '';
  let content = contentMatch?.[1];

  // If no structured input, check if it's a simple "save as X" pattern
  if (!name) {
    const simpleMatch = input.match(/^(?:save\s+(?:as|this\s+as)?\s*)?["']?([^"']+)["']?$/i);
    if (simpleMatch) {
      stream.markdown(`To save a prompt named "${simpleMatch[1]}", I need the content.\n\n`);
      stream.markdown(`Please provide the prompt content in your next message, or use:\n`);
      stream.markdown(`\`@prompts /save name="${simpleMatch[1]}" category="General"\` followed by the content in a code block.\n`);
      
      return { 
        metadata: { 
          command: 'save', 
          pendingName: simpleMatch[1],
          status: 'awaiting-content'
        } 
      };
    }
  }

  if (!name) {
    stream.markdown(`⚠️ Please provide a name for the prompt.\n\n`);
    stream.markdown(`**Format**: \`@prompts /save name="My Prompt" category="Code"\`\n`);
    return { metadata: { command: 'save', error: 'no-name' } };
  }

  if (!content) {
    stream.markdown(`Got it! I'll save a prompt named **"${name}"** in category **"${category}"**.\n\n`);
    stream.markdown(`Now please provide the prompt content in your next message.\n\n`);
    stream.markdown(`You can:\n`);
    stream.markdown(`- Type or paste the prompt content directly\n`);
    stream.markdown(`- Or wrap it in a code block\n`);
    
    return { 
      metadata: { 
        command: 'save', 
        pendingName: name,
        pendingCategory: category,
        pendingDescription: description,
        status: 'awaiting-content'
      } 
    };
  }

  // We have all the details, save the prompt
  try {
    const result = await mcpClient.addPrompt(name, description, category, [], content);
    
    stream.markdown(`## ✅ Prompt Saved Successfully!\n\n`);
    stream.markdown(`**Name**: ${name}\n`);
    stream.markdown(`**Category**: ${category}\n`);
    if (description) {
      stream.markdown(`**Description**: ${description}\n`);
    }
    stream.markdown(`**ID**: ${result.id}\n\n`);
    
    stream.markdown(`Your prompt is now available in your library. Use \`@prompts /use ${name}\` to use it.\n`);
    
    // Refresh the tree view
    vscode.commands.executeCommand('aiPrompts.refreshPrompts');
    
    return { 
      metadata: { 
        command: 'save', 
        promptId: result.id,
        status: 'saved'
      } 
    };
  } catch (error) {
    stream.markdown(`❌ **Error saving prompt**: ${error instanceof Error ? error.message : 'Unknown error'}\n`);
    return { metadata: { command: 'save', error: 'save-failed' } };
  }
}

/**
 * Handle default requests without specific commands
 */
async function handleDefaultRequest(
  stream: vscode.ChatResponseStream,
  mcpClient: MCPClient,
  prompt: string,
  request: vscode.ChatRequest,
  context: vscode.ChatContext
): Promise<vscode.ChatResult> {
  // If the prompt looks like a prompt name, try to find it
  const prompts = await mcpClient.listPrompts();
  const match = prompts.find(p => 
    p.name.toLowerCase() === prompt.toLowerCase() ||
    p.name.toLowerCase().includes(prompt.toLowerCase())
  );

  if (match) {
    return await handleUseCommand(stream, mcpClient, match.name, request);
  }

  // Otherwise, show help
  stream.markdown(`## 🤖 AI Prompts Assistant\n\n`);
  stream.markdown(`I help you manage and use your prompt library. Here's what I can do:\n\n`);
  
  stream.markdown(`### Available Commands\n\n`);
  stream.markdown(`| Command | Description |\n`);
  stream.markdown(`|---------|-------------|\n`);
  stream.markdown(`| \`/list\` | List all your prompts |\n`);
  stream.markdown(`| \`/search <query>\` | Search prompts |\n`);
  stream.markdown(`| \`/use <name>\` | Get a specific prompt |\n`);
  stream.markdown(`| \`/suggest [task]\` | Get prompt suggestions |\n`);
  stream.markdown(`| \`/save name="..." category="..."\` | Save a new prompt |\n\n`);

  stream.markdown(`### Quick Stats\n\n`);
  stream.markdown(`- **${prompts.length}** prompts in your library\n`);
  
  const categories = await mcpClient.getCategories();
  stream.markdown(`- **${categories.length}** categories\n\n`);

  stream.markdown(`💡 **Example**: \`@prompts /search code review\`\n`);

  return { metadata: { command: 'help' } };
}
