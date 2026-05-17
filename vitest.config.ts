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
        "src/data/**",
        "src/**/*.astro",
      ],
      reporter: ["text", "json", "html"],
      thresholds: {
        statements: 95,
        branches: 95,
        functions: 95,
        lines: 95,
      },
    },
  },
});
