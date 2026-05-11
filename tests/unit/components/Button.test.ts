import { describe, it, expect } from "vitest";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import Button from "../../../src/components/ui/Button.astro";

describe("Button component", () => {
  it("variant=primary renders <a> with class btn primary", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Button, {
      props: { href: "/test", variant: "primary" },
    });
    expect(html).toContain("btn");
    expect(html).toContain("primary");
    expect(html).toMatch(/<a[^>]+href="\/test"/);
  });

  it("variant=ghost renders class btn ghost", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Button, {
      props: { href: "/test", variant: "ghost" },
    });
    expect(html).toContain("ghost");
    expect(html).toContain("btn");
  });

  it("variant=solid-core renders class btn solid-core", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Button, {
      props: { href: "/test", variant: "solid-core" },
    });
    expect(html).toContain("solid-core");
    expect(html).toContain("btn");
  });

  it("size=massive appends class massive", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Button, {
      props: { href: "/test", size: "massive" },
    });
    expect(html).toContain("massive");
  });

  it("href value appears as href attribute on <a>", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Button, {
      props: { href: "#investimento" },
    });
    expect(html).toContain('href="#investimento"');
  });

  it("customClass is included in the class list", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Button, {
      props: { href: "/test", customClass: "my-class" },
    });
    expect(html).toContain("my-class");
  });

  it("missing variant defaults to primary", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Button, {
      props: { href: "/test" },
    });
    expect(html).toContain("primary");
  });

  it("missing size defaults to normal — no massive class present", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Button, {
      props: { href: "/test" },
    });
    expect(html).not.toContain("massive");
  });

  it("snapshot: render with all defaults", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Button, {
      props: { href: "/default" },
    });
    expect(html).toMatchSnapshot();
  });

  // Edge-case battery (Task 4 additions)
  it("href='' renders without throwing and <a> is present", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Button, {
      props: { href: "" },
    });
    expect(html).toMatch(/<a/);
  });

  it("customClass='' produces no extra trailing space in class attribute", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Button, {
      props: { href: "/test", customClass: "" },
    });
    // class attribute should not end with a trailing space before the closing quote
    expect(html).not.toMatch(/class="[^"]*\s"/);
  });

  it("customClass with modifier syntax passes through unchanged", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Button, {
      props: { href: "/test", customClass: "my-class--modifier" },
    });
    expect(html).toContain("my-class--modifier");
  });
});
