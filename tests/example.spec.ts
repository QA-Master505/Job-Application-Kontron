import { test, expect } from '@playwright/test';

test('basic test', async ({ page }) => {
  // Navigate to your base URL (from config)
  await page.goto('/');
  
  // Wait for page to load completely
  await page.waitForLoadState('domcontentloaded');
  
  // Simple assertion to verify page loads
  await expect(page).toHaveTitle(/.*/, { timeout: 15000 });
  
  console.log('Test completed successfully!');
});

test('application health check', async ({ page }) => {
  // Test your actual application URL from BASE_URL env variable
  await page.goto('/');
  
  // Wait for page to load completely
  await page.waitForLoadState('domcontentloaded');
  
  // Basic checks that your application loads properly
  // Adjust these assertions based on your actual application
  await expect(page).not.toHaveTitle('Error');
  
  // Check that the page doesn't show common error messages
  const errorMessages = [
    'Page not found',
    '404', 
    'Server Error',
    '500',
    'Something went wrong'
  ];
  
  for (const errorMsg of errorMessages) {
    await expect(page.locator('body')).not.toContainText(errorMsg);
  }
  
  // Verify the page actually has content (not blank)
  const bodyText = await page.locator('body').textContent();
  expect(bodyText?.length).toBeGreaterThan(0);
  
  console.log('Application health check passed!');
});

test('page loads without timeout', async ({ page }) => {
  // This test specifically checks that the page loads quickly
  const startTime = Date.now();
  
  await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 10000 });
  
  const loadTime = Date.now() - startTime;
  expect(loadTime).toBeLessThan(10000); // Should load in under 10 seconds
  
  // Verify basic page structure
  await expect(page.locator('body')).toBeVisible();
  
  console.log(`Page loaded in ${loadTime}ms`);
});