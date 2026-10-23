import { existsSync, readFileSync } from "node:fs";
import { parse } from "dotenv";
import { defineConfig } from "vitest/config";

if (!existsSync(".env.test")) {
  throw new Error("Missing backend/.env.test. Copy .env.test.example and point it at a local test database.");
}

// Loaded before any test module, so `dotenv/config` in the app never falls back to `.env`.
Object.assign(process.env, parse(readFileSync(".env.test")), { NODE_ENV: "test" });

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    globalSetup: ["tests/global-setup.ts"],
    fileParallelism: false,
  },
});
