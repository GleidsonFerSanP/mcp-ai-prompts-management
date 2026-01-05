/**
 * Representa um prompt de AI salvo
 */
export interface Prompt {
  id: string;
  name: string;
  description: string;
  content: string;
  category: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Estrutura de armazenamento dos prompts
 */
export interface PromptsStorage {
  prompts: Prompt[];
}

/**
 * Parâmetros para adicionar um novo prompt
 */
export interface AddPromptParams {
  name: string;
  description: string;
  content: string;
  category: string;
  tags?: string[];
}

/**
 * Parâmetros para atualizar um prompt existente
 */
export interface UpdatePromptParams {
  id: string;
  name?: string;
  description?: string;
  content?: string;
  category?: string;
  tags?: string[];
}

/**
 * Parâmetros para listar prompts
 */
export interface ListPromptsParams {
  category?: string;
  tags?: string[];
  search?: string;
}
