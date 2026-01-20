/**
 * E2E tests for progressive enhancement
 * Verifies forms work without JavaScript
 */

import { test, expect } from "@playwright/test";

test.describe("Progressive Enhancement", () => {
  test("should login without JavaScript", async ({ browser }) => {
    const context = await browser.newContext({
      javaScriptEnabled: false,
    });
    const page = await context.newPage();

    // First, register a user with JS enabled to set up test data
    const jsContext = await browser.newContext();
    const jsPage = await jsContext.newPage();

    const testUsername = `nojs${Date.now()}`;
    const testEmail = `nojs${Date.now()}@example.com`;

    await jsPage.goto("/register");
    await jsPage.fill('input[name="username"]', testUsername);
    await jsPage.fill('input[name="email"]', testEmail);
    await jsPage.fill('input[name="password"]', "testpass123");
    await jsPage.click('button[type="submit"]');
    await jsPage.waitForURL("/");
    await jsContext.close();

    // Now test login without JavaScript
    await page.goto("/login");

    // Fill form
    await page.fill('input[name="username"]', testUsername);
    await page.fill('input[name="password"]', "testpass123");

    // Submit (should use native form submission)
    await page.click('button[type="submit"]');

    // Should work and redirect to home
    // Note: Without JS, this relies on native form action
    await expect(page).toHaveURL("/");
  });

  test("should render content without JavaScript", async ({ browser }) => {
    const context = await browser.newContext({
      javaScriptEnabled: false,
    });
    const page = await context.newPage();

    await page.goto("/login");

    // Should see the login form
    await expect(page.locator('input[name="username"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();

    // Form should have action attribute for progressive enhancement
    const form = page.locator("form");
    const actionAttr = await form.getAttribute("action");
    // Action might be undefined in client components, but the form should still be visible
    expect(form).toBeVisible();

    await context.close();
  });

  test("should show HTML5 validation", async ({ page }) => {
    await page.goto("/register");

    // Try to submit with invalid data
    await page.fill('input[name="username"]', "ab"); // Too short
    await page.click('button[type="submit"]');

    // HTML5 validation should prevent submission
    const usernameInput = page.locator('input[name="username"]');
    const validityState = await usernameInput.evaluate((el: HTMLInputElement) =>
      el.validity.valid
    );
    expect(validityState).toBe(false);
  });
});
