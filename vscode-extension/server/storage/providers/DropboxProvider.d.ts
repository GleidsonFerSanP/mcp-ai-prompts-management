import { Prompt } from '../../types.js';
import { StorageProvider } from './StorageProvider.js';
/**
 * Provider de armazenamento Dropbox
 *
 * Suporta:
 * - Dropbox Personal
 * - Dropbox Business
 *
 * Plataformas: Windows, macOS, Linux
 */
export declare class DropboxStorageProvider implements StorageProvider {
    readonly name = "Dropbox";
    readonly type: "dropbox";
    /**
     * Verifica se Dropbox está disponível no sistema
     */
    isAvailable(): Promise<boolean>;
    /**
     * Obtém caminho padrão do Dropbox para o sistema operacional
     */
    getDefaultPath(): string;
    /**
     * Valida se o caminho é acessível e gravável
     */
    validatePath(path: string): Promise<boolean>;
    /**
     * Carrega prompts do Dropbox
     */
    load(path: string): Promise<Prompt[]>;
    /**
     * Salva prompts no Dropbox
     */
    save(path: string, prompts: Prompt[]): Promise<void>;
    /**
     * Verifica se o arquivo existe
     */
    exists(path: string): Promise<boolean>;
    /**
     * Detecta o caminho da pasta Dropbox baseado no sistema operacional
     * Lê o arquivo de configuração do Dropbox quando possível
     */
    private detectDropboxPath;
    /**
     * Obtém caminho do arquivo de configuração do Dropbox
     */
    private getDropboxConfigPath;
    /**
     * Lê o arquivo de configuração do Dropbox para obter o caminho
     */
    private readDropboxConfig;
}
