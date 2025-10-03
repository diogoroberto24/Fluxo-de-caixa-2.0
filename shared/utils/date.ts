// Utilitários para padronização de datas (evita erros de timezone)
// - Normaliza entradas (string/Date/number) para uma data-only em UTC (00:00:00)
// - Extrai dia com segurança usando UTC
// - Formata data no padrão BR de forma determinística

export function normalizeDateOnly(input: string | Date | number | null | undefined): Date | null {
  if (input === null || input === undefined) return null;

  let d: Date | null = null;

  if (typeof input === 'string') {
    // Tenta padrão YYYY-MM-DD
    const m = input.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (m) {
      const year = Number(m[1]);
      const month = Number(m[2]) - 1;
      const day = Number(m[3]);
      return new Date(Date.UTC(year, month, day));
    }
    const parsed = new Date(input);
    if (!isNaN(parsed.getTime())) {
      d = parsed;
    }
  } else if (typeof input === 'number') {
    const parsed = new Date(input);
    if (!isNaN(parsed.getTime())) {
      d = parsed;
    }
  } else {
    const parsed = input as Date;
    if (!isNaN(parsed.getTime())) {
      d = parsed;
    }
  }

  if (!d) return null;

  // Reconstroi como data-only UTC (00:00:00)
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

export function nowUTCDateOnly(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

export function extractDay(input: string | Date | number | null | undefined): string {
  const d = normalizeDateOnly(input);
  if (!d) return '[DIA]';
  const day = d.getUTCDate();
  return day.toString().padStart(2, '0');
}

export function formatDateBR(input: string | Date | number | null | undefined): string {
  const d = normalizeDateOnly(input);
  if (!d) return '';
  const day = d.getUTCDate().toString().padStart(2, '0');
  const month = (d.getUTCMonth() + 1).toString().padStart(2, '0');
  const year = d.getUTCFullYear();
  return `${day}/${month}/${year}`;
}