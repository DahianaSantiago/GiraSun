const SPANISH_MONTHS = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

export function formatCommentDate(ms: number): string {
  const now = Date.now();
  const ageMs = now - ms;
  if (ageMs < 1000 * 60) return "Hace un momento";
  if (ageMs < 1000 * 60 * 60) {
    const m = Math.floor(ageMs / (1000 * 60));
    return `Hace ${m} min`;
  }
  const d = new Date(ms);
  return `${d.getDate()} ${SPANISH_MONTHS[d.getMonth()]}, ${d.getFullYear()}`;
}
