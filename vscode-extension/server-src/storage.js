import { getStorageFactory } from './storage/StorageFactory.js';
/**
 * Carrega os prompts do storage configurado
 *
 * @deprecated Usar StorageFactory diretamente para maior controle
 */
export async function loadPrompts() {
    const factory = getStorageFactory();
    return await factory.loadPrompts();
}
/**
 * Salva os prompts no storage configurado
 *
 * @deprecated Usar StorageFactory diretamente para maior controle
 */
export async function savePrompts(prompts) {
    const factory = getStorageFactory();
    await factory.savePrompts(prompts);
}
/**
 * Gera um ID único para um novo prompt
 */
export function generateId() {
    return `prompt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}
