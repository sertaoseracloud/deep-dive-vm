// Regras dos diagramas Mermaid dos artigos do blog. O desenho em si acontece
// no navegador (src/pages/blog/[slug].astro); aqui fica só o que dá para
// testar sem navegador: que diagrama é, como anunciar e quais cores usar.

/** Seletor dos blocos Mermaid que vêm do dev.to (```mermaid no markdown). */
export const SELETOR_MERMAID = 'pre[data-lang="mermaid"], pre.highlight.mermaid';

const ROTULOS: Record<string, string> = {
  flowchart: "Fluxograma",
  graph: "Fluxograma",
  sequencediagram: "Diagrama de sequência",
  classdiagram: "Diagrama de classes",
  statediagram: "Diagrama de estados",
  "statediagram-v2": "Diagrama de estados",
  erdiagram: "Diagrama entidade-relacionamento",
  journey: "Jornada do usuário",
  gantt: "Cronograma (Gantt)",
  pie: "Gráfico de pizza",
  mindmap: "Mapa mental",
  timeline: "Linha do tempo",
  gitgraph: "Histórico do Git",
  "architecture-beta": "Diagrama de arquitetura",
  c4context: "Diagrama C4",
};

/**
 * Tipo do diagrama pela primeira palavra útil da fonte, ignorando a
 * configuração inicial (---…---) e comentários (%%).
 */
export function tipoDoDiagrama(fonte: string): string {
  const semCabecalho = fonte.replace(/^\s*---[\s\S]*?---\s*/, "");
  const linha = semCabecalho
    .split("\n")
    .map((l) => l.trim())
    .find((l) => l && !l.startsWith("%%"));
  return (linha?.split(/\s+/)[0] ?? "").toLowerCase();
}

/** Nome do diagrama em português, para o rótulo da figura. */
export const rotuloDoDiagrama = (tipo: string): string => ROTULOS[tipo] ?? "Diagrama";

/**
 * Título acessível que o autor pode declarar na fonte (accTitle: …); quando
 * existe, entra no rótulo da figura.
 */
export function tituloAcessivel(fonte: string): string | null {
  const m = fonte.match(/^\s*accTitle\s*:\s*(.+)$/m);
  return m ? m[1].trim() : null;
}

/**
 * Variáveis do tema "base" do Mermaid a partir dos tokens de cor do site, para
 * o diagrama acompanhar os 4 temas do painel ♿.
 * @param ler devolve o valor de uma variável CSS (ex.: "--texto-principal")
 */
export function variaveisDoTema(ler: (nome: string) => string) {
  const texto = ler("--texto-principal");
  const fundo = ler("--abismo-profundo");
  const cartao = `rgb(${ler("--rgb-cartao")})`;
  const destaque = ler("--nucleo-eletrico");
  const linha = ler("--texto-secundario");
  return {
    darkMode: ler("color-scheme") !== "light",
    background: fundo,
    fontFamily: ler("--font-body") || "sans-serif",
    fontSize: "15px",
    primaryColor: cartao,
    primaryTextColor: texto,
    primaryBorderColor: destaque,
    secondaryColor: cartao,
    tertiaryColor: cartao,
    lineColor: linha,
    textColor: texto,
    mainBkg: cartao,
    nodeBorder: destaque,
    clusterBkg: fundo,
    clusterBorder: linha,
    edgeLabelBackground: fundo,
    actorBkg: cartao,
    actorBorder: destaque,
    actorTextColor: texto,
    actorLineColor: linha,
    signalColor: texto,
    signalTextColor: texto,
    labelBoxBkgColor: cartao,
    labelBoxBorderColor: destaque,
    labelTextColor: texto,
    loopTextColor: texto,
    noteBkgColor: fundo,
    noteBorderColor: linha,
    noteTextColor: texto,
    activationBkgColor: cartao,
    activationBorderColor: destaque,
    sequenceNumberColor: fundo,
  };
}
