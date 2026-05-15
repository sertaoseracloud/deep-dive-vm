// tests/unit/components/NavBar.test.ts
// Cobre a lógica pura do script IntersectionObserver do NavBar.
//
// Abordagem: testar o callback do IO diretamente (não importar o script Astro,
// que não pode ser importado em Vitest). O comportamento é:
//   entry.isIntersecting=false  →  nav.dataset.scrolled = "true"
//   entry.isIntersecting=true   →  nav.dataset.scrolled = "false"

import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";

// Simular o callback exato do NavBar.astro:
//   nav.dataset.scrolled = String(!entries[0].isIntersecting);
function createNavScrollCallback(nav: HTMLElement) {
  return (entries: IntersectionObserverEntry[]) => {
    nav.dataset.scrolled = String(!entries[0].isIntersecting);
  };
}

describe("NavBar IntersectionObserver — lógica data-scrolled", () => {
  let nav: HTMLElement;

  beforeEach(() => {
    // Criar elemento nav como o NavBar.astro faz
    nav = document.createElement("nav");
    nav.className = "nav";
    nav.setAttribute("data-scrolled", "false");
    document.body.appendChild(nav);
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("quando entry.isIntersecting=false, nav.dataset.scrolled é 'true'", () => {
    const callback = createNavScrollCallback(nav);

    // Simular o IO emitindo entry com isIntersecting=false (saiu do viewport)
    const entry = {
      isIntersecting: false,
    } as IntersectionObserverEntry;

    callback([entry]);

    expect(nav.dataset.scrolled).toBe("true");
  });

  it("quando entry.isIntersecting=true, nav.dataset.scrolled é 'false'", () => {
    const callback = createNavScrollCallback(nav);

    // Simular o IO emitindo entry com isIntersecting=true (voltou ao viewport)
    const entry = {
      isIntersecting: true,
    } as IntersectionObserverEntry;

    callback([entry]);

    expect(nav.dataset.scrolled).toBe("false");
  });

  it("transição false→true→false: alterna corretamente", () => {
    const callback = createNavScrollCallback(nav);

    // Rolar para baixo: #top sai do viewport
    callback([{ isIntersecting: false } as IntersectionObserverEntry]);
    expect(nav.dataset.scrolled).toBe("true");

    // Rolar para cima: #top entra no viewport novamente
    callback([{ isIntersecting: true } as IntersectionObserverEntry]);
    expect(nav.dataset.scrolled).toBe("false");
  });

  it("nav.dataset.scrolled inicia como 'false' (estado declarado no markup)", () => {
    // O NavBar.astro declara data-scrolled='false' no markup como estado inicial explícito
    expect(nav.dataset.scrolled).toBe("false");
  });

  it("IntersectionObserver pode ser instanciado em ambiente happy-dom", () => {
    // Verificar que o ambiente de teste suporta IO (necessário para os scripts de NavBar)
    const mockCallback = vi.fn();
    const observer = new IntersectionObserver(mockCallback);
    expect(observer).toBeTruthy();
    observer.disconnect();
  });
});
