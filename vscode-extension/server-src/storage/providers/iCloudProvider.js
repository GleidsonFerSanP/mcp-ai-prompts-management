import { homedir, platform } from "os";
import { join } from "path";
import { existsSync } from "fs";
import { readFile, writeFile, mkdir } from "fs/promises";
import { dirname } from "path";

/**
 * Provider de armazenamento iCloud Drive
 *
 * Auto-detecta pasta iCloud Drive no macOS
 * Usa sincronização nativa do iCloud
 */
export class iCloudStorageProvider {
  constructor() {
    this.name = "iCloud Drive";
    this.type = "icloud";
  }

  /**
   * Detecta se o iCloud Drive está disponível
   */
  isAvailable() {
    if (platform() !== "darwin") {
      return false;
    }

    const iCloudPath = this.getICloudBasePath();
    return existsSync(iCloudPath);
  }

  /**
   * Retorna o caminho base do iCloud Drive
   */
  getICloudBasePath() {
    // macOS iCloud Drive path
    return join(
      homedir(),
      "Library",
      "Mobile Documents",
      "com~apple~CloudDocs",
    );
  }

  /**
   * Retorna o caminho padrão para os prompts
   */
  getDefaultPath() {
    return join(this.getICloudBasePath(), "AIPrompts", "prompts-data.json");
  }

  /**
   * Carrega os dados do arquivo
   */
  async load(filePath) {
    const path = filePath || this.getDefaultPath();

    if (!existsSync(path)) {
      return { prompts: [] };
    }

    try {
      const content = await readFile(path, "utf-8");
      return JSON.parse(content);
    } catch (error) {
      console.error("iCloud: Error loading data:", error);
      return { prompts: [] };
    }
  }

  /**
   * Salva os dados no arquivo
   */
  async save(data, filePath) {
    const path = filePath || this.getDefaultPath();

    // Garantir que o diretório existe
    const dir = dirname(path);
    if (!existsSync(dir)) {
      await mkdir(dir, { recursive: true });
    }

    try {
      await writeFile(path, JSON.stringify(data, null, 2), "utf-8");
    } catch (error) {
      console.error("iCloud: Error saving data:", error);
      throw error;
    }
  }

  /**
   * Retorna informações sobre o provider
   */
  getInfo() {
    return {
      name: this.name,
      type: this.type,
      available: this.isAvailable(),
      path: this.getDefaultPath(),
      description: "Sync prompts via iCloud Drive (macOS only)",
    };
  }
}

export default iCloudStorageProvider;
