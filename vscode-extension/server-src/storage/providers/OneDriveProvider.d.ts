import { Prompt } from '../../types.js';
import { StorageProvider } from './StorageProvider.js';
/**
 * Provider de armazenamento OneDrive
 *
 * Auto-detecta pasta OneDrive em Windows e macOS
 * Usa sincronização nativa do cliente OneDrive
 */
export declare class OneDriveStorageProvider implements StorageProvider {
    readonly name = "OneDrive";
    readonly type: "onedrive";
    /**
     * Verifica se OneDrive está disponível no sistema
     */
    isAvailable(): Promise<boolean>;
    /**
     * Obtém caminho padrão do OneDrive para o sistema operacional
     */
    getDefaultPath(): string;
    /**
     * Valida se o caminho é acessível e gravável
     */
    validatePath(path: string): Promise<boolean>;
    /**
     * Carrega prompts do OneDrive
     */
    load(path: string): Promise<Prompt[]>;
    /**
     * Salva prompts no OneDrive
     */
    save(path: string, prompts: Prompt[]): Promise<void>;
    /**
     * Verifica se o arquivo existe
     */
    exists(path: string): Promise<boolean>;
    /**
     * Detecta o caminho da pasta OneDrive baseado no sistema operacional
     */
    private detectOneDrivePath;
}
