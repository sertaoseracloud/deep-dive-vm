import { describe, it, expect, beforeAll, beforeEach, afterEach, vi } from "vitest";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, "../../..");

let builtHtml = "";

beforeAll(() => {
  builtHtml = readFileSync(join(PROJECT_ROOT, "dist/index.html"), "utf-8");
});

describe("Layout component", () => {
  it("title appears in <title> tag", () => {
    expect(builtHtml).toMatch(/<title[^>]*>.*Deep Dive Azure VM.*<\/title>/s);
  });

  it("description appears in meta description content", () => {
    expect(builtHtml).toMatch(/name="description"[^>]+content="[^"]+"/);
    // Actual description from index page
    expect(builtHtml).toContain("Formação de 54h");
  });

  it("Open Graph og:title meta tag is present", () => {
    expect(builtHtml).toContain("og:title");
    expect(builtHtml).toMatch(/property="og:title"/);
  });

  it("Open Graph og:type meta tag is present and equals website", () => {
    expect(builtHtml).toContain("og:type");
    expect(builtHtml).toContain("website");
    expect(builtHtml).toMatch(/property="og:type"[^>]+content="website"/);
  });

  it("Twitter card meta tag is present", () => {
    expect(builtHtml).toContain("twitter:card");
    expect(builtHtml).toMatch(/name="twitter:card"/);
  });

  it("<html lang=pt-BR> attribute is set", () => {
    expect(builtHtml).toContain('lang="pt-BR"');
  });

  it("charset utf-8 is declared in head", () => {
    expect(builtHtml).toMatch(/<meta charset="utf-8"/);
  });

  it("viewport meta tag is present", () => {
    expect(builtHtml).toContain("viewport");
    expect(builtHtml).toContain("width=device-width");
  });

  it("og:image meta tag is present", () => {
    expect(builtHtml).toContain("og:image");
  });

  it("twitter:creator meta tag is present", () => {
    expect(builtHtml).toContain("twitter:creator");
    expect(builtHtml).toContain("@sertaoseracloud");
  });
});

// ---------------------------------------------------------------------------
// ANIM-02 — IntersectionObserver script behavior
// ---------------------------------------------------------------------------
// The IO script lives inside a <script> tag in Layout.astro and runs in the
// browser. We replicate its exact logic in the test, mock IntersectionObserver
// via happy-dom globals, and assert the DOM mutations it must produce.
// ---------------------------------------------------------------------------

describe("ANIM-02 — IO reveal script adds data-revealed on intersection", () => {
  // Store the callback captured from the IntersectionObserver constructor
  let capturedCallback: IntersectionObserverCallback | null = null;
  let mockObserve: ReturnType<typeof vi.fn>;
  let mockUnobserve: ReturnType<typeof vi.fn>;
  let mockDisconnect: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    capturedCallback = null;
    mockObserve = vi.fn();
    mockUnobserve = vi.fn();
    mockDisconnect = vi.fn();

    // Mock IntersectionObserver — happy-dom may not implement it
    vi.stubGlobal(
      "IntersectionObserver",
      vi.fn((callback: IntersectionObserverCallback) => {
        capturedCallback = callback;
        return {
          observe: mockObserve,
          unobserve: mockUnobserve,
          disconnect: mockDisconnect,
        };
      })
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    document.body.innerHTML = "";
  });

  /**
   * Replicates the IO script from Layout.astro so we can drive it in tests.
   * The script is reproduced verbatim — do NOT alter this function to fix tests.
   */
  function runRevealScript() {
    const revealEls = document.querySelectorAll("[data-reveal]");
    if (revealEls.length > 0) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.setAttribute("data-revealed", "");
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.15 }
      );
      revealEls.forEach((el) => observer.observe(el));
      document.addEventListener(
        "astro:before-swap",
        () => observer.disconnect(),
        { once: true }
      );
    }
  }

  it("adds data-revealed attribute when entry.isIntersecting is true", () => {
    // Arrange
    document.body.innerHTML = '<section data-reveal id="target"></section>';
    const el = document.getElementById("target") as HTMLElement;

    // Act — run script then simulate IO callback with isIntersecting=true
    runRevealScript();
    expect(capturedCallback).not.toBeNull();
    capturedCallback!(
      [{ isIntersecting: true, target: el } as IntersectionObserverEntry],
      {} as IntersectionObserver
    );

    // Assert
    expect(el.hasAttribute("data-revealed")).toBe(true);
  });

  it("calls unobserve after revealing (fire-once pattern)", () => {
    // Arrange
    document.body.innerHTML = '<section data-reveal id="target"></section>';
    const el = document.getElementById("target") as HTMLElement;

    // Act
    runRevealScript();
    capturedCallback!(
      [{ isIntersecting: true, target: el } as IntersectionObserverEntry],
      {} as IntersectionObserver
    );

    // Assert — element must be unobserved so the callback never fires again
    expect(mockUnobserve).toHaveBeenCalledWith(el);
    expect(mockUnobserve).toHaveBeenCalledTimes(1);
  });

  it("does NOT add data-revealed when entry.isIntersecting is false", () => {
    // Arrange
    document.body.innerHTML = '<section data-reveal id="target"></section>';
    const el = document.getElementById("target") as HTMLElement;

    // Act
    runRevealScript();
    capturedCallback!(
      [{ isIntersecting: false, target: el } as IntersectionObserverEntry],
      {} as IntersectionObserver
    );

    // Assert
    expect(el.hasAttribute("data-revealed")).toBe(false);
  });

  it("observes every [data-reveal] element found in the document", () => {
    // Arrange — three reveal targets
    document.body.innerHTML = `
      <section data-reveal id="a"></section>
      <section data-reveal id="b"></section>
      <section data-reveal id="c"></section>
    `;
    const els = document.querySelectorAll("[data-reveal]");

    // Act
    runRevealScript();

    // Assert — observe called once per element
    expect(mockObserve).toHaveBeenCalledTimes(3);
    els.forEach((el) => expect(mockObserve).toHaveBeenCalledWith(el));
  });

  it("does not create IntersectionObserver when no [data-reveal] elements exist", () => {
    // Arrange — empty DOM
    document.body.innerHTML = "<div>no reveal elements</div>";

    // Act
    runRevealScript();

    // Assert — constructor never called
    expect(IntersectionObserver).not.toHaveBeenCalled();
  });

  it("calls disconnect when astro:before-swap event fires", () => {
    // Arrange
    document.body.innerHTML = '<section data-reveal id="target"></section>';

    // Act
    runRevealScript();
    document.dispatchEvent(new Event("astro:before-swap"));

    // Assert
    expect(mockDisconnect).toHaveBeenCalledTimes(1);
  });
});
