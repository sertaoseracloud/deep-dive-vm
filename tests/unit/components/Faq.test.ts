import { describe, it, expect } from "vitest";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import Faq from "../../../src/components/sections/Faq.astro";

describe("Faq component", () => {
  it("renders FAQ section (non-empty)", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Faq, { props: {} });
    expect(html.trim()).not.toBe("");
  });

  it("contains at least one <summary> element (FAQ question container)", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Faq, { props: {} });
    expect(html).toContain("<summary");
  });

  it("snapshot", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Faq, { props: {} });
    expect(html).toMatchSnapshot();
  });
});
