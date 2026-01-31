import { Prompt } from '../../types.js';
/**
 * Tipo de storage provider disponível
 */
export type StorageProviderType = 'local' | 'onedrive' | 'googledrive' | 'dropbox' | 'icloud';
/**
 * Interface base que todos os storage providers devem implementar
 *
 * Contrato registrado no MCP: StorageProvider
 * Regras obrigatórias:
 * 1. Todos os métodos devem ser assíncronos
 * 2. isAvailable() deve verificar sem throw exceptions
 * 3. validatePath() deve verificar permissões de escrita
 * 4. load() deve retornar array vazio se arquivo não existir
 * 5. save() deve criar diretórios necessários automaticamente
 * 6. Implementações devem ser stateless
 */
export interface StorageProvider {
    /**
     * Nome legível do provider
     */
    readonly name: string;
    /**
     * Tipo do provider
     */
    readonly type: StorageProviderType;
    /**
     * Verifica se o provider está disponível no sistema atual
     * @returns true se disponível, false caso contrário (sem throw)
     */
    isAvailable(): Promise<boolean>;
    /**
     * Obtém o caminho sugerido padrão para este provider
     * @returns caminho absoluto sugerido
     */
    getDefaultPath(): string;
    /**
     * Valida se o caminho configurado é válido e gravável
     * @param path - Caminho absoluto a validar
     * @returns true se válido e gravável
     */
    validatePath(path: string): Promise<boolean>;
    /**
     * Carrega prompts do storage
     * @param path - Caminho absoluto do arquivo
     * @returns Array de prompts (vazio se arquivo não existir)
     */
    load(path: string): Promise<Prompt[]>;
    /**
     * Salva prompts no storage
     * @param path - Caminho absoluto do arquivo
     * @param prompts - Array de prompts a salvar
     */
    save(path: string, prompts: Prompt[]): Promise<void>;
    /**
     * Verifica se o arquivo existe no caminho especificado
     * @param path - Caminho absoluto do arquivo
     * @returns true se existe
     */
    exists(path: string): Promise<boolean>;
}
