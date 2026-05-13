import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
export const PROJECT_ROOT = join(__dirname, "../..");

// Build once before all unit tests run (globalSetup — runs in the main process, not in workers)
export function ensureBuild() {
  if (!existsSync(join(PROJECT_ROOT, "dist", "index.html"))) {
    console.log("[setup] Building site for unit tests...");
    execSync("npm run build", { cwd: PROJECT_ROOT, stdio: "inherit" });
  }
}

export default function setup() {
  ensureBuild();
}
