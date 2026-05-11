import { describe, it, expect } from "vitest";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import Footer from "../../../src/components/layout/Footer.astro";

describe("Footer component", () => {
  it("renders a <footer> element", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Footer, { props: {} });
    expect(html).toContain("<footer");
  });

  it("contains copyright or brand text (non-empty text content)", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Footer, { props: {} });
    // Should contain the brand name or copyright year
    expect(html).toMatch(/Sertao|2026|Raposo|Cloud/i);
  });

  it("snapshot: full render", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Footer, { props: {} });
    expect(html).toMatchSnapshot();
  });
});
