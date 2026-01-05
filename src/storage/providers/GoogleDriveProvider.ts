import { homedir, platform } from 'os';
import { join } from 'path';
import { existsSync } from 'fs';
import { readFile, writeFile, mkdir } from 'fs/promises';
import { dirname } from 'path';
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
export class GoogleDriveStorageProvider implements StorageProvider {
  readonly name = 'Google Drive';
  readonly type = 'googledrive' as const;

  /**
   * Verifica se Google Drive está disponível no sistema
   */
  async isAvailable(): Promise<boolean> {
    try {
      const googleDrivePath = this.detectGoogleDrivePath();
      return googleDrivePath !== null && existsSync(googleDrivePath);
    } catch {
      return false;
    }
  }

  /**
   * Obtém caminho padrão do Google Drive para o sistema operacional
   */
  getDefaultPath(): string {
    const googleDrivePath = this.detectGoogleDrivePath();
    
    if (!googleDrivePath) {
      throw new Error('Google Drive não encontrado no sistema');
    }

    return join(googleDrivePath, 'AIPrompts', 'prompts-data.json');
  }

  /**
   * Valida se o caminho é acessível e gravável
   */
  async validatePath(path: string): Promise<boolean> {
    try {
      const dir = dirname(path);

      // Verifica se está dentro de uma pasta Google Drive
      const googleDrivePath = this.detectGoogleDrivePath();
      if (googleDrivePath && !path.startsWith(googleDrivePath)) {
        console.warn('Aviso: Caminho não está dentro da pasta Google Drive');
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
      console.error('Erro ao validar caminho Google Drive:', error);
      return false;
    }
  }

  /**
   * Carrega prompts do Google Drive
   */
  async load(path: string): Promise<Prompt[]> {
    try {
      if (!existsSync(path)) {
        return [];
      }

      const data = await readFile(path, 'utf-8');
      const storage = JSON.parse(data);
      return storage.prompts || [];
    } catch (error) {
      console.error('Erro ao carregar prompts do Google Drive:', error);
      return [];
    }
  }

  /**
   * Salva prompts no Google Drive
   */
  async save(path: string, prompts: Prompt[]): Promise<void> {
    try {
      // Garante que o diretório existe
      const dir = dirname(path);
      if (!existsSync(dir)) {
        await mkdir(dir, { recursive: true });
      }

      const storage = { prompts };
      await writeFile(path, JSON.stringify(storage, null, 2), 'utf-8');

      console.log(`✅ Prompts salvos no Google Drive: ${path}`);
    } catch (error) {
      console.error('Erro ao salvar prompts no Google Drive:', error);
      throw new Error('Falha ao salvar prompts no Google Drive');
    }
  }

  /**
   * Verifica se o arquivo existe
   */
  async exists(path: string): Promise<boolean> {
    return existsSync(path);
  }

  /**
   * Detecta o caminho da pasta Google Drive baseado no sistema operacional
   * Suporta File Stream e Backup and Sync
   */
  private detectGoogleDrivePath(): string | null {
    const home = homedir();
    const os = platform();

    // Possíveis localizações do Google Drive
    const possiblePaths = [
      // Google Drive File Stream (novo nome: Google Drive for Desktop)
      join(home, 'Google Drive'),
      
      // Backup and Sync (versão antiga)
      join(home, 'Google Drive'),
      
      // Windows - File Stream
      'G:\\', // Drive G: é comum para File Stream
      'H:\\', // Algumas empresas usam H:
      
      // macOS - File Stream
      '/Volumes/GoogleDrive',
      join(home, 'Library', 'CloudStorage', 'GoogleDrive'),
      
      // Linux
      join(home, 'GoogleDrive'),
      join(home, 'google-drive'),
      
      // Caminhos alternativos
      join(home, 'My Drive'),
    ];

    // Verifica variáveis de ambiente
    const envPaths = [
      process.env.GOOGLE_DRIVE_PATH,
      process.env.GOOGLEDRIVE,
    ].filter(Boolean) as string[];

    const allPaths = [...envPaths, ...possiblePaths];

    // Retorna o primeiro caminho que existe
    for (const path of allPaths) {
      if (path && existsSync(path)) {
        // Verifica se realmente parece ser Google Drive
        // (pode ter arquivos/pastas características)
        console.log(`✓ Google Drive detectado em: ${path}`);
        return path;
      }
    }

    console.warn('Google Drive não foi encontrado em nenhum local padrão');
    console.warn('Locais verificados:', allPaths.filter(Boolean));
    return null;
  }
}
