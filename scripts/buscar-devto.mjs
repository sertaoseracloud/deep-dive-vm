// Busca os artigos do dev.to para o blog do site:
//   - src/data/devto-artigos.json   lista (cards da aba Blog)
//   - src/data/devto/<id>.html      corpo de cada artigo (páginas /blog/<slug>/)
// Roda na pipeline de publicação (todo dia à meia-noite de Brasília) antes do
// build; também dá para rodar à mão: node scripts/buscar-devto.mjs
// Só baixa o corpo dos artigos novos ou editados. Se a API falhar, mantém o
// que já está salvo e sai com sucesso: o site é publicado com a última versão
// boa em vez de quebrar.
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { buscarArtigos, buscarCorpo, precisamDeCorpo } from "../src/lib/devto.js";

const lista = new URL("../src/data/devto-artigos.json", import.meta.url);
const pasta = new URL("../src/data/devto/", import.meta.url);
const corpo = (id) => new URL(`${id}.html`, pasta);
const pausa = (ms) => new Promise((ok) => setTimeout(ok, ms));

try {
  mkdirSync(pasta, { recursive: true });
  const salvos = existsSync(lista) ? JSON.parse(readFileSync(lista, "utf8")) : [];
  const artigos = await buscarArtigos(fetch);
  if (artigos.length === 0) throw new Error("nenhum artigo retornado");

  const baixar = precisamDeCorpo(artigos, salvos, (id) => existsSync(corpo(id)));
  for (const [i, artigo] of baixar.entries()) {
    writeFileSync(corpo(artigo.id), `${await buscarCorpo(fetch, artigo.id)}\n`);
    if (i < baixar.length - 1) await pausa(1100); // a API pública aceita ~1 pedido por segundo
  }

  // Corpos de artigos que saíram do dev.to.
  const ids = new Set(artigos.map((a) => `${a.id}.html`));
  for (const arquivo of readdirSync(pasta)) if (arquivo.endsWith(".html") && !ids.has(arquivo)) rmSync(new URL(arquivo, pasta));

  writeFileSync(lista, `${JSON.stringify(artigos, null, 2)}\n`);
  console.log(`dev.to: ${artigos.length} artigos (antes: ${salvos.length}); ${baixar.length} corpos baixados.`);
} catch (erro) {
  console.warn(`::warning::dev.to indisponível (${erro.message}); usando o que está salvo.`);
}
