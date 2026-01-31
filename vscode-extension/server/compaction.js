/**
 * Context Compaction Utilities
 *
 * Implements context compaction strategies from:
 * - https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents
 * - https://www.inferable.ai/blog/posts/llm-progressive-context-encrichment
 *
 * Key Principles:
 * 1. Summarize content when approaching context limits
 * 2. Preserve critical information (decisions, bugs, implementation details)
 * 3. Discard redundant tool outputs
 */
const DEFAULT_CONFIG = {
    maxContentLength: 4000,
    maxSummaryLength: 500,
    preserveCodeBlocks: true,
    preserveLists: true,
};
/**
 * Estimates token count for a string (rough approximation)
 * Rule of thumb: ~4 characters per token for English text
 */
export function estimateTokens(text) {
    return Math.ceil(text.length / 4);
}
/**
 * Extracts a summary from prompt content
 * Preserves key information while reducing token count
 */
export function extractSummary(content, maxLength = DEFAULT_CONFIG.maxSummaryLength) {
    if (content.length <= maxLength) {
        return content;
    }
    // Try to find a natural break point (paragraph or sentence)
    const truncated = content.substring(0, maxLength);
    // Look for last complete sentence
    const sentenceEnd = Math.max(truncated.lastIndexOf('. '), truncated.lastIndexOf('.\n'), truncated.lastIndexOf('! '), truncated.lastIndexOf('? '));
    if (sentenceEnd > maxLength * 0.5) {
        return truncated.substring(0, sentenceEnd + 1) + '...';
    }
    // Fallback: truncate at word boundary
    const wordEnd = truncated.lastIndexOf(' ');
    if (wordEnd > maxLength * 0.7) {
        return truncated.substring(0, wordEnd) + '...';
    }
    return truncated + '...';
}
/**
 * Converts a full prompt to a compacted version
 * Used for listing prompts without loading full content
 */
export function compactPrompt(prompt) {
    return {
        id: prompt.id,
        name: prompt.name,
        category: prompt.category,
        tags: prompt.tags,
        summary: extractSummary(prompt.description + '\n\n' + prompt.content.substring(0, 200)),
        hasFullContent: true,
        estimatedTokens: estimateTokens(prompt.content),
    };
}
/**
 * Compacts a list of prompts for efficient context usage
 * Returns metadata only, full content loaded on-demand
 */
export function compactPromptList(prompts) {
    return prompts.map(compactPrompt);
}
/**
 * Formats prompt metadata for display (minimal tokens)
 */
export function formatPromptMetadata(prompt) {
    return `• **${prompt.name}** (${prompt.id})\n  Category: ${prompt.category} | Tags: ${prompt.tags.join(', ') || 'none'}`;
}
/**
 * Formats a list of prompts with minimal token usage
 * Following progressive disclosure pattern
 */
export function formatPromptListCompact(prompts) {
    if (prompts.length === 0) {
        return 'No prompts found.';
    }
    const header = `📚 **${prompts.length} prompt(s) found**\n\n`;
    const list = prompts.map(formatPromptMetadata).join('\n');
    const footer = `\n\n💡 Use \`get_prompt\` with ID to fetch full content.`;
    return header + list + footer;
}
/**
 * Calculates compaction statistics
 */
export function calculateCompactionStats(original, compacted) {
    const originalTokens = original.reduce((sum, s) => sum + estimateTokens(s), 0);
    const compactedTokens = compacted.reduce((sum, s) => sum + estimateTokens(s), 0);
    return {
        originalTokens,
        compactedTokens,
        reductionPercent: Math.round((1 - compactedTokens / originalTokens) * 100),
        itemsProcessed: original.length,
    };
}
/**
 * Determines if content needs compaction based on token estimate
 */
export function needsCompaction(content, threshold = 1000) {
    return estimateTokens(content) > threshold;
}
export function loadPromptAtStage(prompt, stage) {
    switch (stage) {
        case 'metadata':
            return {
                _stage: 'metadata',
                id: prompt.id,
                name: prompt.name,
                category: prompt.category,
                tags: prompt.tags,
            };
        case 'summary':
            return {
                _stage: 'summary',
                id: prompt.id,
                name: prompt.name,
                description: prompt.description,
                category: prompt.category,
                tags: prompt.tags,
            };
        case 'full':
        default:
            return {
                _stage: 'full',
                ...prompt,
            };
    }
}
