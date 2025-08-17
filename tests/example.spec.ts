import { test, expect } from '@playwright/test';

test('basic test', async ({ page }) => {
  // Navigate to your base URL (from config)
  await page.goto('/');
  
  // Simple assertion to verify page loads
  await expect(page).toHaveTitle(/.*/, { timeout: 10000 });
  
  console.log('Test completed successfully!');
});

test('application health check', async ({ page }) => {
  // Test your actual application URL from BASE_URL env variable
  await page.goto('/');
  
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
  
  console.log('Application health check passed!');
});