import { describe, it, expect } from "vitest";
import { rotuloDoDiagrama, SELETOR_MERMAID, tipoDoDiagrama, tituloAcessivel, variaveisDoTema } from "../../../src/lib/diagramas";

describe("diagramas Mermaid", () => {
  it("descobre o tipo pela primeira linha útil", () => {
    expect(tipoDoDiagrama("flowchart TD\n  A --> B")).toBe("flowchart");
    expect(tipoDoDiagrama("graph LR\nA-->B")).toBe("graph");
    expect(tipoDoDiagrama("\n  %% comentário\n  sequenceDiagram\n  A->>B: oi")).toBe("sequencediagram");
    expect(tipoDoDiagrama("---\ntitle: Pedido\n---\nstateDiagram-v2\n[*] --> A")).toBe("statediagram-v2");
    expect(tipoDoDiagrama("")).toBe("");
  });

  it("rótulo em português, com padrão para tipos desconhecidos", () => {
    expect(rotuloDoDiagrama("flowchart")).toBe("Fluxograma");
    expect(rotuloDoDiagrama("graph")).toBe("Fluxograma");
    expect(rotuloDoDiagrama("sequencediagram")).toBe("Diagrama de sequência");
    expect(rotuloDoDiagrama("erdiagram")).toBe("Diagrama entidade-relacionamento");
    expect(rotuloDoDiagrama("quadrantchart")).toBe("Diagrama");
  });

  it("lê o título acessível (accTitle) quando o autor declara", () => {
    expect(tituloAcessivel("flowchart TD\n  accTitle: Fluxo de pagamento\n  A-->B")).toBe("Fluxo de pagamento");
    expect(tituloAcessivel("flowchart TD\n  A-->B")).toBeNull();
  });

  it("monta as cores do tema a partir dos tokens do site", () => {
    const tokens: Record<string, string> = {
      "--texto-principal": "#ffffff",
      "--abismo-profundo": "#0a0f1e",
      "--rgb-cartao": "27 41 60",
      "--nucleo-eletrico": "#00ffff",
      "--texto-secundario": "#d1d9e6",
      "--font-body": "Space Grotesk",
      "color-scheme": "normal",
    };
    const v = variaveisDoTema((n) => tokens[n] ?? "");
    expect(v.darkMode).toBe(true);
    expect(v.primaryColor).toBe("rgb(27 41 60)");
    expect(v.primaryTextColor).toBe("#ffffff");
    expect(v.primaryBorderColor).toBe("#00ffff");
    expect(v.lineColor).toBe("#d1d9e6");
    expect(v.fontFamily).toBe("Space Grotesk");

    const claro = variaveisDoTema((n) => (n === "color-scheme" ? "light" : ""));
    expect(claro.darkMode).toBe(false);
    expect(claro.fontFamily).toBe("sans-serif");
  });

  it("acha os blocos do dev.to", () => {
    document.body.innerHTML = '<pre tabindex="0" data-lang="mermaid"><code>flowchart TD</code></pre><pre class="highlight mermaid"><code>graph LR</code></pre><pre data-lang="python"></pre>';
    expect(document.querySelectorAll(SELETOR_MERMAID)).toHaveLength(2);
  });
});
