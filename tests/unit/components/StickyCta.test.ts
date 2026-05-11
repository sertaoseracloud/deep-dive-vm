import { describe, it, expect } from "vitest";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import StickyCta from "../../../src/components/layout/StickyCta.astro";

describe("StickyCta component", () => {
  it("renders output containing an <a> (CTA link)", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(StickyCta, { props: {} });
    expect(html).toMatch(/<a[^>]+href/);
  });

  it("renders sticky-cta container", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(StickyCta, { props: {} });
    expect(html).toContain("sticky-cta");
  });

  it("snapshot", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(StickyCta, { props: {} });
    expect(html).toMatchSnapshot();
  });
});
