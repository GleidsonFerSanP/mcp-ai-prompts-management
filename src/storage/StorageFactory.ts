import { readFile, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import { Prompt } from '../types.js';
import { StorageProvider, StorageProviderType } from './providers/StorageProvider.js';
import { StorageConfig, DEFAULT_STORAGE_CONFIG, STORAGE_CONFIG_FILE } from './config.js';
import { LocalStorageProvider } from './providers/LocalProvider.js';
import { OneDriveStorageProvider } from './providers/OneDriveProvider.js';

/**
 * Factory para gerenciar storage providers
 * Implementa singleton pattern para manter instância única
 */
export class StorageFactory {
  private static instance: StorageFactory;
  private providers: Map<StorageProviderType, StorageProvider>;
  private currentConfig: StorageConfig;
  private currentProvider: StorageProvider;

  private constructor() {
    this.providers = new Map();
    this.currentConfig = DEFAULT_STORAGE_CONFIG;
    
    // Registra providers disponíveis
    this.registerProvider(new LocalStorageProvider());
    this.registerProvider(new OneDriveStorageProvider());
    
    this.currentProvider = this.providers.get('local')!;
  }

  /**
   * Obtém instância singleton do factory
   */
  static getInstance(): StorageFactory {
    if (!StorageFactory.instance) {
      StorageFactory.instance = new StorageFactory();
    }
    return StorageFactory.instance;
  }

  /**
   * Inicializa o factory carregando configuração salva
   */
  async initialize(): Promise<void> {
    try {
      const config = await this.loadConfig();
      if (config) {
        await this.setConfig(config);
      }
    } catch (error) {
      console.error('Erro ao inicializar StorageFactory:', error);
      // Continua com configuração padrão
    }
  }

  /**
   * Registra um novo storage provider
   */
  registerProvider(provider: StorageProvider): void {
    this.providers.set(provider.type, provider);
  }

  /**
   * Lista todos os providers registrados com status de disponibilidade
   */
  async listProviders(): Promise<Array<{
    type: StorageProviderType;
    name: string;
    available: boolean;
    active: boolean;
  }>> {
    const results = [];

    for (const [type, provider] of this.providers) {
      const available = await provider.isAvailable();
      results.push({
        type,
        name: provider.name,
        available,
        active: type === this.currentConfig.provider,
      });
    }

    return results;
  }

  /**
   * Obtém configuração atual
   */
  getConfig(): StorageConfig {
    return { ...this.currentConfig };
  }

  /**
   * Atualiza configuração de storage
   */
  async setConfig(config: StorageConfig): Promise<void> {
    // Valida que o provider existe
    const provider = this.providers.get(config.provider);
    if (!provider) {
      throw new Error(`Provider não registrado: ${config.provider}`);
    }

    // Verifica disponibilidade
    const available = await provider.isAvailable();
    if (!available && !config.fallbackToLocal) {
      throw new Error(`Provider ${config.provider} não está disponível`);
    }

    // Valida caminho se provider disponível
    if (available) {
      const valid = await provider.validatePath(config.path);
      if (!valid) {
        throw new Error(`Caminho inválido: ${config.path}`);
      }
    }

    // Se provider não disponível e fallback habilitado, usa local
    if (!available && config.fallbackToLocal) {
      console.warn(`Provider ${config.provider} indisponível. Usando fallback local.`);
      this.currentProvider = this.providers.get('local')!;
    } else {
      this.currentProvider = provider;
    }

    this.currentConfig = config;
    await this.saveConfig(config);
  }

  /**
   * Carrega prompts usando provider atual
   */
  async loadPrompts(): Promise<Prompt[]> {
    try {
      return await this.currentProvider.load(this.currentConfig.path);
    } catch (error) {
      // Tenta fallback para local se habilitado
      if (this.currentConfig.fallbackToLocal && this.currentConfig.provider !== 'local') {
        console.error(`Erro ao carregar de ${this.currentConfig.provider}, tentando fallback local:`, error);
        const localProvider = this.providers.get('local')!;
        return await localProvider.load(DEFAULT_STORAGE_CONFIG.path);
      }
      throw error;
    }
  }

  /**
   * Salva prompts usando provider atual
   */
  async savePrompts(prompts: Prompt[]): Promise<void> {
    try {
      await this.currentProvider.save(this.currentConfig.path, prompts);
      
      // Atualiza timestamp de sincronização
      this.currentConfig.lastSyncAt = new Date().toISOString();
      await this.saveConfig(this.currentConfig);
    } catch (error) {
      // Tenta fallback para local se habilitado
      if (this.currentConfig.fallbackToLocal && this.currentConfig.provider !== 'local') {
        console.error(`Erro ao salvar em ${this.currentConfig.provider}, tentando fallback local:`, error);
        const localProvider = this.providers.get('local')!;
        await localProvider.save(DEFAULT_STORAGE_CONFIG.path, prompts);
        return;
      }
      throw error;
    }
  }

  /**
   * Migra dados de um storage para outro
   */
  async migrateData(fromPath: string, toPath: string, fromProvider?: StorageProviderType): Promise<void> {
    const sourceProvider = fromProvider 
      ? this.providers.get(fromProvider) || this.currentProvider
      : this.currentProvider;

    // Carrega dados do storage antigo
    const prompts = await sourceProvider.load(fromPath);

    if (prompts.length === 0) {
      console.log('Nenhum dado para migrar');
      return;
    }

    // Salva no novo storage
    await this.currentProvider.save(toPath, prompts);
    
    console.log(`Migrados ${prompts.length} prompts de ${fromPath} para ${toPath}`);
  }

  /**
   * Carrega configuração do arquivo
   */
  private async loadConfig(): Promise<StorageConfig | null> {
    try {
      if (!existsSync(STORAGE_CONFIG_FILE)) {
        return null;
      }

      const data = await readFile(STORAGE_CONFIG_FILE, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Erro ao carregar configuração:', error);
      return null;
    }
  }

  /**
   * Salva configuração no arquivo
   */
  private async saveConfig(config: StorageConfig): Promise<void> {
    try {
      await writeFile(STORAGE_CONFIG_FILE, JSON.stringify(config, null, 2), 'utf-8');
    } catch (error) {
      console.error('Erro ao salvar configuração:', error);
      throw new Error('Falha ao salvar configuração de storage');
    }
  }
}

/**
 * Função auxiliar para obter instância do factory
 */
export function getStorageFactory(): StorageFactory {
  return StorageFactory.getInstance();
}
