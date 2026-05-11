import { describe, it, expect, beforeAll } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { execSync } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, "../../..");

let builtHtml = "";

beforeAll(() => {
  if (!existsSync(join(PROJECT_ROOT, "dist/index.html"))) {
    execSync("npm run build", { cwd: PROJECT_ROOT, stdio: "inherit" });
  }
  builtHtml = readFileSync(join(PROJECT_ROOT, "dist/index.html"), "utf-8");
});

describe("UrgencyBar component", () => {
  it("renders output (not empty string)", () => {
    expect(builtHtml.trim()).not.toBe("");
  });

  it("renders the urgency-bar element", () => {
    expect(builtHtml).toContain("urgency-bar");
    expect(builtHtml).toMatch(/class="urgency-bar"/);
  });

  it("urgency-bar has role=status for accessibility", () => {
    expect(builtHtml).toContain('role="status"');
  });

  it("urgency-bar contains program summary text (54h)", () => {
    expect(builtHtml).toContain("54h");
  });

  it("urgency-bar contains sessoes 1:1 info", () => {
    expect(builtHtml).toContain("6 sessões 1:1");
  });

  it("urgency-bar contains Toolkit Terraform", () => {
    expect(builtHtml).toContain("Toolkit Terraform");
  });

  it("live-dot span is present for visual indicator", () => {
    expect(builtHtml).toContain("live-dot");
  });
});
