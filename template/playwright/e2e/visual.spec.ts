import { test, expect } from '@playwright/test';

test('homepage renders correctly and matches visual snapshot', async ({ page }) => {
  // Navigate to the homepage
  await page.goto('/');

  // Wait for the page to be fully loaded (adjust selector if needed based on the actual UI)
  await page.waitForLoadState('networkidle');

  // Take a full page screenshot and compare it with the baseline
  await expect(page).toHaveScreenshot('homepage-full.png', {
    fullPage: true,
    maxDiffPixelRatio: 0.1, // Allow 10% difference in pixels for subtle rendering variations
  });
});
