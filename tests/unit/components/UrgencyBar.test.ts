import { describe, it, expect } from "vitest";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import UrgencyBar from "../../../src/components/layout/UrgencyBar.astro";

describe("UrgencyBar component", () => {
  it("renders output (not empty string)", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(UrgencyBar, { props: {} });
    expect(html.trim()).not.toBe("");
  });

  it("renders the urgency-bar element", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(UrgencyBar, { props: {} });
    expect(html).toContain("urgency-bar");
  });

  it("snapshot", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(UrgencyBar, { props: {} });
    expect(html).toMatchSnapshot();
  });
});
