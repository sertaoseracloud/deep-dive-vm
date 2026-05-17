# Phase 7: Hub Page - Context

**Gathered:** 2026-05-17
**Status:** Ready for planning

<domain>
## Phase Boundary

Transformar `src/pages/index.astro` (atualmente um placeholder minimalista com `noindex`) em um hub Linktree-style completo e indexável — com foto do mentor, bio, cards de cursos, links de redes sociais, e Open Graph para preview rico em WhatsApp/Instagram/LinkedIn. O hub deve ser mobile-first, compact, e não duplicar a estrutura da LP (sem NavBar, sem Footer).

</domain>

<decisions>
## Implementation Decisions

### D-01 — Layout Visual
- **Linktree-compact:** coluna única centralizada, sem NavBar (`NavBar.astro`), sem Footer (`Footer.astro`).
- Mantém o dark theme e o `ambient` background (radial gradiente + grid cyan) — herdado automaticamente do `Layout.astro`.
- Reutiliza `Layout.astro` existente — hub renderiza somente o conteúdo no `<slot />`. Nenhum `HubLayout.astro` separado será criado.

### D-02 — Foto do Mentor
- Usar `claudio2.png` (retrato 3/4, já asset Astro em `src/assets/claudio2.png`).
- Exibir como circular com `border-radius: 50%`, aprox. 96–128px de diâmetro.

### D-03 — Dados de Social Links (HUB-03)
- Criar `src/data/social-links.ts` exportando array tipado: `{ name: string, url: string, icon: 'instagram' | 'youtube' | 'whatsapp' | 'linkedin' }[]`.
- Redes: Instagram (`https://instagram.com/sertaoseracloud`), YouTube (`https://youtube.com/@sertaoseracloud`), WhatsApp (`https://wa.me/PLACEHOLDER` — substituído pelo usuário antes do deploy), LinkedIn (`https://linkedin.com/in/cfraposo/`).
- Componente não é alterado para atualizar links — apenas o arquivo de dados.

### D-04 — Dados de Cursos (HUB-02)
- Criar `src/data/courses.ts` exportando array tipado: `{ title: string, description: string, url: string, status: 'active' | 'coming-soon' }[]`.
- Cursos iniciais:
  - Deep Dive Azure VM — url: `/deep-dive-vm/`, status: `'active'`
  - Deep Dive EC2 — url: `/deep-dive-ec2/`, status: `'coming-soon'`
- Preparado para extensão na Fase 8 sem alterar o componente do hub.

### D-05 — Ícones das Redes Sociais
- Criar `src/components/ui/SocialIcon.astro` com SVG inline para cada rede (`instagram`, `youtube`, `whatsapp`, `linkedin`).
- Zero novas dependências de runtime — paths SVG embutidos diretamente no componente.
- Exibir **só ícone + `aria-label`** (sem label de texto visível). Ex: `aria-label="Seguir no Instagram"`.

### D-06 — OG Image do Hub (HUB-04)
- Criar `public/hub-og.png` como placeholder 1200×630px (executor pode copiar `claudio1.png` redimensionado como placeholder). Usuário substitui o arquivo antes do deploy.
- Adicionar prop `ogImage?: string` ao `Layout.astro` — hub passa `ogImage="/hub-og.png"`, LP não passa nada (fallback: `claudio1.png` como atualmente).
- Hub passa `url="https://mentoria.sertaoseracloud.com/"` ao Layout para canonical correto.

### D-07 — Noindex do Hub (remoção)
- O placeholder atual `src/pages/index.astro` tem `<meta slot="head" name="robots" content="noindex" />`.
- Na Fase 7, esse noindex deve ser **removido** — o hub é agora uma página indexável.
- O Layout.astro pós-CR-02 aceita `noindex?: boolean` (padrão: `false`/indexável). Hub não deve passar `noindex`.

### Claude's Discretion
- Espaçamento interno do hub, tamanho de fonte da bio, gap entre cards — usar design system existente (--abismo-profundo, --nucleo-eletrico, --texto-principal, Space Grotesk).
- Bio text (frase curta de apresentação) — usar o texto já existente em `Mentor.astro` como referência, mas condensar para 1-2 linhas.
- Hover states dos ícones sociais e cards — manter padrão do projeto (transition/cyan).

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Roadmap e Requisitos
- `.planning/ROADMAP.md` §Phase 7 — Goal, Success Criteria, Requirements (HUB-01 a HUB-04)
- `.planning/REQUIREMENTS.md` §HUB — Requisitos HUB-01, HUB-02, HUB-03, HUB-04 com critérios exatos

### Código Existente (leitura obrigatória antes de implementar)
- `src/layouts/Layout.astro` — interface Props atual (title, description, url, offersUrl, noindex), OG config, slot head, ambient background
- `src/pages/index.astro` — arquivo que será substituído (placeholder atual com noindex via slot)
- `src/components/sections/Mentor.astro` — bio e credenciais existentes (referência para texto da bio condensada)
- `src/assets/claudio2.png` — foto do mentor para o hub
- `src/assets/claudio1.png` — foto usada como OG fallback no Layout.astro

### Testes que precisam ser atualizados
- `tests/unit/components/Layout.test.ts` — verifica props do Layout; prop ogImage nova deve ser testada
- `tests/seo/seo-meta.test.ts` — verifica OG tags no built HTML; hub-og.png deve aparecer no hub
- `tests/e2e/homepage.spec.ts` — navega para `./deep-dive-vm/`; hub em `./` pode precisar de cobertura
- `tests/e2e/accessibility.spec.ts` — hub precisa de skip link e estrutura acessível

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/assets/claudio2.png` — asset Astro processado com `<Image>`, já usado em `Mentor.astro` (circular no hub)
- `src/assets/claudio1.png` — OG image atual da LP; Layout.astro usa como padrão via `${siteOrigin}${claudio1.src}`
- `src/components/ui/Button.astro` — componente reutilizável se cards precisarem de CTA button
- `src/components/ui/SectionHead.astro` — eyebrow + title heading (opcional para o hub se necessário)
- Design tokens em `Layout.astro` `<style is:global>`: --chama-primaria, --nucleo-eletrico, --abismo-profundo, --texto-principal, --texto-secundario

### Established Patterns
- `Layout.astro` como wrapper universal — hub segue o mesmo padrão da LP
- `astro-seo` para Open Graph — prop-based, não slot-based (post CR-02 fix)
- Nenhuma biblioteca de ícones no projeto — SVG inline é o padrão a seguir
- `src/data/` não existe ainda — será criado na Fase 7 (novo padrão de dados)

### Integration Points
- `src/pages/index.astro` — arquivo alvo da fase, será reescrito
- `src/layouts/Layout.astro` — receberá prop `ogImage?: string` nova
- `astro.config.mjs` — sitemap já filtra a rota raiz (`mentoria.sertaoseracloud.com/`); com o hub real indexável, o filtro deve ser **removido** para o hub aparecer no sitemap
- `tests/unit/components/Layout.test.ts` — testa o built HTML; prop ogImage altera o og:image do hub

</code_context>

<specifics>
## Specific Ideas

- Hub deve funcionar como Linktree de divulgação para WhatsApp/Instagram — mobile-first é prioridade absoluta
- Preview social (og:image) é o entregável mais visível: uma boa imagem 1200×630px com foto + nome + tagline é o que aparece ao compartilhar o link
- `public/hub-og.png` é placeholder — usuário deve substituir com a imagem final antes do primeiro deploy com o hub real
- WhatsApp link (`wa.me/PLACEHOLDER`) deve ser substituído em `src/data/social-links.ts` antes do deploy
- Sitemap: `astro.config.mjs` atualmente filtra `https://mentoria.sertaoseracloud.com/` (adicionado na Fase 6 por CR-03). Com o hub indexável, esse filtro deve ser **removido** para o hub aparecer em `sitemap-0.xml`

</specifics>

<deferred>
## Deferred Ideas

- **OG image dinâmico via Satori** — já em `REQUIREMENTS.md §Future Requirements`; deferred para após hub validado em produção
- **Analytics cookieless (Plausible)** — deferred para fase posterior
- **Entrance animations no hub** — deferred para após hub validado
- **Bio completa do mentor** no hub — mantida condensada; bio extendida pertence à LP

</deferred>

---

*Phase: 7-hub-page*
*Context gathered: 2026-05-17*
