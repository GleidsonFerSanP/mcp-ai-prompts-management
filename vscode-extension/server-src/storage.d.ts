import { Prompt } from './types.js';
/**
 * Carrega os prompts do storage configurado
 *
 * @deprecated Usar StorageFactory diretamente para maior controle
 */
export declare function loadPrompts(): Promise<Prompt[]>;
/**
 * Salva os prompts no storage configurado
 *
 * @deprecated Usar StorageFactory diretamente para maior controle
 */
export declare function savePrompts(prompts: Prompt[]): Promise<void>;
/**
 * Gera um ID único para um novo prompt
 */
export declare function generateId(): string;
