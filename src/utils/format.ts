export function currencyBRL(value: number) {
  // Garantir que o valor seja um número válido
  const numValue = Number(value) || 0;

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(numValue);
}

export function kmFormat(value: number) {
  return `${new Intl.NumberFormat("pt-BR").format(value || 0)} km`
}

export function percentFormat(value: number) {
  return `${(value * 100).toFixed(1)}%`
}

export function formatBRDate(input?: string | Date) {
  if (!input) return "-"
  const d = typeof input === "string" ? new Date(input) : input
  if (isNaN(d.getTime())) return "-"
  return d.toLocaleDateString("pt-BR")
}
