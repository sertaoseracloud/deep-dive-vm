// src/lib/libras.ts
// Tradução para Libras com o VLibras (https://www.gov.br/governodigital/pt-br/vlibras),
// do Governo Federal: um avatar traduz para Libras o texto que a pessoa seleciona ou
// passa o mouse. Só carrega quando a opção é ligada no painel ♿ (ninguém recebe o
// script nem fala com o servidor do VLibras sem pedir) e some quando é desligada.

export const VLIBRAS = "https://vlibras.gov.br/app";

declare global {
  interface Window {
    VLibras?: { Widget: new (app: string) => unknown };
  }
}

let carregando: Promise<void> | null = null;

/** O plugin procura esta marcação na página; criada uma vez, sob demanda. */
function montarMarcacao(): void {
  if (document.querySelector("[vw]")) return;
  const raiz = document.createElement("div");
  raiz.setAttribute("vw", "");
  raiz.className = "enabled";
  raiz.innerHTML =
    '<div vw-access-button class="active"></div>' +
    '<div vw-plugin-wrapper><div class="vw-plugin-top-wrapper"></div></div>';
  document.body.append(raiz);
}

function carregar(): Promise<void> {
  carregando ??= new Promise<void>((ok, erro) => {
    montarMarcacao();
    const script = document.createElement("script");
    script.src = `${VLIBRAS}/vlibras-plugin.js`;
    script.onload = () => {
      // O plugin monta o botão sozinho; o construtor só confirma o endereço do app.
      new window.VLibras!.Widget(VLIBRAS);
      ok();
    };
    script.onerror = () => {
      carregando = null;
      erro(new Error("Não foi possível carregar o VLibras."));
    };
    document.head.append(script);
  });
  return carregando;
}

/** Liga ou desliga o VLibras. Devolve uma promessa (falha se o serviço estiver fora). */
export async function ativarLibras(ligar: boolean): Promise<void> {
  const raiz = document.querySelector<HTMLElement>("[vw]");
  if (raiz) raiz.hidden = !ligar;
  if (!ligar) return;
  await carregar();
}

/** Só para testes: esquece o carregamento em andamento. */
export function _reiniciarLibras(): void {
  carregando = null;
}
