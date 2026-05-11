import { defineConfig } from "vitest/config";
import { getViteConfig } from "astro/config";

export default defineConfig(
  getViteConfig({
    test: {
      environment: "jsdom",
      globals: true,
      setupFiles: ["./vitest.setup.ts"],
      include: [
        "tests/unit/**/*.test.ts",
        "tests/integration/**/*.test.ts",
      ],
      exclude: ["tests/e2e/**"],
      coverage: {
        provider: "v8",
        include: ["src/**"],
        exclude: ["src/assets/**", "src/pages/**"],
        thresholds: {
          statements: 80,
          branches: 80,
          functions: 80,
          lines: 80,
        },
        reporter: ["text", "json", "html"],
      },
    },
  })
);
