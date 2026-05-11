import { describe, it, expect } from "vitest";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import Layout from "../../../src/layouts/Layout.astro";

describe("Layout component", () => {
  it("title prop appears in <title> tag", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Layout, {
      props: { title: "Deep Dive Azure VM" },
    });
    expect(html).toContain("Deep Dive Azure VM");
    // astro-seo renders the title into the <title> element
    expect(html).toMatch(/<title[^>]*>.*Deep Dive Azure VM.*<\/title>/s);
  });

  it("description prop appears in meta description content", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Layout, {
      props: {
        title: "Test Title",
        description: "This is the page description",
      },
    });
    expect(html).toContain("This is the page description");
  });

  it("Open Graph og:title meta tag is present", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Layout, {
      props: { title: "OG Title Test" },
    });
    expect(html).toContain("og:title");
  });

  it("Open Graph og:type meta tag is present and equals website", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Layout, {
      props: { title: "Test" },
    });
    expect(html).toContain("og:type");
    expect(html).toContain("website");
  });

  it("Twitter card meta tag is present", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Layout, {
      props: { title: "Test" },
    });
    expect(html).toContain("twitter:card");
  });

  it("<html lang=pt-BR> attribute is set", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Layout, {
      props: { title: "Test" },
    });
    expect(html).toContain('lang="pt-BR"');
  });
});
