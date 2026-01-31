import { homedir, platform } from 'os';
import { join } from 'path';
import { existsSync } from 'fs';
import { readFile, writeFile, mkdir } from 'fs/promises';
import { dirname } from 'path';
/**
 * Provider de armazenamento OneDrive
 *
 * Auto-detecta pasta OneDrive em Windows e macOS
 * Usa sincronização nativa do cliente OneDrive
 */
export class OneDriveStorageProvider {
    name = 'OneDrive';
    type = 'onedrive';
    /**
     * Verifica se OneDrive está disponível no sistema
     */
    async isAvailable() {
        try {
            const oneDrivePath = this.detectOneDrivePath();
            return oneDrivePath !== null && existsSync(oneDrivePath);
        }
        catch {
            return false;
        }
    }
    /**
     * Obtém caminho padrão do OneDrive para o sistema operacional
     */
    getDefaultPath() {
        const oneDrivePath = this.detectOneDrivePath();
        if (!oneDrivePath) {
            throw new Error('OneDrive não encontrado no sistema');
        }
        return join(oneDrivePath, 'AIPrompts', 'prompts-data.json');
    }
    /**
     * Valida se o caminho é acessível e gravável
     */
    async validatePath(path) {
        try {
            const dir = dirname(path);
            // Verifica se está dentro de uma pasta OneDrive
            const oneDrivePath = this.detectOneDrivePath();
            if (oneDrivePath && !path.startsWith(oneDrivePath)) {
                console.warn('Aviso: Caminho não está dentro da pasta OneDrive');
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
            console.error('Erro ao validar caminho OneDrive:', error);
            return false;
        }
    }
    /**
     * Carrega prompts do OneDrive
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
            console.error('Erro ao carregar prompts do OneDrive:', error);
            return [];
        }
    }
    /**
     * Salva prompts no OneDrive
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
            console.log(`✅ Prompts salvos no OneDrive: ${path}`);
        }
        catch (error) {
            console.error('Erro ao salvar prompts no OneDrive:', error);
            throw new Error('Falha ao salvar prompts no OneDrive');
        }
    }
    /**
     * Verifica se o arquivo existe
     */
    async exists(path) {
        return existsSync(path);
    }
    /**
     * Detecta o caminho da pasta OneDrive baseado no sistema operacional
     */
    detectOneDrivePath() {
        const home = homedir();
        const os = platform();
        // Possíveis localizações do OneDrive
        const possiblePaths = [
            // Windows
            join(home, 'OneDrive'),
            join(home, 'OneDrive - Personal'),
            process.env.OneDrive || '',
            process.env.OneDriveConsumer || '',
            process.env.OneDriveCommercial || '',
            // macOS/Linux
            join(home, 'OneDrive'),
            join(home, 'OneDrive - Personal'),
        ];
        // Retorna o primeiro caminho que existe
        for (const path of possiblePaths) {
            if (path && existsSync(path)) {
                console.log(`✓ OneDrive detectado em: ${path}`);
                return path;
            }
        }
        console.warn('OneDrive não foi encontrado em nenhum local padrão');
        return null;
    }
}
