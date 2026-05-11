import { getViteConfig } from "astro/config";

export default getViteConfig({
  test: {
    globals: true,
    projects: [
      {
        test: {
          name: "seo",
          include: ["tests/seo/**/*.test.ts"],
          environment: "node",
          globalSetup: ["./tests/unit/setup.ts"],
          setupFiles: ["./vitest.setup.ts"],
        },
      },
      {
        test: {
          name: "unit-integration",
          include: [
            "tests/unit/**/*.test.ts",
            "tests/integration/**/*.test.ts",
          ],
          environment: "happy-dom",
          globalSetup: ["./tests/unit/setup.ts"],
          setupFiles: ["./vitest.setup.ts"],
        },
      },
    ],
    exclude: ["tests/e2e/**"],
    coverage: {
      provider: "v8",
      include: ["src/**"],
      exclude: [
        "src/assets/**",
        "src/pages/**",
        "src/**/*.astro", // Astro SSG components are not instrumentable with v8 — tested via built HTML
      ],
      reporter: ["text", "json", "html"],
      thresholds: {
        statements: 80,
        branches: 80,
        functions: 80,
        lines: 80,
      },
    },
  },
});
