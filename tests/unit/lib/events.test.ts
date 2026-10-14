import { describe, it, expect } from "vitest";
import { events, upcomingEvents, type Event } from "../../../src/data/events";

const evento = (title: string, dates: string[]): Event => ({
  id: title,
  title,
  description: "",
  dates,
  when: "",
  where: "",
  format: "Presencial",
  site: "https://exemplo.com",
  links: [],
});

describe("eventos", () => {
  it("lista só os que ainda não terminaram, do mais próximo para o mais distante", () => {
    const lista = [evento("C", ["2027-03-01"]), evento("A", ["2026-01-01", "2026-01-02"]), evento("B", ["2026-10-12", "2026-10-14"])];
    expect(upcomingEvents(lista, "2026-10-13").map((e) => e.title)).toEqual(["B", "C"]);
    expect(upcomingEvents(lista, "2027-03-02")).toEqual([]);
  });

  it("MVPConf 2027 tem inscrição e call for papers com banner e texto alternativo", () => {
    const mvp = events.find((e) => e.title === "MVPConf 2027")!;
    expect(mvp.dates).toEqual(["2027-10-22", "2027-10-23"]);
    expect(mvp.links.map((l) => l.label)).toEqual(["Inscrição", "Call for papers"]);
    for (const l of mvp.links) {
      expect(l.url).toMatch(/^https:\/\/mvpconf\.com\.br\/conf\/br\/2027/);
      expect(l.banner?.alt.length).toBeGreaterThan(60);
    }
  });

  it("regionais de novembro/2026: inscrição sempre, call for papers só onde está aberto", () => {
    const regionais = events.filter((e) => e.id.startsWith("mvpconf-regional-"));
    expect(regionais.map((e) => [e.title, e.dates[0]])).toEqual([
      ["MVP Conf Regional Manaus", "2026-11-12"],
      ["MVP Conf Regional Joinville", "2026-11-14"],
      ["MVP Conf Regional Campinas", "2026-11-19"],
      ["MVP Conf Regional Av. Paulista", "2026-11-25"],
    ]);
    for (const e of regionais) {
      expect(e.links[0]).toMatchObject({ label: "Inscrição", url: `${e.site}/register` });
      expect(e.links.every((l) => l.banner && l.banner.alt.includes(e.when))).toBe(true);
    }
    expect(regionais.filter((e) => e.links.some((l) => l.label === "Call for papers")).map((e) => e.id)).toEqual([
      "mvpconf-regional-manaus",
      "mvpconf-regional-campinas",
    ]);
    expect(new Set(events.map((e) => e.id)).size).toBe(events.length);
  });
});
