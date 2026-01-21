/**
 * Outer Loop: UI/UX Quality Audit
 *
 * This test suite implements the "Pixel Shield" automation:
 * - Visual regression testing (screenshot comparison)
 * - Accessibility auditing (WCAG 2.1 compliance via axe)
 * - Performance metrics (Cumulative Layout Shift tracking)
 *
 * Purpose: Ensure the "Type-Safe Tunnel" maintains visual integrity,
 * inclusive UI standards, and layout stability during RSC streaming.
 */

import { test, expect } from "@playwright/test";
import { injectAxe, checkA11y } from "axe-playwright";

test.describe("Outer Loop: Visual Quality & Accessibility", () => {
  const testEmail = `vqa${Date.now()}@example.com`;
  const testUsername = `vqa${Date.now()}`;

  test.beforeEach(async ({ page }) => {
    // Create a test user and login for authenticated views
    await page.goto("/register");
    await page.fill('input[name="username"]', testUsername);
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', "testpass123");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL("/");

    // Wait for initial RSC streaming to complete
    await page.waitForLoadState("networkidle");

    // Inject axe for accessibility testing
    await injectAxe(page);
  });

  test("should pass Visual Regression and A11y audits on Home page", async ({
    page,
  }) => {
    // 1. Functional Check: Ensure the "Brain" (FastAPI) has sent data
    const postFeed = page.locator("main");
    await expect(postFeed).toBeVisible();

    // 2. Accessibility Check: Scan for WCAG violations
    // This ensures our "Inclusive UI" initiative is enforced.
    await checkA11y(page, undefined, {
      detailedReport: true,
      detailedReportOptions: { html: true },
    });

    // 3. Visual Regression: "The Pixel Shield"
    // This will fail if the UI differs by even a small margin from the baseline.
    await expect(page).toHaveScreenshot("home-page-baseline.png", {
      maxDiffPixels: 100, // Strict threshold for "Pixel Perfect" UI
      threshold: 0.2,
    });
  });

  test("should pass A11y audit on Login page (unauthenticated)", async ({
    page,
  }) => {
    // Logout first
    await page.goto("/logout");
    await page.goto("/login");

    // Re-inject axe on new page
    await injectAxe(page);

    await checkA11y(page, undefined, {
      detailedReport: true,
      detailedReportOptions: { html: true },
    });
  });

  test("should pass A11y audit on Register page", async ({ page }) => {
    await page.goto("/register");

    // Re-inject axe on new page
    await injectAxe(page);

    await checkA11y(page, undefined, {
      detailedReport: true,
      detailedReportOptions: { html: true },
    });
  });

  test("should maintain layout stability during RSC streaming", async ({
    page,
  }) => {
    // Navigate to a fresh page load
    await page.goto("/");

    // Wait for page to fully load
    await page.waitForLoadState("networkidle");

    // Verify Cumulative Layout Shift (CLS) is near zero
    // This proves our Suspense Skeletons are well-aligned.
    const cls = await page.evaluate(() => {
      return new Promise<number>((resolve) => {
        let clsValue = 0;

        // Use PerformanceObserver to track layout shifts
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!(entry as any).hadRecentInput) {
              clsValue += (entry as any).value;
            }
          }
        });

        observer.observe({ type: "layout-shift", buffered: true });

        // Wait a bit for any shifts to happen
        setTimeout(() => {
          observer.disconnect();
          resolve(clsValue);
        }, 1000);
      });
    });

    // Assert CLS is below the "good" threshold (0.1)
    // Reference: https://web.dev/cls/
    expect(cls).toBeLessThan(0.1);
  });

  test("should have consistent PostCard visual across viewports", async ({
    page,
  }) => {
    // Create a test post for visual comparison
    const postContent = `Visual Test Post ${Date.now()}`;
    await page.fill('textarea[name="content"]', postContent);
    await page.click('button[type="submit"]:has-text("Post")');
    await expect(page.locator("text=Post created successfully")).toBeVisible();

    // Wait for timeline to revalidate
    await page.waitForTimeout(500);

    // Find the PostCard
    const postCard = page
      .locator("article")
      .filter({ hasText: postContent })
      .first();
    await expect(postCard).toBeVisible();

    // Visual regression on the individual component
    await expect(postCard).toHaveScreenshot("post-card-component.png", {
      maxDiffPixels: 50,
    });
  });

  test("should verify Sidebar visual consistency", async ({ page }) => {
    const sidebar = page.locator("aside").first();
    await expect(sidebar).toBeVisible();

    await expect(sidebar).toHaveScreenshot("sidebar-component.png", {
      maxDiffPixels: 50,
    });
  });

  test("should verify Timeline page full visual regression", async ({
    page,
  }) => {
    // Full page screenshot for comprehensive regression testing
    await expect(page).toHaveScreenshot("timeline-full-page.png", {
      fullPage: true,
      maxDiffPixels: 150,
    });
  });
});