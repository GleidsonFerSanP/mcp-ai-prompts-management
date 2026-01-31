import { readFile, writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { dirname } from 'path';
/**
 * Provider de armazenamento local usando arquivo JSON
 * Implementação padrão que mantém a funcionalidade existente
 */
export class LocalStorageProvider {
    name = 'Local Storage';
    type = 'local';
    /**
     * Storage local está sempre disponível
     */
    async isAvailable() {
        return true;
    }
    /**
     * Retorna caminho padrão para storage local
     */
    getDefaultPath() {
        return 'prompts-data.json';
    }
    /**
     * Valida se o caminho é gravável
     */
    async validatePath(path) {
        try {
            const dir = dirname(path);
            // Se o diretório não existe, tenta criar
            if (!existsSync(dir)) {
                await mkdir(dir, { recursive: true });
            }
            // Tenta criar um arquivo temporário para testar escrita
            const testFile = `${path}.test`;
            await writeFile(testFile, 'test', 'utf-8');
            // Remove arquivo de teste
            const fs = await import('fs/promises');
            await fs.unlink(testFile);
            return true;
        }
        catch (error) {
            console.error('Erro ao validar caminho:', error);
            return false;
        }
    }
    /**
     * Carrega prompts do arquivo JSON
     */
    async load(path) {
        try {
            if (!existsSync(path)) {
                return [];
            }
            const data = await readFile(path, 'utf-8');
            const storage = JSON.parse(data);
            return storage.prompts || [];
        }
        catch (error) {
            console.error('Erro ao carregar prompts:', error);
            return [];
        }
    }
    /**
     * Salva prompts no arquivo JSON
     */
    async save(path, prompts) {
        try {
            // Garante que o diretório existe
            const dir = dirname(path);
            if (!existsSync(dir)) {
                await mkdir(dir, { recursive: true });
            }
            const storage = { prompts };
            await writeFile(path, JSON.stringify(storage, null, 2), 'utf-8');
        }
        catch (error) {
            console.error('Erro ao salvar prompts:', error);
            throw new Error('Falha ao salvar prompts');
        }
    }
    /**
     * Verifica se o arquivo existe
     */
    async exists(path) {
        return existsSync(path);
    }
}
