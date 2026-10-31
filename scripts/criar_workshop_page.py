import pathlib

conteudo = r'''---
import Layout from "../layouts/Layout.astro";

const title = "Workshop: Assessment de Migração de Workload | O Sertão será Cloud";
const description = "Transforme incerteza em plano de assessment estruturado com entregáveis validados e estudo de caso real. Para SREs, Arquitetos e Tech Leads.";
const url = "https://mentoria.sertaoseracloud.com/workshop-assessment";

const entregaveis = [
  { titulo: "Matriz de Risco de Migração", descricao: "Classificação técnica e de negócio para priorizar workloads" },
  { titulo: "Checklist de Descoberta", descricao: "50+ pontos de validação automatizável para não esquecer nada" },
  { titulo: "Template de Business Case", descricao: "ROI, TCO e cronograma executivo para justificar investimento" },
  { titulo: "Relatório de Gap Analysis", descricao: "Estado atual vs. target architecture com lacunas mapeadas" },
  { titulo: "Plano de Execução Fatiado", descricao: "Waves de migração com rollback definido por fase" },
];

const publicoAlvo = [
  "Arquitetos de Cloud e SREs responsáveis por migrações",
  "Tech Leads que precisam justificar investimentos em modernização",
  "Consultores que entregam assessments para clientes enterprise",
];

const metodologia = [
  { titulo: "Estudo de Caso Real", descricao: "Migração de monólito on-premise para Kubernetes multi-cloud" },
  { titulo: "Hands-on Guiado", descricao: "Preenchimento de todos os templates durante o workshop" },
  { titulo: "Peer Review", descricao: "Validação cruzada entre participantes para calibrar critérios" },
  { titulo: "Certificado Validado", descricao: "Com carga horária e competências específicas" },
];

const faq = [
  { pergunta: "Preciso ter experiência prévia com Kubernetes?", resposta: "Não. O foco é assessment de migração, não operação de cluster. Você precisa entender conceitos básicos de infraestrutura, mas não precisa ser especialista em K8s." },
  { pergunta: "Os templates funcionam fora do cenário do estudo de caso?", resposta: "Sim. A matriz de risco, checklist e business case foram desenhados para serem genéricos. O estudo de caso serve como exemplo preenchido, mas você adapta para qualquer workload." },
  { pergunta: "E se eu não puder assistir ao vivo?", resposta: "A gravação fica disponível imediatamente após o workshop. Os templates editáveis são enviados antes da sessão para você acompanhar no seu ritmo." },
  { pergunta: "Isso substitui uma consultoria de migração?", resposta: "Não. Este workshop entrega o framework e os artefatos para você conduzir assessments. Consultorias usam esses mesmos artefatos internamente." },
  { pergunta: "O preço inclui impostos e nota fiscal?", resposta: "Sim. R$ 297 é o valor final com NF-e emitida automaticamente após confirmação do pagamento." },
];
---

<Layout title={title} description={description} url={url}>
  <main class="workshop-page">
    <nav class="workshop-nav" aria-label="Navegação do workshop">
      <div class="nav-inner">
        <span class="nav-brand">Assessment de Migração</span>
        <ul class="nav-links">
          <li><a href="#entregaveis">Entregáveis</a></li>
          <li><a href="#metodologia">Metodologia</a></li>
          <li><a href="#publico">Para Quem</a></li>
          <li><a href="#faq">Dúvidas</a></li>
          <li><a href="#investimento" class="nav-cta">Garantir Vaga</a></li>
        </ul>
      </div>
    </nav>

    <section class="hero">
      <div class="hero-content">
        <p class="eyebrow">WORKSHOP PRÁTICO · 8 HORAS · ENTREGÁVEIS VALIDADOS</p>
        <h1>Seu workload pode ser crítico<br />e continuar sendo um risco invisível.</h1>
        <p class="hero-sub">Muitas equipes operam workloads legados ou híbridos sem visibilidade real dos riscos de migração. Este workshop transforma incerteza em um <strong>plano de assessment estruturado</strong>, com entregáveis validados e estudo de caso real.</p>
        <div class="hero-actions">
          <a href="#investimento" class="btn-primary">Quero garantir minha vaga</a>
          <a href="#entregaveis" class="btn-ghost">Ver o que vou entregar</a>
        </div>
      </div>
    </section>

    <section class="problem">
      <div class="container">
        <h2>O custo de migrar sem assessment</h2>
        <div class="problem-grid">
          <div class="problem-card">
            <h3>Risco técnico oculto</h3>
            <p>Dependências não documentadas e configurações drift só aparecem em produção. Sem assessment, você descobre isso durante a migração — quando o custo é 10x maior.</p>
          </div>
          <div class="problem-card">
            <h3>Business case frágil</h3>
            <p>Sem ROI calculado e TCO comparado, o projeto perde patrocínio na primeira revisão trimestral. "Cloud é melhor" não sobrevive a reunião de budget.</p>
          </div>
          <div class="problem-card">
            <h3>Migração infinita</h3>
            <p>Sem waves definidas e critérios de rollback, a migração vira projeto eterno. Stakeholders perdem confiança e o legado continua rodando em paralelo.</p>
          </div>
        </div>
      </div>
    </section>

    <section id="entregaveis" class="deliverables">
      <div class="container">
        <p class="eyebrow">KIT DE ASSESSMENT COMPLETO</p>
        <h2>O que você vai entregar ao final</h2>
        <p class="section-sub">Não é conteúdo teórico. São artefatos prontos para usar no dia seguinte.</p>
        <div class="deliverables-grid">
          {entregaveis.map((item, i) => (
            <article class="deliverable-card">
              <span class="deliverable-number">{String(i + 1).padStart(2, '0')}</span>
              <h3>{item.titulo}</h3>
              <p>{item.descricao}</p>
            </article>
          ))}
        </div>
      </div>
    </section>

    <section id="publico" class="audience">
      <div class="container">
        <h2>Para quem é este workshop</h2>
        <ul class="audience-list">
          {publicoAlvo.map((item) => (
            <li><span class="check" aria-hidden="true">✓</span>{item}</li>
          ))}
        </ul>
        <div class="audience-note">
          <p><strong>Não é para você se:</strong> busca certificação teórica, quer aprender Kubernetes do zero, ou espera solução mágica. Assessment é trabalho estruturado.</p>
        </div>
      </div>
    </section>

    <section id="metodologia" class="methodology">
      <div class="container">
        <p class="eyebrow">COMO FUNCIONA</p>
        <h2>Metodologia prática, não palestra</h2>
        <div class="methodology-grid">
          {metodologia.map((item) => (
            <article class="method-card">
              <h3>{item.titulo}</h3>
              <p>{item.descricao}</p>
            </article>
          ))}
        </div>
      </div>
    </section>

    <section class="authority">
      <div class="container">
        <h2>Quem conduz</h2>
        <div class="authority-content">
          <p><strong>Cláudio Rapôso</strong> é Microsoft MVP e arquiteto de soluções com mais de 15 anos de experiência em infraestrutura e cloud. Já conduziu assessments de migração para empresas de varejo, fintech e saúde.</p>
          <ul class="authority-stats">
            <li><strong>15+ anos</strong> em arquitetura de infraestrutura</li>
            <li><strong>Microsoft MVP</strong> reconhecido pela comunidade</li>
            <li><strong>3+ assessments</strong> conduzidos com estes artefatos</li>
          </ul>
        </div>
      </div>
    </section>

    <section id="investimento" class="offer">
      <div class="container">
        <div class="offer-card">
          <p class="eyebrow">INVESTIMENTO</p>
          <h2>R$ 297,00</h2>
          <p class="offer-includes">Inclui templates editáveis + gravação + acesso à comunidade</p>
          <div class="turmas">
            <h3>Próximas Turmas</h3>
            <div class="turma-options">
              <label class="turma-option">
                <input type="radio" name="turma" value="2026-11-22" checked />
                <div class="turma-info"><strong>Turma 1</strong><span>22/Nov/2026 · Sábado · 09h–17h</span></div>
              </label>
              <label class="turma-option">
                <input type="radio" name="turma" value="2026-12-12" />
                <div class="turma-info"><strong>Turma 2</strong><span>12/Dez/2026 · Sábado · 09h–13h</span></div>
              </label>
            </div>
          </div>
          <a href="#" class="btn-primary btn-large">Quero garantir minha vaga</a>
          <p class="offer-note">Pagamento via PIX ou cartão. NF-e automática.</p>
        </div>
      </div>
    </section>

    <section id="faq" class="faq-section">
      <div class="container">
        <h2>Dúvidas honestas</h2>
        <div class="faq-list">
          {faq.map((item) => (
            <details class="faq-item">
              <summary>{item.pergunta}</summary>
              <p>{item.resposta}</p>
            </details>
          ))}
        </div>
      </div>
    </section>

    <section class="final-cta">
      <div class="container">
        <h2>Pronto para transformar incerteza em plano?</h2>
        <a href="#investimento" class="btn-primary btn-large">Garantir minha vaga agora</a>
      </div>
    </section>
  </main>
</Layout>

<style is:global>
  .workshop-page { --accent-workshop: #00e5a8; position: relative; z-index: 1; }
  .workshop-nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; background: rgb(var(--rgb-cartao) / 0.92); backdrop-filter: blur(12px); border-bottom: 1px solid var(--hairline); }
  .nav-inner { max-width: 992px; margin: 0 auto; padding: 12px 24px; display: flex; align-items: center; justify-content: space-between; gap: 16px; }
  .nav-brand { font-family: var(--font-display); font-size: 0.875rem; font-weight: 600; color: var(--texto-principal); }
  .nav-links { display: flex; align-items: center; gap: 4px; list-style: none; margin: 0; padding: 0; }
  .nav-links a { display: inline-flex; padding: 8px 12px; font-family: var(--font-body); font-size: 0.8125rem; color: var(--texto-secundario); text-decoration: none; border-radius: 4px; transition: color 0.15s, background 0.15s; }
  .nav-links a:hover { color: var(--texto-principal); background: rgb(var(--rgb-ciano) / 0.06); }
  .nav-cta { background: var(--chama-primaria) !important; color: var(--texto-principal) !important; font-weight: 600 !important; }
  .nav-cta:hover { background: var(--chama-hover) !important; }
  @media (max-width: 720px) { .nav-links li:not(:last-child) { display: none; } }
  .container { max-width: 992px; margin: 0 auto; padding: 0 24px; }
  .eyebrow { font-family: var(--font-mono); font-size: 0.6875rem; letter-spacing: 0.28em; text-transform: uppercase; color: var(--accent-workshop); margin: 0 0 12px; }
  .hero { padding: 160px 24px 96px; text-align: center; }
  .hero-content { max-width: 720px; margin: 0 auto; }
  .hero h1 { font-family: var(--font-display); font-size: clamp(1.75rem, 4vw, 2.625rem); font-weight: 600; line-height: 1.05; color: var(--texto-principal); margin: 0 0 24px; }
  .hero-sub { font-family: var(--font-body); font-size: 1.0625rem; line-height: 1.6; color: var(--texto-secundario); margin: 0 0 40px; max-width: 62ch; margin-left: auto; margin-right: auto; }
  .hero-sub strong { color: var(--texto-principal); font-weight: 500; }
  .hero-actions { display: flex; flex-wrap: wrap; justify-content: center; gap: 12px; }
  .btn-primary { display: inline-flex; align-items: center; justify-content: center; min-height: 48px; padding: 14px 28px; background: var(--chama-primaria); color: var(--texto-principal); font-family: var(--font-body); font-size: 0.9375rem; font-weight: 600; text-decoration: none; border-radius: 2px; border: none; cursor: pointer; transition: background 0.15s; }
  .btn-primary:hover { background: var(--chama-hover); }
  .btn-ghost { display: inline-flex; align-items: center; justify-content: center; min-height: 48px; padding: 14px 28px; background: transparent; color: var(--nucleo-eletrico); font-family: var(--font-body); font-size: 0.9375rem; font-weight: 600; text-decoration: none; border-radius: 2px; border: 1px solid var(--hairline-strong); transition: background 0.15s; }
  .btn-ghost:hover { background: rgb(var(--rgb-ciano) / 0.06); }
  .btn-large { padding: 18px 40px; font-size: 1rem; width: 100%; max-width: 400px; }
  section { padding: 80px 0; }
  section h2 { font-family: var(--font-display); font-size: clamp(1.375rem, 3vw, 2rem); font-weight: 600; line-height: 1.1; color: var(--texto-principal); margin: 0 0 16px; }
  .section-sub { font-family: var(--font-body); font-size: 1rem; line-height: 1.55; color: var(--texto-secundario); margin: 0 0 48px; max-width: 60ch; }
  .problem { background: var(--sub-nivel); }
  .problem-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px; margin-top: 40px; }
  .problem-card { padding: 32px 24px; background: rgb(var(--rgb-cartao) / 0.5); border: 1px solid var(--hairline); border-radius: 4px; }
  .problem-card h3 { font-family: var(--font-body); font-size: 1.125rem; font-weight: 500; color: var(--texto-principal); margin: 0 0 12px; }
  .problem-card p { font-family: var(--font-body); font-size: 0.9375rem; line-height: 1.55; color: var(--texto-secundario); margin: 0; }
  .deliverables-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; }
  .deliverable-card { padding: 28px 24px; background: rgb(var(--rgb-cartao) / 0.5); border: 1px solid var(--hairline); border-radius: 4px; position: relative; }
  .deliverable-number { font-family: var(--font-mono); font-size: 2rem; font-weight: 700; color: var(--accent-workshop); opacity: 0.3; line-height: 1; margin-bottom: 12px; display: block; }
  .deliverable-card h3 { font-family: var(--font-body); font-size: 1.0625rem; font-weight: 500; color: var(--texto-principal); margin: 0 0 8px; }
  .deliverable-card p { font-family: var(--font-body); font-size: 0.875rem; line-height: 1.5; color: var(--texto-secundario); margin: 0; }
  .audience-list { list-style: none; padding: 0; margin: 0 0 32px; display: grid; gap: 16px; }
  .audience-list li { font-family: var(--font-body); font-size: 1rem; line-height: 1.5; color: var(--texto-principal); display: flex; align-items: baseline; gap: 12px; }
  .check { color: var(--accent-workshop); font-weight: 700; flex-shrink: 0; }
  .audience-note { padding: 20px 24px; background: rgb(var(--rgb-ciano) / 0.04); border-left: 3px solid var(--accent-workshop); border-radius: 0 4px 4px 0; }
  .audience-note p { font-family: var(--font-body); font-size: 0.9375rem; line-height: 1.55; color: var(--texto-secundario); margin: 0; }
  .audience-note strong { color: var(--texto-principal); }
  .methodology-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px; margin-top: 40px; }
  .method-card { padding: 28px 24px; border: 1px solid var(--hairline); border-radius: 4px; }
  .method-card h3 { font-family: var(--font-body); font-size: 1rem; font-weight: 600; color: var(--accent-workshop); margin: 0 0 8px; }
  .method-card p { font-family: var(--font-body); font-size: 0.875rem; line-height: 1.5; color: var(--texto-secundario); margin: 0; }
  .authority { background: var(--sub-nivel); }
  .authority-content p { font-family: var(--font-body); font-size: 1.0625rem; line-height: 1.6; color: var(--texto-secundario); margin: 0 0 24px; max-width: 65ch; }
  .authority-content strong { color: var(--texto-principal); }
  .authority-stats { list-style: none; padding: 0; margin: 0; display: flex; flex-wrap: wrap; gap: 32px; }
  .authority-stats li { font-family: var(--font-body); font-size: 0.9375rem; color: var(--texto-secundario); }
  .authority-stats strong { color: var(--texto-principal); font-weight: 600; display: block; font-size: 1.125rem; margin-bottom: 2px; }
  .offer { text-align: center; }
  .offer-card { max-width: 520px; margin: 0 auto; padding: 48px 32px; background: rgb(var(--rgb-cartao) / 0.6); border: 1px solid var(--hairline); border-radius: 8px; }
  .offer-card h2 { font-size: clamp(2rem, 5vw, 3rem); margin: 0 0 8px; }
  .offer-includes { font-family: var(--font-body); font-size: 0.9375rem; color: var(--texto-secundario); margin: 0 0 32px; }
  .turmas { margin: 32px 0; text-align: left; }
  .turmas h3 { font-family: var(--font-body); font-size: 1rem; font-weight: 600; color: var(--texto-principal); margin: 0 0 16px; text-align: center; }
  .turma-options { display: grid; gap: 12px; }
  .turma-option { display: flex; align-items: center; gap: 12px; padding: 16px; border: 1px solid var(--hairline); border-radius: 4px; cursor: pointer; transition: border-color 0.15s, background 0.15s; }
  .turma-option:has(input:checked) { border-color: var(--accent-workshop); background: rgb(var(--rgb-ciano) / 0.04); }
  .turma-option input { accent-color: var(--accent-workshop); }
  .turma-info { display: flex; flex-direction: column; gap: 2px; }
  .turma-info strong { font-family: var(--font-body); font-size: 0.9375rem; color: var(--texto-principal); }
  .turma-info span { font-family: var(--font-body); font-size: 0.8125rem; color: var(--texto-secundario); }
  .offer-note { font-family: var(--font-body); font-size: 0.8125rem; color: var(--texto-secundario); margin: 16px 0 0; }
  .faq-list { display: grid; gap: 8px; margin-top: 40px; max-width: 720px; }
  .faq-item { border: 1px solid var(--hairline); border-radius: 4px; overflow: hidden; }
  .faq-item summary { padding: 18px 24px; font-family: var(--font-body); font-size: 0.9375rem; font-weight: 500; color: var(--texto-principal); cursor: pointer; list-style: none; display: flex; align-items: center; justify-content: space-between; gap: 16px; }
  .faq-item summary::-webkit-details-marker { display: none; }
  .faq-item summary::after { content: "+"; font-family: var(--font-mono); font-size: 1.25rem; color: var(--accent-workshop); flex-shrink: 0; }
  .faq-item[open] summary::after { content: "−"; }
  .faq-item p { padding: 0 24px 18px; font-family: var(--font-body); font-size: 0.875rem; line-height: 1.6; color: var(--texto-secundario); margin: 0; }
  .final-cta { text-align: center; padding: 96px 0; }
  .final-cta h2 { margin: 0 0 32px; }
  @media (max-width: 600px) {
    .hero { padding: 120px 20px 64px; }
    .hero-actions { flex-direction: column; align-items: stretch; }
    .btn-large { max-width: none; }
    .authority-stats { flex-direction: column; gap: 16px; }
    .offer-card { padding: 32px 20px; }
    .faq-item summary { padding: 16px 20px; }
    .faq-item p { padding: 0 20px 16px; }
  }
</style>
'''

destino = pathlib.Path("src/pages/workshop-assessment.astro")
destino.parent.mkdir(parents=True, exist_ok=True)
destino.write_text(conteudo, encoding="utf-8")
print(f"Arquivo criado: {destino}")