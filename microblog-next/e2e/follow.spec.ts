/**
 * E2E tests for follow functionality
 * Tests optimistic updates and timeline integration
 */

import { test, expect } from "@playwright/test";

test.describe("Follow Functionality", () => {
  const user1Email = `user1${Date.now()}@example.com`;
  const user1Username = `user1${Date.now()}`;
  const user2Email = `user2${Date.now()}@example.com`;
  const user2Username = `user2${Date.now()}`;

  test("should follow user and see their posts in timeline", async ({
    page,
    context,
  }) => {
    // User 2: Register and create a post
    await page.goto("/register");
    await page.fill('input[name="username"]', user2Username);
    await page.fill('input[name="email"]', user2Email);
    await page.fill('input[name="password"]', "testpass123");
    await page.click('button[type="submit"]');

    const user2PostContent = `User 2 post ${Date.now()}`;
    await page.fill('textarea[name="content"]', user2PostContent);
    await page.click('button[type="submit"]:has-text("Post")');
    await expect(page.locator("text=Post created successfully")).toBeVisible();

    // Get User 2's ID from URL
    await page.click(`text=@${user2Username}`);
    const user2Id = page.url().split("/users/")[1];

    // Logout User 2
    await page.click("text=Logout");

    // User 1: Register
    await page.goto("/register");
    await page.fill('input[name="username"]', user1Username);
    await page.fill('input[name="email"]', user1Email);
    await page.fill('input[name="password"]', "testpass123");
    await page.click('button[type="submit"]');

    // User 1's timeline should be empty (not following anyone)
    await expect(page.locator(`text=${user2PostContent}`)).not.toBeVisible();

    // Navigate to User 2's profile
    await page.goto(`/users/${user2Id}`);

    // Follow User 2
    await page.click("text=Follow");

    // Button should immediately change to "Unfollow" (optimistic update)
    await expect(page.locator("text=Unfollow")).toBeVisible();

    // Go back to timeline
    await page.goto("/");

    // Should now see User 2's post
    await expect(page.locator(`text=${user2PostContent}`)).toBeVisible();
  });

  test("should unfollow user and no longer see their posts", async ({
    page,
  }) => {
    // This test requires the same setup as above
    // In a real test suite, you'd use fixtures to share this setup
    // For now, this is a placeholder showing the pattern
    test.skip();
  });

  test("should show optimistic update on follow button", async ({ page }) => {
    // Register a user
    await page.goto("/register");
    await page.fill('input[name="username"]', user1Username);
    await page.fill('input[name="email"]', user1Email);
    await page.fill('input[name="password"]', "testpass123");
    await page.click('button[type="submit"]');

    // Create another user in a separate session
    // (In real tests, you'd use API calls or fixtures for this)
    // For now, this is a placeholder
    test.skip();
  });
});
