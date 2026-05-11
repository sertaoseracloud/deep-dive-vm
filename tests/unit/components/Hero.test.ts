import { describe, it, expect } from "vitest";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import Hero from "../../../src/components/sections/Hero.astro";

describe("Hero component", () => {
  it("renders exactly one <h1> in output", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Hero, { props: {} });
    const h1Matches = html.match(/<h1[^>]*>/g) ?? [];
    expect(h1Matches.length).toBe(1);
  });

  it("<h1> text content is non-empty", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Hero, { props: {} });
    // Extract content between h1 tags
    const match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/);
    expect(match).not.toBeNull();
    const content = match![1].replace(/<[^>]+>/g, "").trim();
    expect(content.length).toBeGreaterThan(0);
  });

  it("at least one <a> button/link exists in the section", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Hero, { props: {} });
    expect(html).toMatch(/<a[^>]+href/);
  });

  it("snapshot", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Hero, { props: {} });
    expect(html).toMatchSnapshot();
  });
});
