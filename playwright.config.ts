import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "tests/e2e",
  workers: 1,
  expect: { timeout: 15000 },
  timeout: 90000,
  use: {
    baseURL: "http://localhost:3005",
    headless: true,
    actionTimeout: 15000,
    reducedMotion: "reduce",
  },
  reporter: "list",
});
