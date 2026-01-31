import { Prompt } from '../../types.js';
import { StorageProvider } from './StorageProvider.js';
/**
 * Provider de armazenamento Google Drive
 *
 * Suporta:
 * - Google Drive File Stream (empresarial)
 * - Google Drive Backup and Sync (pessoal)
 *
 * Plataformas: Windows, macOS, Linux
 */
export declare class GoogleDriveStorageProvider implements StorageProvider {
    readonly name = "Google Drive";
    readonly type: "googledrive";
    /**
     * Verifica se Google Drive está disponível no sistema
     */
    isAvailable(): Promise<boolean>;
    /**
     * Obtém caminho padrão do Google Drive para o sistema operacional
     */
    getDefaultPath(): string;
    /**
     * Valida se o caminho é acessível e gravável
     */
    validatePath(path: string): Promise<boolean>;
    /**
     * Carrega prompts do Google Drive
     */
    load(path: string): Promise<Prompt[]>;
    /**
     * Salva prompts no Google Drive
     */
    save(path: string, prompts: Prompt[]): Promise<void>;
    /**
     * Verifica se o arquivo existe
     */
    exists(path: string): Promise<boolean>;
    /**
     * Detecta o caminho da pasta Google Drive baseado no sistema operacional
     * Suporta File Stream e Backup and Sync
     */
    private detectGoogleDrivePath;
}
