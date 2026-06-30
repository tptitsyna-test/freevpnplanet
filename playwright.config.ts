import { defineConfig, devices } from '@playwright/test';

const browsers = [
  { name: 'chrome', device: devices['Desktop Chrome'] },
  { name: 'safari', device: devices['Desktop Safari'] },
] as const;

const productAreas = [
  {
    name: 'marketing',
    testMatch: /marketing\.spec\.ts/,
    baseURL: 'https://freevpnplanet.com',
  },
  {
    name: 'account-checkout',
    testMatch: /account-checkout\.spec\.ts/,
    baseURL: 'https://account.freevpnplanet.com',
  },
  {
    name: 'personal-en',
    testMatch: /personal-en\.spec\.ts/,
    baseURL: 'https://personal.freevpnplanet.com',
  },
  {
    name: 'personal-ru',
    testMatch: /personal-ru\.spec\.ts/,
    baseURL: 'https://planetconfig.com',
  },
] as const;

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  timeout: 60_000,
  expect: {
    timeout: 10_000,
  },
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [
    ['list'],
    ['html', { open: 'never' }],
  ],
  use: {
    testIdAttribute: 'data-test-id', //page.getByTestId('...') должен искать атрибут data-test-id, а не стандартный data-testid
    actionTimeout: 15_000,
    navigationTimeout: 60_000,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  projects: productAreas.flatMap((area) =>
    browsers.map((browser) => ({
      name: `${area.name}-${browser.name}`,
      testMatch: area.testMatch,
      use: {
        ...browser.device,
        baseURL: area.baseURL,
      },
    })),
  ),
});
