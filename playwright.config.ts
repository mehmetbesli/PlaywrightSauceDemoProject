import { defineConfig, devices } from '@playwright/test';
import { Environment } from './src/config/environment';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: Environment.isCI,
  retries: Environment.retries,
  workers: Environment.workers,
  timeout: Environment.defaultTimeout * 2, // 60s
  expect: {
    timeout: 10000,
  },
  reporter: [
    ['list'],
    ['./src/utils/customExcelReporter.ts'],
    ['./src/utils/customHtmlReporter.ts'],
  ],
  use: {
    baseURL: Environment.baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 15000,
    navigationTimeout: 30000,
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...(Environment.isCI
          ? { viewport: { width: 1920, height: 1080 } }
          : {
              viewport: null,
              launchOptions: {
                args: ['--start-maximized'],
              },
            }),
      },
    },
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
        viewport: { width: 1920, height: 1080 },
      },
    },
    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
        viewport: { width: 1920, height: 1080 },
      },
    },
  ],
});
