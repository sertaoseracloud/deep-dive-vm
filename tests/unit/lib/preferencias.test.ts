// tests/unit/lib/preferencias.test.ts
// Preferências do painel ♿: normalização, perfis, sistema operacional, aplicação
// no <html> e persistência (inclusive com o armazenamento bloqueado).

import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import {
  CHAVE_APLICADO,
  CHAVE_PREFERENCIAS,
  CLASSES,
  COR_DA_BARRA,
  OPCOES,
  PADRAO,
  PERFIS,
  TAMANHOS,
  TEMAS,
  alternarPerfil,
  aplicarPreferencias,
  calcularAplicado,
  gravarPreferencias,
  lerPreferencias,
  limparPreferencias,
  normalizarPreferencias,
  perfilAtivo,
  preferenciasDoSistema,
} from "../../../src/lib/preferencias";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  localStorage.clear();
});

describe("normalizarPreferencias", () => {
  it("sem nada salvo (ou lixo) usa o padrão", () => {
    expect(normalizarPreferencias(null)).toEqual(PADRAO);
    expect(normalizarPreferencias("texto")).toEqual(PADRAO);
  });

  it("ignora valores inválidos e mantém os válidos", () => {
    expect(
      normalizarPreferencias({ tema: "rosa-choque", tamanho: 999, fonteLegivel: true, libras: "sim", extra: 1 })
    ).toEqual({ ...PADRAO, fonteLegivel: true });
    expect(normalizarPreferencias({ tema: "suave", tamanho: TAMANHOS[3] })).toEqual({
      ...PADRAO,
      tema: "suave",
      tamanho: TAMANHOS[3],
    });
  });
});

describe("perfis", () => {
  it("cada perfil só usa opções e temas que existem", () => {
    for (const perfil of Object.values(PERFIS)) {
      for (const [chave, valor] of Object.entries(perfil.valores)) {
        if (chave === "tema") expect(valor as string in TEMAS).toBe(true);
        else if (chave === "tamanho") expect(TAMANHOS).toContain(valor);
        else expect(chave in OPCOES).toBe(true);
      }
    }
  });

  it("ligar um perfil mantém as outras escolhas; ligar de novo desliga só as dele", () => {
    const base = { ...PADRAO, reduzirMovimento: true };
    const comLeitura = alternarPerfil(base, "leitura");
    expect(perfilAtivo(comLeitura, "leitura")).toBe(true);
    expect(comLeitura).toMatchObject({ reduzirMovimento: true, fonteLegivel: true, espacamento: true });
    const semLeitura = alternarPerfil(comLeitura, "leitura");
    expect(perfilAtivo(semLeitura, "leitura")).toBe(false);
    expect(semLeitura).toEqual(base);
  });

  it("baixa visão troca para alto contraste e aumenta o texto", () => {
    expect(alternarPerfil(PADRAO, "baixaVisao")).toMatchObject({ tema: "alto-contraste", tamanho: 125 });
  });
});

describe("preferenciasDoSistema", () => {
  const sistema = (ligadas: string[]) => (q: string) => ligadas.includes(q);

  it("sem nada no sistema, fica no padrão", () => {
    expect(preferenciasDoSistema(sistema([]))).toEqual(PADRAO);
  });

  it("reduzir movimento e contraste alto do sistema viram escolhas", () => {
    expect(
      preferenciasDoSistema(sistema(["(prefers-reduced-motion: reduce)", "(prefers-contrast: more)"]))
    ).toMatchObject({ reduzirMovimento: true, tema: "alto-contraste" });
  });

  it("modo claro do sistema escolhe o tema Claro; contraste alto tem prioridade", () => {
    expect(preferenciasDoSistema(sistema(["(prefers-color-scheme: light)"])).tema).toBe("claro");
    expect(
      preferenciasDoSistema(sistema(["(prefers-color-scheme: light)", "(prefers-contrast: more)"])).tema
    ).toBe("alto-contraste");
  });

  it("cores forçadas (Alto contraste do Windows) também ligam o alto contraste", () => {
    expect(preferenciasDoSistema(sistema(["(forced-colors: active)"])).tema).toBe("alto-contraste");
  });

  it("usa window.matchMedia por padrão", () => {
    vi.spyOn(window, "matchMedia").mockImplementation(
      (q: string) => ({ matches: q === "(prefers-reduced-motion: reduce)" }) as MediaQueryList
    );
    expect(preferenciasDoSistema().reduzirMovimento).toBe(true);
  });

  it("sem matchMedia (navegador antigo), fica no padrão", () => {
    vi.stubGlobal("matchMedia", undefined);
    expect(preferenciasDoSistema()).toEqual(PADRAO);
  });
});

describe("aplicarPreferencias", () => {
  beforeEach(() => {
    document.head.innerHTML = '<meta name="theme-color" content="#0a0f1e">';
  });

  it("define tema, escala, classes e a cor da barra do navegador", () => {
    const raiz = document.documentElement;
    aplicarPreferencias({ ...PADRAO, tema: "alto-contraste", tamanho: 125, espacamento: true, sublinharLinks: true }, raiz);
    expect(raiz.dataset.tema).toBe("alto-contraste");
    expect(raiz.style.getPropertyValue("--escala")).toBe("1.25");
    expect(raiz.classList.contains(CLASSES.espacamento)).toBe(true);
    expect(raiz.classList.contains(CLASSES.sublinharLinks)).toBe(true);
    expect(raiz.classList.contains(CLASSES.fonteLegivel)).toBe(false);
    expect(document.querySelector('meta[name="theme-color"]')!.getAttribute("content")).toBe(COR_DA_BARRA["alto-contraste"]);

    aplicarPreferencias(PADRAO);
    expect(raiz.classList.contains(CLASSES.espacamento)).toBe(false);
    expect(raiz.dataset.tema).toBe("padrao");
  });

  it("funciona sem a meta theme-color", () => {
    document.head.innerHTML = "";
    expect(() => aplicarPreferencias(PADRAO)).not.toThrow();
  });
});

describe("persistência", () => {
  it("grava a escolha e o estado aplicado que o script do <head> reaplica", () => {
    const prefs = { ...PADRAO, tema: "suave" as const, reduzirMovimento: true };
    gravarPreferencias(prefs);
    expect(lerPreferencias()).toEqual(prefs);
    expect(JSON.parse(localStorage.getItem(CHAVE_APLICADO)!)).toEqual(calcularAplicado(prefs));
    expect(calcularAplicado(prefs)).toEqual({
      tema: "suave",
      escala: "1",
      classes: [CLASSES.reduzirMovimento],
      cor: COR_DA_BARRA.suave,
    });
  });

  it("sem nada salvo, ou com JSON corrompido, devolve null", () => {
    expect(lerPreferencias()).toBeNull();
    localStorage.setItem(CHAVE_PREFERENCIAS, "{corrompido");
    expect(lerPreferencias()).toBeNull();
  });

  it("limpar apaga as duas chaves", () => {
    gravarPreferencias(PADRAO);
    limparPreferencias();
    expect(localStorage.getItem(CHAVE_PREFERENCIAS)).toBeNull();
    expect(localStorage.getItem(CHAVE_APLICADO)).toBeNull();
  });

  it("armazenamento bloqueado não quebra a página", () => {
    const quebrado = () => {
      throw new Error("SecurityError");
    };
    vi.stubGlobal("localStorage", { getItem: quebrado, setItem: quebrado, removeItem: quebrado });
    expect(() => gravarPreferencias(PADRAO)).not.toThrow();
    expect(() => limparPreferencias()).not.toThrow();
    expect(lerPreferencias()).toBeNull();
  });
});
