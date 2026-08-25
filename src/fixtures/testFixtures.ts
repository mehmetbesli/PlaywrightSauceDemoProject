import { test as baseTest, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { ProductDetailPage } from '../pages/ProductDetailPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { SearchResultsPage } from '../pages/SearchResultsPage';

import * as fs from 'fs';
import * as path from 'path';
import { DateTimeHelper } from '../utils/dateTimeHelper';

/**
 * Fixture type definition aggregating all Page Object Model instances
 */
export type TestFixtures = {
  homePage: HomePage;
  productDetailPage: ProductDetailPage;
  cartPage: CartPage;
  checkoutPage: CheckoutPage;
  searchResultsPage: SearchResultsPage;
};

/**
 * Extended Playwright test instance with pre-initialized Page Objects (Dependency Injection)
 * and automatic failure screenshot handling in reports/screenShot
 */
export const test = baseTest.extend<TestFixtures>({
  page: async ({ page }, use, testInfo) => {
    await use(page);

    // Capture screenshot ONLY when the test FAILS (named strictly YYYY-MM-DD_HH-mm-ss.png)
    if (testInfo.status !== testInfo.expectedStatus) {
      const timestamp = DateTimeHelper.getTimestamp();
      const screenshotDir = path.resolve(process.cwd(), 'reports', 'screenShot');

      if (!fs.existsSync(screenshotDir)) {
        fs.mkdirSync(screenshotDir, { recursive: true });
      }

      const screenshotFilename = `${timestamp}.png`;
      const screenshotPath = path.join(screenshotDir, screenshotFilename);

      await page.screenshot({ path: screenshotPath, fullPage: true }).catch(() => {});

      await testInfo.attach('Failure Screenshot', {
        path: screenshotPath,
        contentType: 'image/png',
      }).catch(() => {});

      testInfo.annotations.push({
        type: 'custom_screenshot',
        description: `reports/screenShot/${screenshotFilename}`,
      });
    }
  },
  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },
  productDetailPage: async ({ page }, use) => {
    await use(new ProductDetailPage(page));
  },
  cartPage: async ({ page }, use) => {
    await use(new CartPage(page));
  },
  checkoutPage: async ({ page }, use) => {
    await use(new CheckoutPage(page));
  },
  searchResultsPage: async ({ page }, use) => {
    await use(new SearchResultsPage(page));
  },
});

export { expect };
