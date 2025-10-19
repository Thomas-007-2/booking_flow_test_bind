export function formatCents(cents, locale = 'de-AT') {
  const n = Number(cents);
  if (!Number.isFinite(n)) return '0,00';
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(n / 100);
}

export function formatEuro(cents, locale = 'de-AT') {
  return `${formatCents(cents, locale)} €`;
}