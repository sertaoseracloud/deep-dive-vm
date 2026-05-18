---
status: complete
phase: 09-python-neurodivergentes
source: 09-01-SUMMARY.md, 09-02-SUMMARY.md, 09-03-SUMMARY.md
started: 2026-05-18T08:30:00Z
updated: 2026-05-18T08:35:00Z
---

## Current Test

[testing complete]

## Tests

### 1. LP Python carrega em /deep-dive-python-neurodivergentes/
expected: Abrindo http://localhost:4321/deep-dive-python-neurodivergentes/ no browser, a página carrega completa — sem 404, sem tela branca, sem erros no console.
result: pass

### 2. Hero — conteúdo e CTAs
expected: O Hero exibe o H1 "Pare de começar 10 cursos de Python e abandonar todos. Aprenda do jeito que seu cérebro pede.", os 4 bullet points, o botão primário "Quero aprender Python do meu jeito" (→ #investimento) e o botão ghost "Ver Ementa Completa" (→ #ementa). A foto do Cláudio aparece com "⟡ 2× MVP · MICROSOFT" e "⟡ NEURODIVERGENT-FRIENDLY".
result: pass

### 3. Hub exibe card Python ativo
expected: Abrindo http://localhost:4321/ no browser, aparece um card "Python para Neurodivergentes" com link funcional para /deep-dive-python-neurodivergentes/ — sem badge "Em breve". O hub exibe agora 3 cards no total.
result: pass

### 4. Seção Pricing — conteúdo fiel ao wireframe
expected: A seção Pricing (#investimento) exibe: título "Python que respeita seu cérebro · pelo preço de uma consulta", ribbon "⟡ ACESSO COMPLETO · ECONOMIA DE R$ 1.050", preço 12× R$ 78,92 / R$ 947 PIX, e exatamente 7 includes: 60h micro-aulas, 06 módulos/30 projetos/5 frentes, Cookbook Python 50+ scripts, 6 sessões 1:1, Body Doubling semanal, Certificado, Acesso 12 meses.
result: pass

### 5. Seção Mentor — credenciais corretas
expected: A seção Mentor exibe Cláudio com tagline "⟡ SYSTEMS ARCHITECT · 2× MVP · 10× MSFT CERTIFIED · NEURODIVERGENTE" e 3 credenciais: "2× MICROSOFT MVP AWARD", "10× MICROSOFT CERTIFIED", "7× AWS CERTIFIED".
result: pass

### 6. Todas as 11 seções presentes e na ordem correta
expected: Scrollando a página, aparecem em ordem: Hero → TrustBand (TDAH/Autismo/Dislexia/Ansiedade) → PainPoints (5 cards) → Method (5 frentes) → Curriculum (6 módulos com accordion) → Mentor → ForWho (Para quem é / Não é) → Bonuses (3 bônus) → Pricing → FAQ (7 perguntas) → FinalCTA ("Python do jeito que seu cérebro pede.") → Footer. Sem seção Testimonials.
result: pass

### 7. Curriculum — 6 módulos expandíveis
expected: A seção Currículo (#ementa) exibe 6 módulos. M.01 (8H) começa aberto com as 5 frentes visíveis. Clicando em M.02–M.06, cada um abre e exibe suas 5 frentes (VISUAL, HANDS-ON, REPETIÇÃO, PROJETO, BODY DOUBLING).
result: pass

### 8. Sticky CTA mobile
expected: Em viewport mobile (ou reduzindo o browser para largura < 720px), aparece a barra sticky "DESDE 12× R$ 78,92" com botão "Quero começar →" no rodapé da tela.
result: pass

### 9. VM LP sem regressão
expected: Abrindo http://localhost:4321/deep-dive-vm/ no browser, a página carrega normalmente com todo o conteúdo original — seção Pricing exibe "TURMA CHAMA AZUL 01", preço 12× R$ 78,92, 8 includes, Testimonials presente.
result: pass

## Summary

total: 9
passed: 9
issues: 0
pending: 0
skipped: 0

## Gaps

[none yet]
