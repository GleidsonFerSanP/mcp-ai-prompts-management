import { readFile, writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import { dirname } from "path";
import {
  DEFAULT_STORAGE_CONFIG,
  getStorageConfigPath,
  getDataDirectory,
} from "./config.js";
import { LocalStorageProvider } from "./providers/LocalProvider.js";
import { OneDriveStorageProvider } from "./providers/OneDriveProvider.js";
import { GoogleDriveStorageProvider } from "./providers/GoogleDriveProvider.js";
import { DropboxStorageProvider } from "./providers/DropboxProvider.js";
import { iCloudStorageProvider } from "./providers/iCloudProvider.js";
/**
 * Factory para gerenciar storage providers
 * Implementa singleton pattern para manter instância única
 */
export class StorageFactory {
  static instance;
  providers;
  currentConfig;
  currentProvider;
  constructor() {
    this.providers = new Map();
    this.currentConfig = DEFAULT_STORAGE_CONFIG;
    // Registra providers disponíveis
    this.registerProvider(new LocalStorageProvider());
    this.registerProvider(new iCloudStorageProvider());
    this.registerProvider(new OneDriveStorageProvider());
    this.registerProvider(new GoogleDriveStorageProvider());
    this.registerProvider(new DropboxStorageProvider());
    this.currentProvider = this.providers.get("local");
  }
  /**
   * Obtém instância singleton do factory
   */
  static getInstance() {
    if (!StorageFactory.instance) {
      StorageFactory.instance = new StorageFactory();
    }
    return StorageFactory.instance;
  }
  /**
   * Inicializa o factory carregando configuração salva
   */
  async initialize() {
    try {
      const config = await this.loadConfig();
      if (config) {
        await this.setConfig(config);
      }
    } catch (error) {
      console.error("Erro ao inicializar StorageFactory:", error);
      // Continua com configuração padrão
    }
  }
  /**
   * Registra um novo storage provider
   */
  registerProvider(provider) {
    this.providers.set(provider.type, provider);
  }
  /**
   * Lista todos os providers registrados com status de disponibilidade
   */
  async listProviders() {
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
  getConfig() {
    return { ...this.currentConfig };
  }
  /**
   * Atualiza configuração de storage
   */
  async setConfig(config) {
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
      console.warn(
        `Provider ${config.provider} indisponível. Usando fallback local.`,
      );
      this.currentProvider = this.providers.get("local");
    } else {
      this.currentProvider = provider;
    }
    this.currentConfig = config;
    await this.saveConfig(config);
  }
  /**
   * Carrega prompts usando provider atual
   */
  async loadPrompts() {
    try {
      return await this.currentProvider.load(this.currentConfig.path);
    } catch (error) {
      // Tenta fallback para local se habilitado
      if (
        this.currentConfig.fallbackToLocal &&
        this.currentConfig.provider !== "local"
      ) {
        console.error(
          `Erro ao carregar de ${this.currentConfig.provider}, tentando fallback local:`,
          error,
        );
        const localProvider = this.providers.get("local");
        return await localProvider.load(DEFAULT_STORAGE_CONFIG.path);
      }
      throw error;
    }
  }
  /**
   * Salva prompts usando provider atual
   */
  async savePrompts(prompts) {
    try {
      await this.currentProvider.save(this.currentConfig.path, prompts);
      // Atualiza timestamp de sincronização
      this.currentConfig.lastSyncAt = new Date().toISOString();
      await this.saveConfig(this.currentConfig);
    } catch (error) {
      // Tenta fallback para local se habilitado
      if (
        this.currentConfig.fallbackToLocal &&
        this.currentConfig.provider !== "local"
      ) {
        console.error(
          `Erro ao salvar em ${this.currentConfig.provider}, tentando fallback local:`,
          error,
        );
        const localProvider = this.providers.get("local");
        await localProvider.save(DEFAULT_STORAGE_CONFIG.path, prompts);
        return;
      }
      throw error;
    }
  }
  /**
   * Migra dados de um storage para outro
   */
  async migrateData(fromPath, toPath, fromProvider) {
    const sourceProvider = fromProvider
      ? this.providers.get(fromProvider) || this.currentProvider
      : this.currentProvider;
    // Carrega dados do storage antigo
    const prompts = await sourceProvider.load(fromPath);
    if (prompts.length === 0) {
      console.log("Nenhum dado para migrar");
      return;
    }
    // Salva no novo storage
    await this.currentProvider.save(toPath, prompts);
    console.log(
      `Migrados ${prompts.length} prompts de ${fromPath} para ${toPath}`,
    );
  }
  /**
   * Carrega configuração do arquivo
   */
  async loadConfig() {
    try {
      const configPath = getStorageConfigPath();
      if (!existsSync(configPath)) {
        return null;
      }
      const data = await readFile(configPath, "utf-8");
      return JSON.parse(data);
    } catch (error) {
      console.error("Erro ao carregar configuração:", error);
      return null;
    }
  }
  /**
   * Salva configuração no arquivo
   */
  async saveConfig(config) {
    try {
      const configPath = getStorageConfigPath();
      const dataDir = getDataDirectory();

      // Garante que o diretório existe
      if (!existsSync(dataDir)) {
        await mkdir(dataDir, { recursive: true });
      }

      await writeFile(configPath, JSON.stringify(config, null, 2), "utf-8");
    } catch (error) {
      console.error("Erro ao salvar configuração:", error);
      throw new Error("Falha ao salvar configuração de storage");
    }
  }
}
/**
 * Função auxiliar para obter instância do factory
 */
export function getStorageFactory() {
  return StorageFactory.getInstance();
}
