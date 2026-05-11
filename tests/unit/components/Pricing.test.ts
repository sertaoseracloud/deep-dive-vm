import { describe, it, expect } from "vitest";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import Pricing from "../../../src/components/sections/Pricing.astro";

describe("Pricing component", () => {
  it("renders pricing section output (non-empty)", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Pricing, { props: {} });
    expect(html.trim()).not.toBe("");
  });

  it("at least one CTA <a> element present", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Pricing, { props: {} });
    expect(html).toMatch(/<a[^>]+href/);
  });

  it("snapshot", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Pricing, { props: {} });
    expect(html).toMatchSnapshot();
  });
});
