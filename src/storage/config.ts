import { StorageProviderType } from './providers/StorageProvider.js';

/**
 * Configuração de storage persistida
 * 
 * Contrato registrado no MCP: StorageConfig
 * Regras obrigatórias:
 * 1. provider deve corresponder a um StorageProvider implementado
 * 2. path deve ser caminho absoluto
 * 3. autoSync ativa sincronização automática em falhas
 * 4. fallbackToLocal permite continuar operando se cloud falhar
 * 5. lastSyncAt rastreia última sincronização bem-sucedida
 * 6. Configuração deve ser validada antes de salvar
 */
export interface StorageConfig {
  /**
   * Provider de storage ativo
   */
  provider: StorageProviderType;

  /**
   * Caminho absoluto do arquivo de armazenamento
   */
  path: string;

  /**
   * Se true, tenta sincronizar automaticamente em caso de falhas
   */
  autoSync: boolean;

  /**
   * Se true, faz fallback para storage local se cloud provider falhar
   */
  fallbackToLocal: boolean;

  /**
   * Timestamp ISO 8601 da última sincronização bem-sucedida
   */
  lastSyncAt?: string;

  /**
   * Metadados adicionais do storage
   */
  metadata?: {
    /**
     * Nome do dispositivo/computador
     */
    deviceName?: string;

    /**
     * ID da conta cloud (se aplicável)
     */
    cloudAccountId?: string;
  };
}

/**
 * Configuração padrão do storage
 */
export const DEFAULT_STORAGE_CONFIG: StorageConfig = {
  provider: 'local',
  path: 'prompts-data.json',
  autoSync: true,
  fallbackToLocal: true,
};

/**
 * Nome do arquivo de configuração de storage
 */
export const STORAGE_CONFIG_FILE = 'storage-config.json';
