// Regras de exibição dos eventos do hub, usadas no build (agrupamento, datas)
// e no navegador ("faltam N dias", eventos encerrados). Datas sempre em ISO
// (AAAA-MM-DD), comparadas como texto.

const MESES = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
const MESES_CURTOS = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

const mes = (iso: string) => Number(iso.slice(5, 7)) - 1;

/** Dia do mês sem zero à esquerda: "2026-11-07" → 7. */
export const dia = (iso: string): number => Number(iso.slice(8, 10));

/** Mês abreviado: "2026-11-07" → "nov". */
export const mesCurto = (iso: string): string => MESES_CURTOS[mes(iso)];

/** Título do grupo: "2026-11" ou "2026-11-07" → "novembro de 2026". */
export const nomeDoMes = (iso: string): string => `${MESES[mes(iso)]} de ${iso.slice(0, 4)}`;

/** Agrupa por mês de início, mantendo a ordem recebida. */
export function agruparPorMes<T extends { dates: string[] }>(lista: T[]): [string, T[]][] {
  const grupos = new Map<string, T[]>();
  for (const item of lista) {
    const chave = item.dates[0].slice(0, 7);
    grupos.set(chave, [...(grupos.get(chave) ?? []), item]);
  }
  return [...grupos];
}

/** Texto do botão de cada link do evento. */
export const textoDoBotao = (label: string): string => (label === "Call for papers" ? "Enviar palestra" : "Inscrever-se");

/** Data local de hoje em ISO (sem o fuso UTC do toISOString). */
export function hojeIso(agora: Date = new Date()): string {
  return `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, "0")}-${String(agora.getDate()).padStart(2, "0")}`;
}

/** Dias inteiros entre duas datas ISO (positivo quando `ate` é depois de `de`). */
export function diasEntre(de: string, ate: string): number {
  return Math.round((Date.parse(`${ate}T00:00:00Z`) - Date.parse(`${de}T00:00:00Z`)) / 86_400_000);
}

/** O evento já acabou? (a última data ficou para trás) */
export const encerrado = (fim: string, hoje: string): boolean => fim < hoje;

/**
 * Quanto falta, para o card: "acontece hoje", "é amanhã", "faltam 12 dias".
 * Vazio para eventos a mais de 60 dias (a data já basta).
 */
export function textoFaltam(inicio: string, hoje: string): string {
  if (inicio <= hoje) return "acontece hoje";
  const faltam = diasEntre(hoje, inicio);
  if (faltam === 1) return "é amanhã";
  return faltam <= 60 ? `faltam ${faltam} dias` : "";
}
