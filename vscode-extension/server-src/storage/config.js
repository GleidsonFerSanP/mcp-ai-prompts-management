import { homedir } from "os";
import { join } from "path";

/**
 * Retorna o diretório de dados da aplicação
 */
export function getDataDirectory() {
  return join(homedir(), ".mcp-ai-prompts");
}

/**
 * Retorna o caminho padrão para o arquivo de prompts
 */
export function getDefaultPromptsPath() {
  return join(getDataDirectory(), "prompts-data.json");
}

/**
 * Retorna o caminho completo para o arquivo de configuração de storage
 */
export function getStorageConfigPath() {
  return join(getDataDirectory(), "storage-config.json");
}

/**
 * Configuração padrão do storage
 */
export const DEFAULT_STORAGE_CONFIG = {
  provider: "local",
  path: getDefaultPromptsPath(),
  autoSync: true,
  fallbackToLocal: true,
};
/**
 * Nome do arquivo de configuração de storage (legacy, use getStorageConfigPath)
 */
export const STORAGE_CONFIG_FILE = "storage-config.json";
