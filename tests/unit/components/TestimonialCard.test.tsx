import { describe, it, expect, vi } from "vitest";

vi.mock("../../../src/lib/motion-utils", () => ({
  useMotionEnabled: () => [true, vi.fn()],
}));

import { TestimonialCard } from "../../../src/components/TestimonialCard";
import type { TestimonialData } from "../../../src/components/TestimonialCard";

describe("TestimonialCard", () => {
  it("is a function (React component)", () => {
    expect(typeof TestimonialCard).toBe("function");
  });

  it("TestimonialData interface has required fields", () => {
    const data: TestimonialData = {
      id: "test-1",
      initials: "RM",
      quote: "Test quote",
      name: "Rafael M.",
      role: "SR. CLOUD ENGINEER",
    };
    expect(data.id).toBe("test-1");
  });
});
