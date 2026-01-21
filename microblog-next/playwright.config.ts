import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright Configuration for "Outer Loop" Quality Enforcement
 *
 * This config enables:
 * - Multi-browser testing (Chromium, Firefox, Mobile Safari)
 * - Visual regression with screenshot comparison
 * - Accessibility auditing via axe-playwright
 * - Performance metrics (CLS tracking)
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  // Fail the build if you accidentally left 'test.only' in the source code
  forbidOnly: !!process.env.CI,
  // Retry on CI only for flaky test resilience
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",

  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },

  /* Test against desktop and mobile viewports for responsive verification */
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "Mobile Safari",
      use: { ...devices["iPhone 13"] },
    },
  ],

  /* Automatically start the Next.js dev server before tests */
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
