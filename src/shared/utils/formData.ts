/**
 * Utilitários para criação de FormData
 * Reduz duplicação de código ao criar FormData para uploads
 */

/**
 * Cria um FormData a partir de um objeto, excluindo campos específicos
 * @param data - Objeto com os dados a serem convertidos
 * @param excludeKeys - Chaves a serem excluídas do FormData
 * @returns FormData pronto para uso
 */
export function createFormData<T extends Record<string, unknown>>(
  data: T,
  excludeKeys: string[] = []
): FormData {
  const formData = new FormData();

  for (const key of Object.keys(data)) {
    if (excludeKeys.includes(key)) {
      continue;
    }

    const value = data[key as keyof T];
    if (value !== undefined && value !== null) {
      formData.append(key, value.toString());
    }
  }

  return formData;
}

/**
 * Adiciona um arquivo ao FormData se existir
 * @param formData - FormData existente
 * @param file - Arquivo a ser adicionado
 * @param fieldName - Nome do campo no FormData (padrão: 'photo')
 */
export function appendFileToFormData(
  formData: FormData,
  file: File | undefined,
  fieldName: string = 'photo'
): void {
  if (file) {
    formData.append(fieldName, file);
  }
}

/**
 * Cria um FormData completo com dados e arquivo
 * @param data - Objeto com os dados
 * @param file - Arquivo opcional
 * @param excludeKeys - Chaves a serem excluídas (padrão: ['photo'])
 * @param fileFieldName - Nome do campo do arquivo (padrão: 'photo')
 * @returns FormData pronto para uso
 */
export function createFormDataWithFile<T extends Record<string, unknown>>(
  data: T,
  file?: File,
  excludeKeys: string[] = ['photo'],
  fileFieldName: string = 'photo'
): FormData {
  const formData = createFormData(data, excludeKeys);
  appendFileToFormData(formData, file, fileFieldName);
  return formData;
}

