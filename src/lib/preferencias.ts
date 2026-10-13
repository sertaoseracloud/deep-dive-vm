// src/lib/preferencias.ts
// Preferências de acessibilidade (mesmo modelo do DivergePHP e do DivergeTerraform):
// tema, tamanho do texto, leitura, conforto e tradução para Libras, mais perfis
// prontos. Viram atributos/classes no <html>; o CSS do Layout faz o resto.
//
// Para não piscar o tema errado no carregamento, o painel grava também o
// resultado já calculado (CHAVE_APLICADO); um script inline no <head> só o
// reaplica. Sem escolha salva, esse script segue o sistema operacional
// (contraste alto, cores forçadas e modo claro), como preferenciasDoSistema.

export const CHAVE_PREFERENCIAS = "a11y:preferencias";
export const CHAVE_APLICADO = "a11y:aplicado";

export const TEMAS = {
  padrao: "Padrão (escuro)",
  claro: "Claro",
  "alto-contraste": "Alto contraste",
  suave: "Suave (cores calmas, sem brilho)",
} as const;
export type Tema = keyof typeof TEMAS;

export const TAMANHOS = [87.5, 100, 112.5, 125, 150, 175] as const;

/** Opções liga/desliga, em grupos para o painel. */
export const GRUPOS = {
  Leitura: {
    fonteLegivel: "Fonte mais legível (Atkinson Hyperlegible)",
    espacamento: "Mais espaço entre linhas, letras e palavras",
    linhasCurtas: "Linhas de texto mais curtas",
    sublinharLinks: "Sublinhar links e reforçar o foco do teclado",
  },
  Conforto: {
    reduzirMovimento: "Reduzir animações",
  },
  Audição: {
    libras: "Tradução para Libras com o VLibras (carrega o tradutor do Governo Federal)",
  },
} as const;

type Grupos = typeof GRUPOS;
export type Opcao = { [G in keyof Grupos]: keyof Grupos[G] }[keyof Grupos];

export const OPCOES = Object.assign({}, ...Object.values(GRUPOS)) as Record<Opcao, string>;

export const CLASSES: Record<Opcao, string> = {
  fonteLegivel: "a11y-fonte-legivel",
  espacamento: "a11y-espacamento",
  linhasCurtas: "a11y-linhas-curtas",
  sublinharLinks: "a11y-links",
  reduzirMovimento: "a11y-sem-movimento",
  libras: "a11y-libras",
};

export type Preferencias = { tema: Tema; tamanho: number } & Record<Opcao, boolean>;

export const PADRAO: Preferencias = {
  tema: "padrao",
  tamanho: 100,
  ...(Object.fromEntries(Object.keys(OPCOES).map((chave) => [chave, false])) as Record<Opcao, boolean>),
};

interface Perfil {
  rotulo: string;
  ajuda: string;
  valores: Partial<Preferencias>;
}

/**
 * Perfis: atalhos que ligam um conjunto de opções. Não são diagnósticos: cada
 * pessoa é diferente, e as opções continuam ajustáveis uma a uma.
 */
export const PERFIS: Record<string, Perfil> = {
  baixaVisao: {
    rotulo: "🔍 Baixa visão",
    ajuda: "Alto contraste, texto maior e links sublinhados.",
    valores: { tema: "alto-contraste", tamanho: 125, sublinharLinks: true },
  },
  leitura: {
    rotulo: "📖 Leitura facilitada",
    ajuda: "Fonte legível, mais espaço e linhas curtas. Pode ajudar quem tem dislexia.",
    valores: { fonteLegivel: true, espacamento: true, linhasCurtas: true, sublinharLinks: true },
  },
  calmo: {
    rotulo: "🌿 Calmo",
    ajuda: "Cores suaves e nada se mexe. Pode ajudar pessoas autistas, com TDAH ou com sensibilidade sensorial.",
    valores: { tema: "suave", reduzirMovimento: true, linhasCurtas: true },
  },
  libras: {
    rotulo: "🤟 Libras",
    ajuda: "Liga o VLibras, que traduz o texto para Libras com um avatar. Nada no site depende de som.",
    valores: { libras: true },
  },
};

/** Cor da barra do navegador (meta theme-color) em cada tema. */
export const COR_DA_BARRA: Record<Tema, string> = {
  padrao: "#0a0f1e",
  claro: "#f5f7fb",
  "alto-contraste": "#000000",
  suave: "#1c2128",
};

/** O perfil está ligado quando todas as opções dele estão ligadas. */
export const perfilAtivo = (prefs: Preferencias, id: string): boolean =>
  Object.entries(PERFIS[id].valores).every(([chave, valor]) => prefs[chave as keyof Preferencias] === valor);

/** Liga o perfil (mantendo o resto) ou, se já estava ligado, volta as opções dele ao padrão. */
export function alternarPerfil(prefs: Preferencias, id: string): Preferencias {
  const { valores } = PERFIS[id];
  if (!perfilAtivo(prefs, id)) return { ...prefs, ...valores };
  const desligar = Object.fromEntries(
    Object.keys(valores).map((chave) => [chave, PADRAO[chave as keyof Preferencias]])
  );
  return { ...prefs, ...desligar };
}

/** Aceita só valores conhecidos; o resto volta ao padrão. */
export function normalizarPreferencias(salvas: unknown): Preferencias {
  const p = { ...PADRAO };
  if (!salvas || typeof salvas !== "object") return p;
  const s = salvas as Record<string, unknown>;
  if (typeof s.tema === "string" && s.tema in TEMAS) p.tema = s.tema as Tema;
  if ((TAMANHOS as readonly number[]).includes(s.tamanho as number)) p.tamanho = s.tamanho as number;
  for (const chave of Object.keys(OPCOES) as Opcao[]) {
    if (typeof s[chave] === "boolean") p[chave] = s[chave] as boolean;
  }
  return p;
}

/**
 * Ponto de partida para quem ainda não escolheu nada: respeita "reduzir
 * movimento", "aumentar contraste" (ou cores forçadas) e o modo claro do sistema.
 */
export function preferenciasDoSistema(
  consultar: (q: string) => boolean = (q) => window.matchMedia?.(q).matches ?? false
): Preferencias {
  const p = { ...PADRAO };
  if (consultar("(prefers-reduced-motion: reduce)")) p.reduzirMovimento = true;
  if (consultar("(prefers-contrast: more)") || consultar("(forced-colors: active)")) p.tema = "alto-contraste";
  else if (consultar("(prefers-color-scheme: light)")) p.tema = "claro";
  return p;
}

/** Estado pronto para o <html>: o que o script inline do <head> reaplica. */
export interface Aplicado {
  tema: Tema;
  escala: string;
  classes: string[];
  cor: string;
}

export function calcularAplicado(p: Preferencias): Aplicado {
  return {
    tema: p.tema,
    escala: String(p.tamanho / 100),
    classes: (Object.keys(CLASSES) as Opcao[]).filter((k) => p[k]).map((k) => CLASSES[k]),
    cor: COR_DA_BARRA[p.tema],
  };
}

export function aplicarPreferencias(p: Preferencias, raiz: HTMLElement = document.documentElement): void {
  const a = calcularAplicado(p);
  raiz.dataset.tema = a.tema;
  raiz.style.setProperty("--escala", a.escala);
  for (const classe of Object.values(CLASSES)) raiz.classList.toggle(classe, a.classes.includes(classe));
  raiz.ownerDocument.querySelector('meta[name="theme-color"]')?.setAttribute("content", a.cor);
}

export function lerPreferencias(): Preferencias | null {
  try {
    const bruto = localStorage.getItem(CHAVE_PREFERENCIAS);
    return bruto === null ? null : normalizarPreferencias(JSON.parse(bruto));
  } catch {
    return null;
  }
}

/** Grava a escolha e o estado aplicado (este, para o script inline do <head>). */
export function gravarPreferencias(p: Preferencias): void {
  try {
    localStorage.setItem(CHAVE_PREFERENCIAS, JSON.stringify(p));
    localStorage.setItem(CHAVE_APLICADO, JSON.stringify(calcularAplicado(p)));
  } catch {
    // Armazenamento bloqueado (aba anônima restrita): vale só nesta página.
  }
}

export function limparPreferencias(): void {
  try {
    localStorage.removeItem(CHAVE_PREFERENCIAS);
    localStorage.removeItem(CHAVE_APLICADO);
  } catch {
    // Sem armazenamento, não há o que limpar.
  }
}
