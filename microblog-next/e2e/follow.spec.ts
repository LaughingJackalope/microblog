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
    const uniqueUser1Email = `unfollow1${Date.now()}@example.com`;
    const uniqueUser1Username = `unfollow1${Date.now()}`;
    const uniqueUser2Email = `unfollow2${Date.now()}@example.com`;
    const uniqueUser2Username = `unfollow2${Date.now()}`;

    // User 2: Register and create a post
    await page.goto("/register");
    await page.fill('input[name="username"]', uniqueUser2Username);
    await page.fill('input[name="email"]', uniqueUser2Email);
    await page.fill('input[name="password"]', "testpass123");
    await page.click('button[type="submit"]');

    const user2PostContent = `User 2 post ${Date.now()}`;
    await page.fill('textarea[name="content"]', user2PostContent);
    await page.click('button[type="submit"]:has-text("Post")');
    await expect(page.locator("text=Post created successfully")).toBeVisible();

    // Get User 2's ID
    await page.click(`text=@${uniqueUser2Username}`);
    const user2Id = page.url().split("/users/")[1];

    // Logout User 2
    await page.click("text=Logout");

    // User 1: Register
    await page.goto("/register");
    await page.fill('input[name="username"]', uniqueUser1Username);
    await page.fill('input[name="email"]', uniqueUser1Email);
    await page.fill('input[name="password"]', "testpass123");
    await page.click('button[type="submit"]');

    // Follow User 2
    await page.goto(`/users/${user2Id}`);
    await page.click("text=Follow");
    await expect(page.locator("text=Unfollow")).toBeVisible();

    // Verify post appears in timeline
    await page.goto("/");
    await expect(page.locator(`text=${user2PostContent}`)).toBeVisible();

    // Unfollow User 2
    await page.goto(`/users/${user2Id}`);
    await page.click("text=Unfollow");
    await expect(page.locator("text=Follow")).toBeVisible();

    // Go back to timeline
    await page.goto("/");

    // Should no longer see User 2's post
    await expect(page.locator(`text=${user2PostContent}`)).not.toBeVisible();
  });

  test("should show optimistic update on follow button", async ({ page }) => {
    const uniqueUser1Email = `optimistic1${Date.now()}@example.com`;
    const uniqueUser1Username = `optimistic1${Date.now()}`;
    const uniqueUser2Email = `optimistic2${Date.now()}@example.com`;
    const uniqueUser2Username = `optimistic2${Date.now()}`;

    // User 2: Register
    await page.goto("/register");
    await page.fill('input[name="username"]', uniqueUser2Username);
    await page.fill('input[name="email"]', uniqueUser2Email);
    await page.fill('input[name="password"]', "testpass123");
    await page.click('button[type="submit"]');

    // Get User 2's ID
    await page.click(`text=@${uniqueUser2Username}`);
    const user2Id = page.url().split("/users/")[1];

    // Logout User 2
    await page.click("text=Logout");

    // User 1: Register
    await page.goto("/register");
    await page.fill('input[name="username"]', uniqueUser1Username);
    await page.fill('input[name="email"]', uniqueUser1Email);
    await page.fill('input[name="password"]', "testpass123");
    await page.click('button[type="submit"]');

    // Navigate to User 2's profile
    await page.goto(`/users/${user2Id}`);

    // Button should say "Follow"
    await expect(page.locator("text=Follow")).toBeVisible();

    // Click follow
    await page.click("text=Follow");

    // Button should immediately change to "Unfollow" (optimistic update)
    // This happens before the server responds
    await expect(page.locator("text=Unfollow")).toBeVisible({ timeout: 100 });

    // Wait a bit to ensure the server action completed
    await page.waitForTimeout(500);

    // Button should still say "Unfollow" (server confirmed)
    await expect(page.locator("text=Unfollow")).toBeVisible();

    // Test unfollow optimistic update
    await page.click("text=Unfollow");
    await expect(page.locator("text=Follow")).toBeVisible({ timeout: 100 });
  });
});
