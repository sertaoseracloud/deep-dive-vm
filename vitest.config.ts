import { getViteConfig } from "astro/config";

export default getViteConfig({
  test: {
    environment: "happy-dom",
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
      exclude: [
        "src/assets/**",
        "src/pages/**",
        "src/**/*.astro", // Astro SSG components are not instrumentable with v8 — tested via built HTML
      ],
      reporter: ["text", "json", "html"],
    },
  },
});
