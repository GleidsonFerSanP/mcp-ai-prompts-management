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
import { Prompt } from './types.js';
/**
 * Configuration for compaction behavior
 */
export interface CompactionConfig {
    /** Maximum characters for content before compaction */
    maxContentLength: number;
    /** Maximum characters for summary */
    maxSummaryLength: number;
    /** Whether to preserve code blocks */
    preserveCodeBlocks: boolean;
    /** Whether to preserve lists */
    preserveLists: boolean;
}
/**
 * Represents a compacted prompt with summary
 */
export interface CompactedPrompt {
    id: string;
    name: string;
    category: string;
    tags: string[];
    /** Short summary of the content */
    summary: string;
    /** Whether full content is available */
    hasFullContent: boolean;
    /** Estimated token count of full content */
    estimatedTokens: number;
}
/**
 * Estimates token count for a string (rough approximation)
 * Rule of thumb: ~4 characters per token for English text
 */
export declare function estimateTokens(text: string): number;
/**
 * Extracts a summary from prompt content
 * Preserves key information while reducing token count
 */
export declare function extractSummary(content: string, maxLength?: number): string;
/**
 * Converts a full prompt to a compacted version
 * Used for listing prompts without loading full content
 */
export declare function compactPrompt(prompt: Prompt): CompactedPrompt;
/**
 * Compacts a list of prompts for efficient context usage
 * Returns metadata only, full content loaded on-demand
 */
export declare function compactPromptList(prompts: Prompt[]): CompactedPrompt[];
/**
 * Formats prompt metadata for display (minimal tokens)
 */
export declare function formatPromptMetadata(prompt: Prompt): string;
/**
 * Formats a list of prompts with minimal token usage
 * Following progressive disclosure pattern
 */
export declare function formatPromptListCompact(prompts: Prompt[]): string;
/**
 * Compaction statistics for monitoring context usage
 */
export interface CompactionStats {
    originalTokens: number;
    compactedTokens: number;
    reductionPercent: number;
    itemsProcessed: number;
}
/**
 * Calculates compaction statistics
 */
export declare function calculateCompactionStats(original: string[], compacted: string[]): CompactionStats;
/**
 * Determines if content needs compaction based on token estimate
 */
export declare function needsCompaction(content: string, threshold?: number): boolean;
/**
 * Progressive context loader - loads content in stages
 * Stage 1: Metadata only (id, name, category, tags)
 * Stage 2: Metadata + summary
 * Stage 3: Full content
 */
export type ContextStage = 'metadata' | 'summary' | 'full';
export declare function loadPromptAtStage(prompt: Prompt, stage: ContextStage): Partial<Prompt> & {
    _stage: ContextStage;
};
