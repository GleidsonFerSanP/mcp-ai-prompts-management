import { Prompt } from '../../types.js';
import { StorageProvider } from './StorageProvider.js';
/**
 * Provider de armazenamento local usando arquivo JSON
 * Implementação padrão que mantém a funcionalidade existente
 */
export declare class LocalStorageProvider implements StorageProvider {
    readonly name = "Local Storage";
    readonly type: "local";
    /**
     * Storage local está sempre disponível
     */
    isAvailable(): Promise<boolean>;
    /**
     * Retorna caminho padrão para storage local
     */
    getDefaultPath(): string;
    /**
     * Valida se o caminho é gravável
     */
    validatePath(path: string): Promise<boolean>;
    /**
     * Carrega prompts do arquivo JSON
     */
    load(path: string): Promise<Prompt[]>;
    /**
     * Salva prompts no arquivo JSON
     */
    save(path: string, prompts: Prompt[]): Promise<void>;
    /**
     * Verifica se o arquivo existe
     */
    exists(path: string): Promise<boolean>;
}
