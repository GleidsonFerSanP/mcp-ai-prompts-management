import { homedir, platform } from 'os';
import { join } from 'path';
import { existsSync } from 'fs';
import { readFile, writeFile, mkdir } from 'fs/promises';
import { dirname } from 'path';

/**
 * Provider de armazenamento iCloud Drive
 *
 * Auto-detecta pasta iCloud Drive no macOS
 * Usa sincronização nativa do iCloud
 */
export class iCloudStorageProvider {
    name = 'iCloud Drive';
    type = 'icloud';

    /**
     * Verifica se iCloud Drive está disponível no sistema
     */
    async isAvailable() {
        try {
            const iCloudPath = this.detectiCloudPath();
            return iCloudPath !== null && existsSync(iCloudPath);
        } catch {
            return false;
        }
    }

    /**
     * Obtém caminho padrão do iCloud Drive
     */
    getDefaultPath() {
        const iCloudPath = this.detectiCloudPath();
        if (!iCloudPath) {
            throw new Error('iCloud Drive não encontrado no sistema');
        }
        return join(iCloudPath, 'AIPrompts', 'prompts-data.json');
    }

    /**
     * Valida se o caminho é acessível e gravável
     */
    async validatePath(path) {
        try {
            const dir = dirname(path);

            // Verifica se está dentro de uma pasta iCloud
            const iCloudPath = this.detectiCloudPath();
            if (iCloudPath && !path.startsWith(iCloudPath)) {
                console.warn('Aviso: Caminho não está dentro da pasta iCloud Drive');
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
        } catch (error) {
            console.error('Erro ao validar caminho iCloud:', error);
            return false;
        }
    }

    /**
     * Carrega prompts do iCloud Drive
     */
    async load(path) {
        try {
            if (!existsSync(path)) {
                return [];
            }
            const data = await readFile(path, 'utf-8');
            const storage = JSON.parse(data);
            return storage.prompts || [];
        } catch (error) {
            console.error('Erro ao carregar prompts do iCloud:', error);
            return [];
        }
    }

    /**
     * Salva prompts no iCloud Drive
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
            console.log(`✅ Prompts salvos no iCloud Drive: ${path}`);
        } catch (error) {
            console.error('Erro ao salvar prompts no iCloud:', error);
            throw new Error('Falha ao salvar prompts no iCloud Drive');
        }
    }

    /**
     * Verifica se o arquivo existe
     */
    async exists(path) {
        return existsSync(path);
    }

    /**
     * Detecta o caminho da pasta iCloud Drive baseado no sistema operacional
     */
    detectiCloudPath() {
        const home = homedir();
        const os = platform();

        // iCloud Drive só está disponível no macOS
        if (os !== 'darwin') {
            return null;
        }

        // Possíveis localizações do iCloud Drive no macOS
        const possiblePaths = [
            // Localização padrão do iCloud Drive no macOS
            join(home, 'Library', 'Mobile Documents', 'com~apple~CloudDocs'),
            // Atalho simbólico comum
            join(home, 'iCloud Drive'),
            // Localização alternativa
            join(home, 'Library', 'CloudStorage', 'iCloud Drive'),
            join(home, 'Library', 'CloudStorage', 'iCloudDrive'),
        ];

        // Retorna o primeiro caminho que existe
        for (const path of possiblePaths) {
            if (path && existsSync(path)) {
                console.log(`✓ iCloud Drive detectado em: ${path}`);
                return path;
            }
        }

        // Log dos locais verificados para debugging
        console.warn('iCloud Drive não foi encontrado em nenhum local padrão');
        console.warn('Locais verificados:', JSON.stringify(possiblePaths, null, 2));

        return null;
    }
}
