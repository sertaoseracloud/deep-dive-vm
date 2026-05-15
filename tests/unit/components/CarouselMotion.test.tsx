// tests/unit/components/CarouselMotion.test.tsx
// GAP-1: MOT-01 — CarouselMotion renders real testimonial data
// Verifies that all items passed to CarouselMotion appear in the DOM.

import { describe, it, expect, vi, afterEach } from "vitest";
import React from "react";
import { render, cleanup } from "@testing-library/react";

// Mock vanilla motion animate — returns a control object with stop/pause/play.
vi.mock("motion", () => ({
  animate: vi.fn(() => ({
    stop: vi.fn(),
    pause: vi.fn(),
    play: vi.fn(),
  })),
}));

// Mock motion-utils: no motion enabled so the animation branch is skipped.
vi.mock("../../../src/lib/motion-utils", () => ({
  useMotionEnabled: () => [false, vi.fn()],
  isMotionSupported: () => false,
  applyFallback: vi.fn(),
  MOTION_STORAGE_KEY: "motionEnabled",
}));

import { CarouselMotion } from "../../../src/components/CarouselMotion";
import { TestimonialCard, type TestimonialData } from "../../../src/components/TestimonialCard";

afterEach(() => {
  cleanup();
});

// Helper: build items shaped like production usage (TestimonialCard as content).
function makeItems(count: number): Array<{ id: string; content: React.ReactNode }> {
  return Array.from({ length: count }, (_, i) => {
    const data: TestimonialData = {
      id: `t${i}`,
      initials: `P${i}`,
      quote: `Depoimento de teste número ${i}`,
      name: `Pessoa ${i}`,
      role: `Cargo ${i}`,
    };
    return {
      id: data.id,
      content: React.createElement(TestimonialCard, { data }),
    };
  });
}

describe("CarouselMotion — renders testimonial items (MOT-01)", () => {
  it("renders a single item and its quote text appears in the DOM", () => {
    const items = makeItems(1);
    const { container } = render(React.createElement(CarouselMotion, { items }));
    expect(container.querySelector("blockquote")).toBeTruthy();
    expect(container.querySelector("blockquote")?.textContent).toBe(
      "Depoimento de teste número 0"
    );
  });

  it("renders all items passed — one carousel-item wrapper per entry", () => {
    const items = makeItems(3);
    const { container } = render(React.createElement(CarouselMotion, { items }));
    const wrappers = container.querySelectorAll(".carousel-item");
    expect(wrappers.length).toBe(3);
  });

  it("each item's quote text appears in the DOM (content integrity)", () => {
    const items = makeItems(3);
    const { container } = render(React.createElement(CarouselMotion, { items }));
    const blockquotes = container.querySelectorAll("blockquote");
    expect(blockquotes.length).toBe(3);
    blockquotes.forEach((bq, i) => {
      expect(bq.textContent).toBe(`Depoimento de teste número ${i}`);
    });
  });

  it("each item's author name appears in the DOM", () => {
    const items = makeItems(2);
    const { container } = render(React.createElement(CarouselMotion, { items }));
    const bolds = container.querySelectorAll(".quote-author b");
    expect(bolds.length).toBe(2);
    expect(bolds[0].textContent).toBe("Pessoa 0");
    expect(bolds[1].textContent).toBe("Pessoa 1");
  });

  it("renders the region landmark with correct aria-label", () => {
    const items = makeItems(1);
    const { container } = render(React.createElement(CarouselMotion, { items }));
    const region = container.querySelector('[role="region"]');
    expect(region).toBeTruthy();
    expect(region?.getAttribute("aria-label")).toBe("Testimonials carousel");
  });

  it("carousel-track element is present and wraps all items", () => {
    const items = makeItems(4);
    const { container } = render(React.createElement(CarouselMotion, { items }));
    const track = container.querySelector(".carousel-track");
    expect(track).toBeTruthy();
    expect(track?.querySelectorAll(".carousel-item").length).toBe(4);
  });

  it("renders five star icons per testimonial card", () => {
    const items = makeItems(2);
    const { container } = render(React.createElement(CarouselMotion, { items }));
    // Each TestimonialCard renders .stars with 5 SVGs
    const starContainers = container.querySelectorAll(".stars");
    expect(starContainers.length).toBe(2);
    starContainers.forEach((sc) => {
      expect(sc.querySelectorAll("svg").length).toBe(5);
    });
  });
});
