import { test, expect } from "@playwright/test";

test.describe("Complete User Flow", () => {
  test("runs the core dairy management scenario", async ({ page }) => {
    // Login
    await page.goto("http://localhost:3000/login");
    await page.fill('input[type="email"]', "admin@ichhadhari.com");
    await page.fill('input[type="password"]', "Admin@123");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/dashboard/);

    // Dashboard sanity check
    await expect(
      page.getByText("Total Milk Collected", { exact: false })
    ).toBeVisible();

    // Vendor creation
    await page.getByRole("link", { name: /Procurement/i }).click();
    await page.getByRole("link", { name: /Vendors/i }).click();
    await page.getByRole("button", { name: /Add Vendor/i }).click();
    await page.fill('input[name="company_name"]', "Test Vendor E2E");
    await page.fill('input[name="phone"]', "9876543210");
    await page.fill('input[name="email"]', "test.vendor@example.com");
    await page.click('button[type="submit"]');
    await expect(page.getByText(/Vendor created successfully/i)).toBeVisible();

    // Milk collection capture (selectors are placeholders until UI is finalised)
    await page.getByRole("link", { name: /Milk Collections/i }).click();
    await page.getByRole("button", { name: /Record Collection/i }).click();
    // TODO: fill out the milk collection form once the front-end contract is confirmed.

    // Analytics navigation
    await page.getByRole("link", { name: /Analytics/i }).click();
    await expect(page.getByText(/Sales Report/i)).toBeVisible();
  });
});
