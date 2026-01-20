/**
 * E2E tests for post creation and timeline
 * Tests the "Type-Safe Tunnel": React → Next.js → FastAPI → PostgreSQL
 */

import { test, expect } from "@playwright/test";

test.describe("Posts and Timeline", () => {
  const testEmail = `user${Date.now()}@example.com`;
  const testUsername = `user${Date.now()}`;

  test.beforeEach(async ({ page }) => {
    // Register and login before each test
    await page.goto("/register");
    await page.fill('input[name="username"]', testUsername);
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', "testpass123");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL("/");
  });

  test("should create a post and see it in timeline", async ({ page }) => {
    const postContent = `Test post ${Date.now()}`;

    // Fill post form
    await page.fill('textarea[name="content"]', postContent);

    // Submit
    await page.click('button[type="submit"]:has-text("Post")');

    // Should see success message
    await expect(page.locator("text=Post created successfully")).toBeVisible();

    // Wait for timeline to update (revalidation)
    await page.waitForTimeout(500);

    // Should see the post in timeline
    await expect(page.locator(`text=${postContent}`)).toBeVisible();
  });

  test("should validate post length", async ({ page }) => {
    // Try to post over 280 characters
    const longContent = "a".repeat(281);
    await page.fill('textarea[name="content"]', longContent);

    // Should hit maxLength attribute
    const textarea = page.locator('textarea[name="content"]');
    const value = await textarea.inputValue();
    expect(value.length).toBeLessThanOrEqual(280);
  });

  test("should not submit empty post", async ({ page }) => {
    // Try to submit empty post
    await page.fill('textarea[name="content"]', "");
    await page.click('button[type="submit"]:has-text("Post")');

    // Should show validation error
    await expect(page.locator("text=/cannot be empty/i")).toBeVisible();
  });

  test("should show loading state while posting", async ({ page }) => {
    // Slow down network to see loading state
    await page.route("**/v1/posts", (route) => {
      setTimeout(() => route.continue(), 1000);
    });

    await page.fill('textarea[name="content"]', "Test post");
    await page.click('button[type="submit"]:has-text("Post")');

    // Should show loading text
    await expect(page.locator("text=Posting...")).toBeVisible();
  });

  test("should clear form after successful post", async ({ page }) => {
    await page.fill('textarea[name="content"]', "Test post");
    await page.click('button[type="submit"]:has-text("Post")');

    // Wait for success
    await expect(page.locator("text=Post created successfully")).toBeVisible();

    // Textarea should be cleared
    const textarea = page.locator('textarea[name="content"]');
    await expect(textarea).toHaveValue("");
  });
});
