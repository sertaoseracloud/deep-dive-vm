// Artigos do blog no dev.to (https://dev.to/sertaoseracloud).
// Usado por scripts/buscar-devto.mjs (pipeline diária), pelo hub (aba Blog) e
// pelas páginas /blog/<slug>/. Em JS com JSDoc para o script do Node importar
// sem compilar.

export const USUARIO = "sertaoseracloud";
export const PERFIL = `https://dev.to/${USUARIO}`;
const API = "https://dev.to/api/articles";
const POR_PAGINA = 100;
const CABECALHOS = { accept: "application/vnd.forem.api-v1+json" };

/**
 * @typedef {object} Artigo
 * @property {number} id
 * @property {string} slug  Caminho da página no site: /blog/<slug>/
 * @property {string} title
 * @property {string} description
 * @property {string} url  Endereço no dev.to
 * @property {string} canonical  URL canônica (a do dev.to, salvo se o artigo apontar outra)
 * @property {string} publishedAt  Data de publicação (ISO)
 * @property {string} editedAt  Última edição (ISO); igual à publicação se nunca foi editado
 * @property {number} readingTime  Minutos de leitura
 * @property {string[]} tags
 * @property {string | null} cover  Imagem de capa (CDN do dev.to)
 * @property {string} language  Código do idioma ("pt", "en"...)
 * @property {number} reactions
 * @property {number} comments
 */

/**
 * Fica só com o que o site usa (o JSON salvo no repositório fica pequeno).
 * @param {Record<string, any>} bruto Item de GET /api/articles
 * @returns {Artigo}
 */
export function normalizarArtigo(bruto) {
  return {
    id: bruto.id,
    slug: String(bruto.slug || bruto.id),
    title: String(bruto.title ?? "").trim(),
    description: String(bruto.description ?? "").trim(),
    url: bruto.url,
    canonical: bruto.canonical_url || bruto.url,
    publishedAt: bruto.published_at,
    editedAt: bruto.edited_at || bruto.published_at,
    readingTime: Number(bruto.reading_time_minutes ?? 0),
    tags: Array.isArray(bruto.tag_list) ? bruto.tag_list : String(bruto.tag_list ?? "").split(",").map((t) => t.trim()).filter(Boolean),
    cover: bruto.cover_image || null,
    language: String(bruto.language || "pt").slice(0, 2).toLowerCase(),
    reactions: Number(bruto.positive_reactions_count ?? bruto.public_reactions_count ?? 0),
    comments: Number(bruto.comments_count ?? 0),
  };
}

/**
 * Busca todos os artigos publicados, página por página, do mais novo para o
 * mais antigo. Lança erro se a API responder com falha.
 * @param {typeof fetch} buscar
 * @param {string} [usuario]
 * @returns {Promise<Artigo[]>}
 */
export async function buscarArtigos(buscar, usuario = USUARIO) {
  /** @type {Artigo[]} */
  const artigos = [];
  for (let pagina = 1; pagina <= 50; pagina += 1) {
    const resposta = await buscar(`${API}?username=${encodeURIComponent(usuario)}&per_page=${POR_PAGINA}&page=${pagina}`, { headers: CABECALHOS });
    if (!resposta.ok) throw new Error(`dev.to respondeu ${resposta.status} na página ${pagina}`);
    const lote = await resposta.json();
    if (!Array.isArray(lote)) throw new Error("dev.to devolveu um formato inesperado");
    artigos.push(...lote.map(normalizarArtigo).filter(eArtigoProprio));
    if (lote.length < POR_PAGINA) break;
  }
  return ordenar(artigos);
}

/**
 * Fica de fora o "[Boost]" do dev.to: é um compartilhamento do post de outra
 * pessoa, não um artigo do autor.
 * @param {Artigo} artigo
 */
export const eArtigoProprio = (artigo) => !/^\[boost\]$/i.test(artigo.title);

/**
 * Corpo de um artigo (GET /api/articles/:id), já limpo para entrar no site.
 * Tenta de novo quando a API pede calma (429).
 * @param {typeof fetch} buscar
 * @param {number} id
 * @param {(ms: number) => Promise<void>} [esperar]
 * @returns {Promise<string>}
 */
export async function buscarCorpo(buscar, id, esperar = (ms) => new Promise((ok) => setTimeout(ok, ms))) {
  for (let tentativa = 1; tentativa <= 4; tentativa += 1) {
    const resposta = await buscar(`${API}/${id}`, { headers: CABECALHOS });
    if (resposta.status === 429 && tentativa < 4) {
      await esperar(5000 * tentativa);
      continue;
    }
    if (!resposta.ok) throw new Error(`dev.to respondeu ${resposta.status} no artigo ${id}`);
    const artigo = await resposta.json();
    return limparHtml(String(artigo.body_html ?? ""));
  }
  throw new Error(`dev.to não respondeu o artigo ${id}`);
}

/**
 * O HTML do dev.to já vem sanitizado; aqui ele é ajustado para o site:
 * - saem os painéis de tela cheia dos blocos de código e os botões dos
 *   cards embutidos (só funcionam no dev.to), scripts e eventos inline;
 * - <h1> do texto vira <h2> (a página já tem o título como <h1>);
 * - blocos de código e tabelas ganham tabindex="0", para rolar pelo teclado;
 * - imagens e iframes carregam sob demanda.
 * Pode ser aplicada mais de uma vez sem mudar o resultado.
 * @param {string} html
 */
export function limparHtml(html) {
  return html
    .replace(/<div class="highlight__panel js-actions-panel">[\s\S]*?<\/div>\s*<\/div>/g, "")
    .replace(/<button\b[\s\S]*?<\/button>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/(href|src)\s*=\s*(["'])\s*javascript:[^"']*\2/gi, '$1="#"')
    .replace(/<(\/?)h1\b/gi, "<$1h2")
    // Âncora vazia do dev.to dentro dos títulos (link sem nome para o leitor
    // de tela): vira id do próprio título, e os links internos continuam valendo.
    .replace(/<a name="" href="#">\s*<\/a>\s*/gi, "")
    .replace(/<(h[2-6])([^>]*)>\s*<a name="([^"]+)" href="#[^"]*">\s*<\/a>\s*/gi, '<$1$2 id="$3">')
    .replace(/<a name="([^"]+)" href="#[^"]*">\s*<\/a>/gi, '<span id="$1"></span>')
    .replace(/<(pre|table)\b(?![^>]*\stabindex=)/gi, '<$1 tabindex="0"')
    .replace(/<(img|iframe)\b(?![^>]*\sloading=)/gi, '<$1 loading="lazy"')
    .trim();
}

/**
 * Do mais novo para o mais antigo, sem repetidos.
 * @param {Artigo[]} lista
 * @returns {Artigo[]}
 */
export function ordenar(lista) {
  const vistos = new Set();
  return [...lista]
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
    .filter((a) => (vistos.has(a.id) ? false : (vistos.add(a.id), true)));
}

/**
 * Artigos novos ou editados desde a última busca (os que precisam baixar o corpo).
 * @param {Artigo[]} atuais
 * @param {Artigo[]} salvos
 * @param {(id: number) => boolean} temCorpo
 */
export function precisamDeCorpo(atuais, salvos, temCorpo) {
  const antes = new Map(salvos.map((a) => [a.id, a]));
  return atuais.filter((a) => !temCorpo(a.id) || antes.get(a.id)?.editedAt !== a.editedAt);
}

const MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

/**
 * "2026-09-28T15:33:42Z" → "28 set 2026".
 * @param {string} iso
 */
export const dataCurta = (iso) => `${Number(iso.slice(8, 10))} ${MESES[Number(iso.slice(5, 7)) - 1]} ${iso.slice(0, 4)}`;

/**
 * Nome do idioma para o filtro e o selo do card.
 * @param {string} codigo
 */
export const nomeDoIdioma = (codigo) => ({ pt: "Português", en: "English", es: "Español" })[codigo] ?? codigo.toUpperCase();

/**
 * Idiomas presentes, do mais frequente para o menos.
 * @param {Artigo[]} lista
 * @returns {string[]}
 */
export function idiomas(lista) {
  const conta = new Map();
  for (const a of lista) conta.set(a.language, (conta.get(a.language) ?? 0) + 1);
  return [...conta].sort((a, b) => b[1] - a[1]).map(([codigo]) => codigo);
}
