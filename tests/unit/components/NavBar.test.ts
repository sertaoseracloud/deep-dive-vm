import { describe, it, expect } from "vitest";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import NavBar from "../../../src/components/layout/NavBar.astro";

describe("NavBar component", () => {
  it("renders a <nav> element", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(NavBar, { props: {} });
    expect(html).toContain("<nav");
  });

  it("at least one <a> link is present in the output", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(NavBar, { props: {} });
    expect(html).toMatch(/<a[^>]+href/);
  });

  it("snapshot: full render", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(NavBar, { props: {} });
    expect(html).toMatchSnapshot();
  });
});
