export function currencyBRL(value: number) {
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
  
  let d: Date;
  if (typeof input === "string") {
    const dateStr = input.split('T')[0];
    const [year, month, day] = dateStr.split('-').map(Number);
    
    if (year && month && day) {
      d = new Date(year, month - 1, day, 12, 0, 0, 0);
    } else {
      d = new Date(input);
    }
  } else {
    d = input;
  }
  
  if (Number.isNaN(d.getTime())) return "-"
  
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  
  return `${day}/${month}/${year}`;
}
