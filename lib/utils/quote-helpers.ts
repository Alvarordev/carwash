const MONTHS = [
  "ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO", "JUNIO",
  "JULIO", "AGOSTO", "SEPTIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE",
];

export function formatQuoteDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  if (!year || !month || !day) return isoDate;
  return `${day} DE ${MONTHS[month - 1]} ${year}`;
}

export function shouldShowSimpleTable(items: { quantity: number | string }[]): boolean {
  if (items.length === 0) return true;
  return items.every((i) => Number(i.quantity) === 1);
}

export function calculateQuoteTotals(items: { quantity: number | string; unitPrice: number | string }[]) {
  const subtotal = items.reduce((s, i) => s + Number(i.quantity) * Number(i.unitPrice), 0);
  const igv = Math.round(subtotal * 0.18 * 100) / 100;
  const total = Math.round((subtotal + igv) * 100) / 100;
  return { subtotal, igv, total };
}
