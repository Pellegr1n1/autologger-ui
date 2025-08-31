export function currencyBRL(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value || 0)
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
