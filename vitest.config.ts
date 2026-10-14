import { getViteConfig } from "astro/config";
import type { ViteUserConfig } from "vitest/config";

// O Astro traz o próprio Vite; as opções do Vitest são conferidas pelo tipo do
// Vitest e repassadas ao getViteConfig.
const config: ViteUserConfig = {
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
            "tests/unit/**/*.test.tsx",
            "tests/integration/**/*.test.ts",
            "tests/integration/**/*.test.tsx",
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
        "src/styles/**",
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
};

export default getViteConfig(config as Parameters<typeof getViteConfig>[0]);
