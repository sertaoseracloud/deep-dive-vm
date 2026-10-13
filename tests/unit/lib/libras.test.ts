// tests/unit/lib/libras.test.ts
// Carregamento sob demanda do VLibras.

import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import { VLIBRAS, ativarLibras, _reiniciarLibras } from "../../../src/lib/libras";

// O happy-dom tentaria baixar o plugin de verdade: guardamos o <script> sem anexar.
let scripts: HTMLScriptElement[] = [];

beforeEach(() => {
  scripts = [];
  vi.spyOn(document.head, "append").mockImplementation((...nos) => {
    for (const no of nos) if (no instanceof HTMLScriptElement) scripts.push(no);
  });
});

afterEach(() => {
  vi.restoreAllMocks();
  document.head.innerHTML = "";
  document.body.innerHTML = "";
  _reiniciarLibras();
  delete window.VLibras;
});

const scriptDoVlibras = () => scripts.find((s) => s.src === `${VLIBRAS}/vlibras-plugin.js`) ?? null;

describe("VLibras", () => {
  it("desligado e nunca ligado: não baixa nada", async () => {
    await ativarLibras(false);
    expect(scriptDoVlibras()).toBeNull();
    expect(document.querySelector("[vw]")).toBeNull();
  });

  it("ligar monta a marcação, baixa o plugin uma vez e inicia o widget", async () => {
    const Widget = vi.fn();
    const ligado = ativarLibras(true);
    const segunda = ativarLibras(true); // clique duplo não baixa de novo
    expect(scripts).toHaveLength(1);
    expect(document.querySelector("[vw] [vw-access-button]")).not.toBeNull();

    window.VLibras = { Widget };
    scriptDoVlibras()!.onload!(new Event("load"));
    await Promise.all([ligado, segunda]);
    expect(Widget).toHaveBeenCalledWith(VLIBRAS);

    await ativarLibras(false);
    expect(document.querySelector<HTMLElement>("[vw]")!.hidden).toBe(true);
    await ativarLibras(true);
    expect(document.querySelector<HTMLElement>("[vw]")!.hidden).toBe(false);
    expect(document.querySelectorAll("[vw]")).toHaveLength(1);
  });

  it("serviço fora do ar: rejeita e permite tentar de novo", async () => {
    const ligado = ativarLibras(true);
    scriptDoVlibras()!.onerror!(new Event("error"));
    await expect(ligado).rejects.toThrow("Não foi possível carregar o VLibras.");

    ativarLibras(true).catch(() => {});
    expect(scripts).toHaveLength(2);
  });
});
