import { Prompt } from '../types.js';
import { StorageProvider, StorageProviderType } from './providers/StorageProvider.js';
import { StorageConfig } from './config.js';
/**
 * Factory para gerenciar storage providers
 * Implementa singleton pattern para manter instância única
 */
export declare class StorageFactory {
    private static instance;
    private providers;
    private currentConfig;
    private currentProvider;
    private constructor();
    /**
     * Obtém instância singleton do factory
     */
    static getInstance(): StorageFactory;
    /**
     * Inicializa o factory carregando configuração salva
     */
    initialize(): Promise<void>;
    /**
     * Registra um novo storage provider
     */
    registerProvider(provider: StorageProvider): void;
    /**
     * Lista todos os providers registrados com status de disponibilidade
     */
    listProviders(): Promise<Array<{
        type: StorageProviderType;
        name: string;
        available: boolean;
        active: boolean;
    }>>;
    /**
     * Obtém configuração atual
     */
    getConfig(): StorageConfig;
    /**
     * Atualiza configuração de storage
     */
    setConfig(config: StorageConfig): Promise<void>;
    /**
     * Carrega prompts usando provider atual
     */
    loadPrompts(): Promise<Prompt[]>;
    /**
     * Salva prompts usando provider atual
     */
    savePrompts(prompts: Prompt[]): Promise<void>;
    /**
     * Migra dados de um storage para outro
     */
    migrateData(fromPath: string, toPath: string, fromProvider?: StorageProviderType): Promise<void>;
    /**
     * Carrega configuração do arquivo
     */
    private loadConfig;
    /**
     * Salva configuração no arquivo
     */
    private saveConfig;
}
/**
 * Função auxiliar para obter instância do factory
 */
export declare function getStorageFactory(): StorageFactory;
