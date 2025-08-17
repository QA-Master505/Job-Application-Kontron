// playwright.config.ts
// -----------------------------------------------------------------------------
// Central Playwright configuration for Job-Application-Kontron
// Optimized: CI uses Chromium only, local dev can toggle extra browsers.
// Every line is commented for clarity.
// -----------------------------------------------------------------------------

import { defineConfig, devices } from '@playwright/test'; // Import Playwright helpers
import dotenv from 'dotenv';                              // For .env file support
import path from 'node:path';                             // Safer path handling

// Load environment variables explicitly from the project root `.env`
dotenv.config({ path: path.resolve(__dirname, '.env') });

// -----------------------------------------------------------------------------
// Flags & constants (readable variables, all overrideable via .env)
// -----------------------------------------------------------------------------
const CI = process.env.CI === 'true'; // Are we running in CI/CD (GitHub Actions)?
const BASE_URL = process.env.BASE_URL || 'https://example.com'; // Default base URL
const HEADLESS = CI ? true : process.env.HEADLESS === 'true';   // Headless in CI, toggle locally
const SLOW_MO = CI ? 0 : Number(process.env.SLOW_MO || 0);      // Add slowMo locally for debugging
const ACTION_TIMEOUT = Number(process.env.ACTION_TIMEOUT || 10_000); // Timeout for clicks, typing, etc.
const NAV_TIMEOUT = Number(process.env.NAVIGATION_TIMEOUT || 15_000); // Timeout for navigation events
const TEST_TIMEOUT = Number(process.env.TEST_TIMEOUT || 90_000);      // Max test runtime
const EXPECT_TIMEOUT = Number(process.env.EXPECT_TIMEOUT || 5_000);   // Default expect() timeout

// Toggle additional browsers locally (Firefox, Safari, Edge)
// - CI will force this to false (saves GitHub minutes & runtime)
const ENABLE_ALL_BROWSERS =
  !CI && (process.env.ENABLE_ALL_BROWSERS || 'false').toLowerCase() === 'true';

// -----------------------------------------------------------------------------
// Define which browsers (projects) to run
// -----------------------------------------------------------------------------
const projects = [
  {
    name: 'chromium',                     // Always run Chromium (Google Chrome)
    use: { ...devices['Desktop Chrome'] } // Apply Playwright's built-in desktop Chrome settings
  },
  // Enable extra browsers only locally when user opts in
  ...(ENABLE_ALL_BROWSERS
    ? [
        { name: 'firefox', use: { ...devices['Desktop Firefox'] } }, // Firefox desktop
        { name: 'webkit', use: { ...devices['Desktop Safari'] } },   // Safari/WebKit
        {
          name: 'edge',
          use: {
            ...devices['Desktop Edge'],   // Microsoft Edge desktop
            channel: 'msedge',            // Requires Edge installed locally
          },
        },
      ]
    : []),
];

// -----------------------------------------------------------------------------
// Export Playwright config
// -----------------------------------------------------------------------------
export default defineConfig({
  testDir: './tests',     // Location of test files
  outputDir: 'test-results', // Folder for test artifacts (traces, screenshots, etc.)
  timeout: TEST_TIMEOUT,  // Max timeout per test

  // Parallelization and retries
  fullyParallel: !CI,     // Run tests in parallel locally; serial in CI if needed
  forbidOnly: CI,         // Prevent committed test.only in CI
  retries: CI ? 1 : 0,    // Retry once in CI for stability
  workers: CI ? 1 : undefined, // Use 1 worker in CI; auto-detect locally

  // Reporters (console + HTML report)
  reporter: [
    ['list'],                                                 // Console output
    ['html', { outputFolder: 'playwright-report', open: CI ? 'never' : 'on-failure' }], // HTML report
  ],

  // Default test context settings
  use: {
    baseURL: BASE_URL,                   // Use env-configured base URL
    headless: HEADLESS,                  // Headless in CI, optional locally
    launchOptions: { slowMo: SLOW_MO },  // Slows actions locally for debugging
    trace: CI ? 'retain-on-failure' : 'on-first-retry', // Save traces only when helpful
    screenshot: 'only-on-failure',       // Take screenshots only if a test fails
    video: CI ? 'off' : 'retain-on-failure', // Keep failure videos locally

    // Timeout settings
    actionTimeout: ACTION_TIMEOUT,       // For clicks, fills, etc.
    navigationTimeout: NAV_TIMEOUT,      // For page.goto(), waits

    // Viewport and browser environment
    viewport: { width: 1366, height: 820 }, // Standard desktop viewport
  },

  // The browsers (projects) defined above
  projects,

  // Default expect() timeout for assertions
  expect: { timeout: EXPECT_TIMEOUT },
});
