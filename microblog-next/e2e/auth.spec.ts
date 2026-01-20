/**
 * E2E tests for authentication flow
 * Tests the complete journey from Next.js → FastAPI → Database
 */

import { test, expect } from "@playwright/test";

test.describe("Authentication", () => {
  const testEmail = `test${Date.now()}@example.com`;
  const testUsername = `testuser${Date.now()}`;
  const testPassword = "securepass123";

  test("should register a new user", async ({ page }) => {
    await page.goto("/register");

    // Fill registration form
    await page.fill('input[name="username"]', testUsername);
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', testPassword);
    await page.fill('input[name="displayName"]', "Test User");

    // Submit form
    await page.click('button[type="submit"]');

    // Should redirect to home page after successful registration
    await expect(page).toHaveURL("/");

    // Should see the timeline
    await expect(page.locator("text=What's on your mind?")).toBeVisible();
  });

  test("should login with existing credentials", async ({ page }) => {
    // First register a user
    await page.goto("/register");
    await page.fill('input[name="username"]', testUsername);
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', testPassword);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL("/");

    // Logout
    await page.click('text=Logout');
    await expect(page).toHaveURL("/login");

    // Login
    await page.fill('input[name="username"]', testUsername);
    await page.fill('input[name="password"]', testPassword);
    await page.click('button[type="submit"]');

    // Should be back on home page
    await expect(page).toHaveURL("/");
  });

  test("should show error with wrong password", async ({ page }) => {
    await page.goto("/login");

    await page.fill('input[name="username"]', "nonexistent");
    await page.fill('input[name="password"]', "wrongpassword");
    await page.click('button[type="submit"]');

    // Should show error message
    await expect(page.locator('text=/incorrect/i')).toBeVisible();

    // Should still be on login page
    await expect(page).toHaveURL("/login");
  });

  test("should validate form fields", async ({ page }) => {
    await page.goto("/register");

    // Try to submit with invalid data
    await page.fill('input[name="username"]', "ab"); // Too short
    await page.fill('input[name="email"]', "not-an-email");
    await page.fill('input[name="password"]', "short");
    await page.click('button[type="submit"]');

    // Should show validation errors (HTML5 validation or custom)
    const usernameInput = page.locator('input[name="username"]');
    await expect(usernameInput).toHaveAttribute("minlength", "3");
  });

  test("should redirect authenticated users from login page", async ({
    page,
  }) => {
    // Register and login
    await page.goto("/register");
    await page.fill('input[name="username"]', testUsername);
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', testPassword);
    await page.click('button[type="submit"]');

    // Try to visit login page
    await page.goto("/login");

    // Should be redirected to home
    await expect(page).toHaveURL("/");
  });
});
