import { homedir, platform } from 'os';
import { join } from 'path';
import { existsSync } from 'fs';
import { readFile, writeFile, mkdir } from 'fs/promises';
import { dirname } from 'path';
/**
 * Provider de armazenamento Dropbox
 *
 * Suporta:
 * - Dropbox Personal
 * - Dropbox Business
 *
 * Plataformas: Windows, macOS, Linux
 */
export class DropboxStorageProvider {
    name = 'Dropbox';
    type = 'dropbox';
    /**
     * Verifica se Dropbox está disponível no sistema
     */
    async isAvailable() {
        try {
            const dropboxPath = this.detectDropboxPath();
            return dropboxPath !== null && existsSync(dropboxPath);
        }
        catch {
            return false;
        }
    }
    /**
     * Obtém caminho padrão do Dropbox para o sistema operacional
     */
    getDefaultPath() {
        const dropboxPath = this.detectDropboxPath();
        if (!dropboxPath) {
            throw new Error('Dropbox não encontrado no sistema');
        }
        return join(dropboxPath, 'AIPrompts', 'prompts-data.json');
    }
    /**
     * Valida se o caminho é acessível e gravável
     */
    async validatePath(path) {
        try {
            const dir = dirname(path);
            // Verifica se está dentro de uma pasta Dropbox
            const dropboxPath = this.detectDropboxPath();
            if (dropboxPath && !path.startsWith(dropboxPath)) {
                console.warn('Aviso: Caminho não está dentro da pasta Dropbox');
            }
            // Tenta criar o diretório se não existir
            if (!existsSync(dir)) {
                await mkdir(dir, { recursive: true });
            }
            // Testa escrita
            const testFile = `${path}.test`;
            await writeFile(testFile, 'test', 'utf-8');
            // Remove arquivo de teste
            const fs = await import('fs/promises');
            await fs.unlink(testFile);
            return true;
        }
        catch (error) {
            console.error('Erro ao validar caminho Dropbox:', error);
            return false;
        }
    }
    /**
     * Carrega prompts do Dropbox
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
            console.error('Erro ao carregar prompts do Dropbox:', error);
            return [];
        }
    }
    /**
     * Salva prompts no Dropbox
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
            console.log(`✅ Prompts salvos no Dropbox: ${path}`);
        }
        catch (error) {
            console.error('Erro ao salvar prompts no Dropbox:', error);
            throw new Error('Falha ao salvar prompts no Dropbox');
        }
    }
    /**
     * Verifica se o arquivo existe
     */
    async exists(path) {
        return existsSync(path);
    }
    /**
     * Detecta o caminho da pasta Dropbox baseado no sistema operacional
     * Lê o arquivo de configuração do Dropbox quando possível
     */
    detectDropboxPath() {
        const home = homedir();
        // Primeiro tenta ler o arquivo de configuração do Dropbox
        const configPath = this.getDropboxConfigPath();
        if (configPath) {
            const configuredPath = this.readDropboxConfig(configPath);
            if (configuredPath && existsSync(configuredPath)) {
                console.log(`✓ Dropbox detectado via config: ${configuredPath}`);
                return configuredPath;
            }
        }
        // Fallback: locais padrões
        const possiblePaths = [
            // Padrão para todos os sistemas
            join(home, 'Dropbox'),
            // Windows
            join(home, 'Dropbox (Personal)'),
            join(home, 'Dropbox (Business)'),
            // macOS/Linux
            join(home, 'Dropbox'),
            // Variáveis de ambiente
            process.env.DROPBOX_PATH || '',
        ];
        // Retorna o primeiro caminho que existe
        for (const path of possiblePaths) {
            if (path && existsSync(path)) {
                console.log(`✓ Dropbox detectado em: ${path}`);
                return path;
            }
        }
        console.warn('Dropbox não foi encontrado em nenhum local padrão');
        return null;
    }
    /**
     * Obtém caminho do arquivo de configuração do Dropbox
     */
    getDropboxConfigPath() {
        const home = homedir();
        const os = platform();
        const configPaths = [
            // Windows
            join(home, 'AppData', 'Local', 'Dropbox', 'info.json'),
            // macOS
            join(home, '.dropbox', 'info.json'),
            // Linux
            join(home, '.dropbox', 'info.json'),
        ];
        for (const path of configPaths) {
            if (existsSync(path)) {
                return path;
            }
        }
        return null;
    }
    /**
     * Lê o arquivo de configuração do Dropbox para obter o caminho
     */
    readDropboxConfig(configPath) {
        try {
            const fs = require('fs');
            const content = fs.readFileSync(configPath, 'utf-8');
            const config = JSON.parse(content);
            // O arquivo info.json pode ter "personal" ou "business" ou ambos
            const personalPath = config.personal?.path;
            const businessPath = config.business?.path;
            // Prioriza personal, depois business
            return personalPath || businessPath || null;
        }
        catch (error) {
            console.error('Erro ao ler config do Dropbox:', error);
            return null;
        }
    }
}
