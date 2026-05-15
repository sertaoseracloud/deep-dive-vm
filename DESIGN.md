---
name: Deep Dive Azure VM · O Sertão será Cloud
description: Formação técnica de elite para Engenheiros que viram Arquitetos de Nuvem
colors:
  chama-primaria: "#1a3ac8"
  chama-hover: "#2548e0"
  nucleo-eletrico: "#00ffff"
  abismo-profundo: "#0a0f1e"
  sub-nivel: "#1b293c"
  neutro-escuro: "#000000"
  texto-principal: "#ffffff"
  texto-secundario: "#d1d9e6"
  texto-terciario: "#8a99b5"
  sucesso: "#00e5a8"
  alerta: "#ffb547"
  hairline: "rgba(209,217,230,0.12)"
  hairline-strong: "rgba(0,255,255,0.32)"
typography:
  display:
    fontFamily: "'Chakra Petch', sans-serif"
    fontSize: "clamp(26px, 3vw, 42px)"
    fontWeight: 600
    lineHeight: 1.05
    letterSpacing: "-0.012em"
  headline:
    fontFamily: "'Chakra Petch', sans-serif"
    fontSize: "clamp(22px, 2.5vw, 34px)"
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: "-0.01em"
  title:
    fontFamily: "'Space Grotesk', sans-serif"
    fontSize: "18px"
    fontWeight: 500
    lineHeight: 1.3
  body:
    fontFamily: "'Space Grotesk', sans-serif"
    fontSize: "14px"
    fontWeight: 300
    lineHeight: 1.55
  label:
    fontFamily: "'JetBrains Mono', monospace"
    fontSize: "11px"
    fontWeight: 400
    letterSpacing: "0.28em"
rounded:
  sharp: "2px"
  soft: "4px"
  circle: "50%"
spacing:
  xs: "8px"
  sm: "16px"
  md: "28px"
  lg: "40px"
  xl: "64px"
  section: "96px"
components:
  button-primary:
    backgroundColor: "{colors.chama-primaria}"
    textColor: "{colors.texto-principal}"
    rounded: "{rounded.sharp}"
    padding: "18px 28px"
  button-primary-hover:
    backgroundColor: "{colors.chama-hover}"
    textColor: "{colors.texto-principal}"
  button-primary-massive:
    backgroundColor: "{colors.chama-primaria}"
    textColor: "{colors.texto-principal}"
    rounded: "{rounded.sharp}"
    padding: "22px 40px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.nucleo-eletrico}"
    rounded: "{rounded.sharp}"
    padding: "18px 28px"
  button-ghost-hover:
    backgroundColor: "rgba(0,255,255,0.06)"
    textColor: "{colors.nucleo-eletrico}"
  button-solid-core:
    backgroundColor: "{colors.nucleo-eletrico}"
    textColor: "{colors.abismo-profundo}"
    rounded: "{rounded.sharp}"
    padding: "18px 28px"
---

# Design System: Deep Dive Azure VM · O Sertão será Cloud

## 1. Overview

**Creative North Star: "A Forja do Arquiteto"**

Este é o ambiente onde metal técnico encontra calor humano brasileiro. Escuro como um datacenter às 2h da manhã, preciso como um `terraform plan` sem erros, mas carregado de uma energia que só existe quando o trabalho é executado por alguém que domina o que faz. O design não decora — prova. Cada pixel comunica autoridade antes que qualquer palavra seja lida.

O sistema recusa quatro posições ao mesmo tempo: não tem a placidez cream do SaaS genérico, não tem a amateurismo de curso de YouTube, não tem o neon vazio do hacker clichê, e não tem a frieza documental das Big Techs. É uma quarta coisa: técnico sem ser frio, brasileiro sem ser folclórico, ousado sem ser barulhento.

A paleta é uma declaração. O abismo profundo (`#0a0f1e`) não é background — é o chão do datacenter. O Núcleo Elétrico (`#00ffff`) não é acento — é o sinal de que a máquina está viva. A Chama Azul (`#1a3ac8`) não é cor de botão — é o veículo da transformação. Tudo o mais serve à legibilidade desse sistema de três vozes.

**Key Characteristics:**
- Dark por convicção, não por tendência — emerge do ambiente real dos usuários
- Glow como linguagem de profundidade — quem brilha, flutua; quem não brilha, ancora
- Tipografia em três registros: Chakra Petch (impacto técnico), Space Grotesk (clareza humana), JetBrains Mono (autoridade de terminal)
- Bordas como molduras, não sombras como profundidade
- Grade ciana como textura de fundo — a infraestrutura visível por baixo de tudo

## 2. Colors: A Paleta da Forja

Três papéis visuais bem separados. Primário e secundário não competem — o azul estrutura, o ciano pontua.

### Primary
- **Azul Chama** (`#1a3ac8`): A cor de ação e transformação. Usado em botões primários, ribbons de preço e elementos de conversão. Representa o calor da forja — não é azul corporativo, é ignição.
- **Azul Chama Ativo** (`#2548e0`): Estado hover do primário. Shift ligeiro de luminosidade, não de hue.

### Secondary
- **Núcleo Elétrico** (`#00ffff`): O sinal de vida do sistema. Usado em ícones de confirmação, links hover, bordas de ênfase (`hairline-strong`), glows e qualquer elemento que precisa comunicar "ativo" ou "essencial". **Nunca como cor de fundo de superfície** — perde o poder.

### Tertiary
- **Sucesso Teal** (`#00e5a8`): Confirmações positivas, checks de garantia. Tom mais quente que o Núcleo Elétrico, resolve conflito visual quando ambos precisam coexistir.
- **Alerta Âmbar** (`#ffb547`): Avisos, urgência calibrada. Único warm tone no sistema.

### Neutral
- **Abismo Profundo** (`#0a0f1e`): Background raiz. Contém um toque de azul marinho para manter a coerência com o azul chama — não é preto puro.
- **Sub-nível** (`#1b293c`): Superfícies elevadas, cards com profundidade, fundos de seção com variação.
- **Neutro Escuro** (`#000000`): Reservado; raramente superfície, usado em overlays e elementos que precisam de contraste máximo.
- **Texto Principal** (`#ffffff`): Headlines, labels de destaque, texto sobre superfícies escuras.
- **Texto Secundário** (`#d1d9e6`): Body copy, descrições, a maior parte do conteúdo de suporte.
- **Texto Terciário** (`#8a99b5`): Metadados, labels muito secundários, placeholders.
- **Hairline** (`rgba(209,217,230,0.12)`): Divisores neutros, bordas de estrutura.
- **Hairline Forte** (`rgba(0,255,255,0.32)`): Bordas de ênfase, frames de componentes importantes.

### Named Rules
**A Regra do Sinal Único.** O Núcleo Elétrico aparece em ≤15% de qualquer superfície. Sua escassez é o que faz cada aparição ter peso. Saturar o layout com ciano destrói a hierarquia e transforma autoridade em ruído de cyber clichê.

**A Regra do Abismo Tintado.** Nunca use `#000000` como background principal. O abismo tem azul. O preto puro quebra a coerência com a Chama.

## 3. Typography: Três Registros, Uma Voz

**Display Font:** Chakra Petch (sans-serif geométrico com personalidade técnica-futurista)
**Body Font:** Space Grotesk (humanista moderno, legível em baixo peso)
**Label/Mono Font:** JetBrains Mono (monospace de desenvolvedor, máxima legibilidade de código e labels)

**Character:** O trio não é decorativo — cada família tem jurisdição clara. Chakra Petch comanda e impressiona; Space Grotesk convence e explica; JetBrains Mono classifica e cataloga. Misturar seus papéis destrói a hierarquia.

### Hierarchy
- **Display** (Chakra Petch, 600, `clamp(26px, 3vw, 42px)`, line-height 1.05, letter-spacing -0.012em): Headlines de seção principal, título do Hero. O "grito" do sistema.
- **Headline** (Chakra Petch, 600, `clamp(22px, 2.5vw, 34px)`, line-height 1.1): Subseções, títulos de cards de destaque. Hierarquicamente abaixo do Display.
- **Title** (Space Grotesk, 500, 18px, line-height 1.3): Títulos de componentes, listas de benefícios.
- **Body** (Space Grotesk, 300, 14px, line-height 1.55): Todo o texto corrido. Peso 300 cria leveza sobre o fundo escuro. Máximo 65ch por linha.
- **Label** (JetBrains Mono, 400, 11px, letter-spacing 0.28em, UPPERCASE): Eyebrows, metadados, badges, categorias, preços auxiliares. É a voz de classificação do sistema.

### Named Rules
**A Regra dos Três Registros.** Chakra Petch impõe, Space Grotesk explica, JetBrains Mono classifica. Nunca use Chakra Petch para body copy — perde a legibilidade em texto corrido. Nunca use Space Grotesk para labels técnicos — perde a autoridade de terminal.

**A Regra do Peso Leve.** Body copy fica em weight 300. No fundo escuro, o peso leve é mais legível que o regular — menos conflito entre forma e fundo. Use 500 ou 600 apenas para `<strong>` inlines de destaque.

## 4. Elevation: Glow Como Profundidade

Este sistema não usa sombras estruturais para comunicar profundidade. A escuridão do fundo faz o trabalho que sombras fariam em sistemas claros. Elevação é expressa através de **luminosidade de glow** — elementos mais importantes emitem luz, elementos âncora ficam opacos.

Dois mecanismos de profundidade:

1. **Glow elétrico** (Núcleo Elétrico ou Chama): Aplicado em estados hover, elementos de CTA e componentes de conversão. Quanto mais brilha, mais alto "flutua" na percepção visual.
2. **Frosted glass** (NavBar): `background: rgba(10,15,30,0.85)` + `backdrop-filter: blur(14px)`. Único componente que usa translucidez — reservado para elementos que literalmente flutuam sobre o conteúdo (posição sticky).

### Shadow Vocabulary

- **Glow Ciano — Enfatizado** (`0 0 48px rgba(0,255,255,0.9)`): Hover do botão solid-core. O estado de maior energia do sistema.
- **Glow Ciano — Moderado** (`0 0 32px rgba(0,255,255,0.5)`): Estado padrão de componentes com Núcleo Elétrico ativo.
- **Glow Ciano — Sutil** (`0 0 20px rgba(0,255,255,0.3)`): Hover do botão ghost. Sinalização leve.
- **Glow Cobalt** (`0 0 24px rgba(26,58,200,0.5), inset 0 1px 0 rgba(255,255,255,0.1)`): Estado padrão do botão primário (Azul Chama).
- **Sombra de Card** (`0 8px 40px rgba(0,0,0,0.5), 0 0 60px rgba(0,255,255,0.15)`): Pricing card principal. Profundidade estrutural + aura ciana.
- **Sombra de Modal** (`0 0 50px rgba(0,0,0,0.8)`): Overlays e modais legais. Máximo de obscurecimento sem glow.

### Named Rules
**A Regra do Glow por Estado.** Glow é feedback, não decoração. Superfícies em repouso não emitem glow — o recebem apenas em hover, focus, ou quando são o componente mais importante da tela. Um layout onde tudo brilha ao mesmo tempo é um layout onde nada importa.

## 5. Components

### Buttons

Forma quase quadrada (2px radius) — técnica, sem suavidade decorativa. Tipografia Chakra Petch em uppercase com letter-spacing generoso. Três variantes com jurisdições claras.

- **Shape:** Quase quadrado (2px radius)
- **Primary** (Azul Chama): `background: #1a3ac8`, `color: #fff`, padding 18px 28px, Chakra Petch 600 14px uppercase 0.14em. Hover: `background: #2548e0` + glow cobalt + borda ciana inset. Massive: padding 22px 40px, font-size 16px.
- **Ghost:** `background: transparent`, `border: 1px solid rgba(0,255,255,0.32)`, `color: #00ffff`. Hover: `background: rgba(0,255,255,0.06)` + glow ciano sutil.
- **Solid Core:** `background: #00ffff`, `color: #0a0f1e`. Máxima energia — reservado para CTAs de conversão crítica. Hover: `background: #5cffff` + glow ciano enfatizado.
- **Arrow behavior:** A seta `→` translada 4px no eixo X no hover (`transform: translateX(4px)`, `transition: 0.25s`).

### Cards / Containers

Bordas como molduras, sem sombras estruturais em repouso. Background semi-transparente sobre o abismo.

- **Corner Style:** 2px (quase quadrado) — consistência com botões
- **Background:** `rgba(10,15,30,0.85)` para cards principais; `rgba(10,15,30,0.5)` para elementos secundários
- **Border:** `1px solid rgba(0,255,255,0.32)` (hairline-strong) para cards de destaque; `1px solid rgba(209,217,230,0.12)` (hairline) para divisores neutros
- **Shadow Strategy:** Glow ciano ambiental `0 0 60px rgba(0,255,255,0.15)` apenas no pricing card principal
- **Internal Padding:** 40px desktop, 24-32px mobile

### Navigation

Sticky no topo com frosted glass. Três elementos: marca (Chakra Petch), links (Space Grotesk 13px), CTA reduzido.

- **Style:** `position: sticky, top: 0`, `background: rgba(10,15,30,0.85)`, `backdrop-filter: blur(14px)`, `border-bottom: 1px solid hairline`
- **Brand:** Chakra Petch 600, ícone estrela com gradiente branco→ciano→azul chama
- **Links:** Space Grotesk 13px, `color: texto-secundario`, hover `color: nucleo-eletrico` (transition 0.2s)
- **Active/hover:** Cor muda para Núcleo Elétrico — sem underlines, sem backgrounds
- **Mobile:** Links ocultados, hamburger button exibido. Menu expandido via `MobileMenuMotion` (motion/react).

### Badges / Labels

Elementos de classificação usando JetBrains Mono. Nunca decorativos — sempre carregam informação classificatória.

- **Style:** `background: rgba(0,255,255,0.06)`, `border: 1px solid hairline-strong`, `color: nucleo-eletrico`
- **Typography:** JetBrains Mono 9-11px, letter-spacing 0.18-0.28em, uppercase
- **Shape:** 2px radius (consistência total do sistema)

### Eyebrows / Section Headers (Componente Signature)

O eyebrow é a assinatura visual do sistema. Aparece antes de cada headline de seção: uma linha ciana fina + tag em JetBrains Mono + texto classificatório. Comunica posição na hierarquia da página antes que o título seja lido.

- **Estrutura:** `[linha 28px]` + `[tag com borda hairline-strong]` + `[texto em caps mono]`
- **Typography:** JetBrains Mono 11px, letter-spacing 0.28em, uppercase, `color: nucleo-eletrico`
- **Tag background:** `rgba(0,255,255,0.06)`

## 6. Do's and Don'ts

### Do:
- **Do** usar `#0a0f1e` (Abismo Profundo) como background raiz — ele tem um toque de azul que mantém coerência com a Chama.
- **Do** reservar o Núcleo Elétrico (`#00ffff`) para elementos de alta energia: ícones de confirmação, bordas de destaque, glows de estado, labels críticos. Máximo 15% de qualquer superfície.
- **Do** usar Chakra Petch exclusivamente para headlines (Display e Headline). Space Grotesk para body. JetBrains Mono para labels e metadados.
- **Do** expressar profundidade via glow, não via sombras estruturais — glow é a linguagem de elevação deste sistema escuro.
- **Do** manter botões com 2px de radius — quase quadrado. A forma técnica e sem suavização é intencional.
- **Do** usar `prefers-reduced-motion` para suprimir todas as animações quando o SO solicitar.
- **Do** garantir contraste mínimo WCAG AA: 4.5:1 para texto normal, 3:1 para texto grande.
- **Do** manter body copy em weight 300 — no fundo escuro, texto leve é mais legível que texto regular.

### Don't:
- **Don't** usar fundo branco ou creme. Este sistema não tem modo claro. Nenhum componente deve ter `background: #fff` ou `background: #fafafa`.
- **Don't** criar cards com a mesma forma, ícone + título + texto repetido em grid uniforme. É o SaaS cream genérico que este projeto explicitamente rejeita.
- **Don't** usar verde Matrix, caveiras ou neon sem propósito narrativo. O ciano desta marca é sinal técnico, não estética de hacker.
- **Don't** imitar a documentação visual da AWS ou Azure — útil mas sem alma. Este sistema tem identidade humana brasileira, não frieza de produto corporativo global.
- **Don't** adicionar `border-left` maior que 1px como stripe decorativo em cards ou callouts. Use background tints, bordas completas ou ícones em vez disso.
- **Don't** usar `background-clip: text` com gradient para destacar palavras. Use cor sólida (Núcleo Elétrico) com peso ou tamanho.
- **Don't** usar glassmorphism como padrão de card. O frosted glass (`backdrop-filter: blur`) é exclusivo do NavBar — componente que literalmente flutua sobre o conteúdo.
- **Don't** usar `#000` como background. O Abismo (`#0a0f1e`) tem azul; preto puro quebra a coerência da paleta.
- **Don't** escrever copy com headlines que repetem o título da seção acima. Cada palavra tem que ganhar seu lugar — voz de engenheiro, não de marketing genérico.
