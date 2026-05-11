import { describe, it, expect } from "vitest";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import SectionHead from "../../../src/components/ui/SectionHead.astro";

describe("SectionHead component", () => {
  it("eyebrow text appears in .eyebrow-text", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(SectionHead, {
      props: { eyebrow: "DEEP DIVE", titleHtml: "Section Title" },
    });
    expect(html).toContain("eyebrow-text");
    expect(html).toContain("DEEP DIVE");
  });

  it("titleHtml appears inside h2.section-title", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(SectionHead, {
      props: { eyebrow: "TEST", titleHtml: "My Section Title" },
    });
    expect(html).toContain("section-title");
    expect(html).toContain("My Section Title");
  });

  it("lede appears in p.section-lede when provided", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(SectionHead, {
      props: {
        eyebrow: "TEST",
        titleHtml: "Title",
        lede: "This is the lede text",
      },
    });
    expect(html).toContain("section-lede");
    expect(html).toContain("This is the lede text");
  });

  it("lede is absent from output when not provided", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(SectionHead, {
      props: { eyebrow: "TEST", titleHtml: "Title" },
    });
    expect(html).not.toContain("section-lede");
  });

  it("idx appears in .idx span when provided", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(SectionHead, {
      props: { eyebrow: "TEST", titleHtml: "Title", idx: "01" },
    });
    expect(html).toContain("idx");
    expect(html).toContain("01");
  });

  it("center=true adds class center to .section-head wrapper", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(SectionHead, {
      props: { eyebrow: "TEST", titleHtml: "Title", center: true },
    });
    expect(html).toContain("center");
    expect(html).toMatch(/section-head[^"]*center|center[^"]*section-head/);
  });

  it("center=false (default) does NOT include class center", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(SectionHead, {
      props: { eyebrow: "TEST", titleHtml: "Title" },
    });
    // The section-head div should not have "center" in the class value
    // It renders as class="section-head " (with trailing space but no "center")
    expect(html).not.toMatch(/class="section-head\s+center/);
  });

  it("snapshot: render with all props set", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(SectionHead, {
      props: {
        eyebrow: "EYEBROW",
        titleHtml: "Full Title",
        lede: "Lede text here",
        idx: "02",
        center: true,
      },
    });
    expect(html).toMatchSnapshot();
  });

  // Edge-case battery (Task 4 additions)
  it("eyebrow='' renders .eyebrow-text without crashing", async () => {
    const container = await AstroContainer.create();
    await expect(
      container.renderToString(SectionHead, {
        props: { eyebrow: "", titleHtml: "Title" },
      })
    ).resolves.toBeDefined();
  });

  it("titleHtml='' renders h2.section-title without crashing", async () => {
    const container = await AstroContainer.create();
    await expect(
      container.renderToString(SectionHead, {
        props: { eyebrow: "TEST", titleHtml: "" },
      })
    ).resolves.toBeDefined();
  });

  it("titleHtml with HTML span is preserved in output (set:html passthrough)", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(SectionHead, {
      props: {
        eyebrow: "TEST",
        titleHtml: 'Title with <span class="flame">word</span>',
      },
    });
    expect(html).toContain('class="flame"');
    expect(html).toContain("word");
  });

  it("lede with extremely long string renders without truncation or exception", async () => {
    const longLede = "x".repeat(600);
    const container = await AstroContainer.create();
    const html = await container.renderToString(SectionHead, {
      props: { eyebrow: "TEST", titleHtml: "Title", lede: longLede },
    });
    expect(html).toContain(longLede);
  });
});
