/**
 * Utilitários para manipulação de datas
 * Reduz duplicação de código ao fazer parse de datas
 */

/**
 * Faz parse de uma data que pode vir em diferentes formatos
 * @param dateInput - Data como string, Date ou undefined
 * @returns Date normalizada
 */
export function parseDate(dateInput: string | Date | undefined | null): Date {
  if (!dateInput) {
    return new Date();
  }

  if (dateInput instanceof Date) {
    return dateInput;
  }

  // Normaliza string removendo parte de tempo se existir
  const dateStrNormalized = typeof dateInput === 'string' 
    ? dateInput.split('T')[0] 
    : dateInput;

  if (typeof dateStrNormalized === 'string') {
    const [year, month, day] = dateStrNormalized.split('-').map(Number);
    
    if (year && month && day) {
      // Cria data no meio do dia para evitar problemas de timezone
      return new Date(year, month - 1, day, 12, 0, 0, 0);
    }
  }

  // Fallback para Date constructor padrão
  const parsed = new Date(dateInput);
  if (Number.isNaN(parsed.getTime())) {
    return new Date();
  }

  return parsed;
}

/**
 * Verifica se uma data é válida
 * @param date - Data a ser verificada
 * @returns true se a data é válida
 */
export function isValidDate(date: Date): boolean {
  return date instanceof Date && !Number.isNaN(date.getTime());
}

