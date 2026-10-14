import { describe, it, expect } from "vitest";
import {
  agruparPorMes,
  dia,
  diasEntre,
  encerrado,
  hojeIso,
  mesCurto,
  nomeDoMes,
  textoDoBotao,
  textoFaltam,
} from "../../../src/lib/eventos";

describe("datas dos eventos", () => {
  it("dia, mês curto e nome do mês", () => {
    expect(dia("2026-11-07")).toBe(7);
    expect(mesCurto("2026-11-07")).toBe("nov");
    expect(mesCurto("2027-03-01")).toBe("mar");
    expect(nomeDoMes("2026-10")).toBe("outubro de 2026");
    expect(nomeDoMes("2027-01-15")).toBe("janeiro de 2027");
  });

  it("agrupa por mês de início mantendo a ordem", () => {
    const lista = [
      { id: "a", dates: ["2026-10-28"] },
      { id: "b", dates: ["2026-11-07"] },
      { id: "c", dates: ["2026-11-12"] },
      { id: "d", dates: ["2027-10-22", "2027-10-23"] },
    ];
    const grupos = agruparPorMes(lista);
    expect(grupos.map(([m, itens]) => [m, itens.map((i) => i.id)])).toEqual([
      ["2026-10", ["a"]],
      ["2026-11", ["b", "c"]],
      ["2027-10", ["d"]],
    ]);
    expect(agruparPorMes([])).toEqual([]);
  });

  it("texto do botão de cada link", () => {
    expect(textoDoBotao("Inscrição")).toBe("Inscrever-se");
    expect(textoDoBotao("Call for papers")).toBe("Enviar palestra");
  });

  it("hoje em ISO usa a data local", () => {
    expect(hojeIso(new Date(2026, 0, 5, 23, 59))).toBe("2026-01-05");
    expect(hojeIso(new Date(2026, 10, 25))).toBe("2026-11-25");
    expect(hojeIso()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("dias entre datas, inclusive na virada de ano e no horário de verão", () => {
    expect(diasEntre("2026-10-14", "2026-10-28")).toBe(14);
    expect(diasEntre("2026-12-31", "2027-01-01")).toBe(1);
    expect(diasEntre("2026-10-28", "2026-10-14")).toBe(-14);
  });

  it("encerrado só depois da última data", () => {
    expect(encerrado("2026-11-12", "2026-11-12")).toBe(false);
    expect(encerrado("2026-11-12", "2026-11-13")).toBe(true);
  });

  it("quanto falta", () => {
    expect(textoFaltam("2026-10-28", "2026-10-28")).toBe("acontece hoje");
    expect(textoFaltam("2027-10-22", "2027-10-23")).toBe("acontece hoje"); // segundo dia do evento
    expect(textoFaltam("2026-10-28", "2026-10-27")).toBe("é amanhã");
    expect(textoFaltam("2026-10-28", "2026-10-14")).toBe("faltam 14 dias");
    expect(textoFaltam("2026-12-13", "2026-10-14")).toBe("faltam 60 dias");
    expect(textoFaltam("2027-10-22", "2026-10-14")).toBe("");
  });
});
