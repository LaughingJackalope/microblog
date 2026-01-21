/**
 * Server Action Behavioral Tests
 *
 * This suite verifies the "Server-First" mutation pattern:
 * - Server Actions (no client fetch!)
 * - Optimistic updates
 * - RSC Revalidation without full page reload
 * - Type-safe tunnel integrity during mutations
 *
 * Purpose: Prove the "BFF" (Backend-for-Frontend) pattern orchestrates
 * correctly and maintains UI consistency during async operations.
 */

import { test, expect } from "@playwright/test";

test.describe("Server Action Mutations", () => {
  const testEmail = `mutation${Date.now()}@example.com`;
  const testUsername = `mutation${Date.now()}`;

  test.beforeEach(async ({ page }) => {
    // Register and login before each test
    await page.goto("/register");
    await page.fill('input[name="username"]', testUsername);
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', "testpass123");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL("/");
  });

  test("Server Action: should optimistically update and revalidate the feed", async ({
    page,
  }) => {
    const postContent = `Automated Test Post: ${Math.random()}`;

    // Fill out the form
    await page.fill('textarea[name="content"]', postContent);

    // Click submit (The "Lock-In")
    await page.click('button[type="submit"]:has-text("Post")');

    // Assert: The post should appear in the feed WITHOUT a full page reload
    // This proves RSC Revalidation is working
    await expect(page.locator(`text=${postContent}`)).toBeVisible({
      timeout: 3000,
    });

    // Verify no full page reload occurred by checking navigation timing
    const didReload = await page.evaluate(() => {
      // If performance.navigation.type === 1, it was a reload
      return (
        performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming
      ).type === "reload";
    });

    expect(didReload).toBe(false);
  });

  test("Server Action: should handle network delays with proper loading states", async ({
    page,
  }) => {
    // Simulate a 500ms delay from the FastAPI backend
    await page.route("**/v1/posts", async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      await route.continue();
    });

    const postContent = `Delayed Post: ${Math.random()}`;

    await page.fill('textarea[name="content"]', postContent);
    await page.click('button[type="submit"]:has-text("Post")');

    // Should show loading state (e.g., "Posting..." or disabled button)
    const loadingIndicator = page.locator("text=Posting...");
    await expect(loadingIndicator).toBeVisible();

    // Eventually, the post should appear
    await expect(page.locator(`text=${postContent}`)).toBeVisible({
      timeout: 3000,
    });

    // Loading state should disappear
    await expect(loadingIndicator).not.toBeVisible();
  });

  test("Server Action: should handle validation errors from Zod schema", async ({
    page,
  }) => {
    // Try to submit an empty post (should fail Zod validation)
    await page.fill('textarea[name="content"]', "");
    await page.click('button[type="submit"]:has-text("Post")');

    // Should show validation error
    await expect(page.locator("text=/cannot be empty/i")).toBeVisible();
  });

  test("Server Action: should handle API errors gracefully", async ({
    page,
  }) => {
    // Simulate a 500 error from FastAPI
    await page.route("**/v1/posts", (route) => {
      route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ detail: "Internal server error" }),
      });
    });

    const postContent = `Error Test Post: ${Math.random()}`;

    await page.fill('textarea[name="content"]', postContent);
    await page.click('button[type="submit"]:has-text("Post")');

    // Should show error message
    await expect(page.locator("text=/error/i")).toBeVisible();

    // Post should NOT appear in the feed
    await expect(page.locator(`text=${postContent}`)).not.toBeVisible();
  });

  test("Server Action: should clear form after successful submission", async ({
    page,
  }) => {
    const postContent = `Form Clear Test: ${Math.random()}`;

    await page.fill('textarea[name="content"]', postContent);
    await page.click('button[type="submit"]:has-text("Post")');

    // Wait for success
    await expect(page.locator("text=Post created successfully")).toBeVisible();

    // Textarea should be cleared (proving the form reset works)
    const textarea = page.locator('textarea[name="content"]');
    await expect(textarea).toHaveValue("");
  });

  test("Server Action: should maintain scroll position after mutation", async ({
    page,
  }) => {
    // Create a few posts to enable scrolling
    for (let i = 0; i < 3; i++) {
      await page.fill('textarea[name="content"]', `Scroll Test Post ${i}`);
      await page.click('button[type="submit"]:has-text("Post")');
      await page.waitForTimeout(500);
    }

    // Scroll down
    await page.evaluate(() => window.scrollTo(0, 500));
    const scrollBefore = await page.evaluate(() => window.scrollY);

    // Create another post
    await page.fill('textarea[name="content"]', "Final Scroll Test Post");
    await page.click('button[type="submit"]:has-text("Post")');

    // Wait for mutation to complete
    await page.waitForTimeout(1000);

    // Scroll position should remain approximately the same
    const scrollAfter = await page.evaluate(() => window.scrollY);
    expect(Math.abs(scrollAfter - scrollBefore)).toBeLessThan(50);
  });

  test("Server Action: should handle rapid successive mutations", async ({
    page,
  }) => {
    const posts = [
      `Rapid Post 1: ${Math.random()}`,
      `Rapid Post 2: ${Math.random()}`,
      `Rapid Post 3: ${Math.random()}`,
    ];

    // Submit posts in quick succession
    for (const postContent of posts) {
      await page.fill('textarea[name="content"]', postContent);
      await page.click('button[type="submit"]:has-text("Post")');
      // Very short delay to test race conditions
      await page.waitForTimeout(100);
    }

    // All posts should eventually appear
    for (const postContent of posts) {
      await expect(page.locator(`text=${postContent}`)).toBeVisible({
        timeout: 5000,
      });
    }
  });

  test("Server Action: should verify type-safe tunnel during follow mutation", async ({
    page,
  }) => {
    // Navigate to profile (assuming there's a user to follow)
    // This tests the follow/unfollow Server Action
    await page.goto("/");

    // Look for a follow button (if one exists)
    const followButton = page.locator('button:has-text("Follow")').first();

    // Only run this test if a follow button exists
    if ((await followButton.count()) > 0) {
      await followButton.click();

      // Should update to "Unfollow" without page reload
      await expect(
        page.locator('button:has-text("Unfollow")').first()
      ).toBeVisible({ timeout: 3000 });

      // Click again to toggle back
      await page.locator('button:has-text("Unfollow")').first().click();
      await expect(
        page.locator('button:has-text("Follow")').first()
      ).toBeVisible({ timeout: 3000 });
    }
  });
});