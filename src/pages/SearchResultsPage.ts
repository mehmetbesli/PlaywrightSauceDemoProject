import { Locator, Page } from '@playwright/test';
import { BasePage } from './base/BasePage';

/**
 * SearchResultsPage represents the product search results page
 */
export class SearchResultsPage extends BasePage {
  readonly productLinks: Locator;

  constructor(page: Page) {
    super(page);
    this.productLinks = page.locator('a[href*="/products/"]');
  }

  /**
   * Returns locator for a specific product link matching name
   */
  public getProductLink(productName: string): Locator {
    return this.productLinks.filter({ hasText: productName }).first();
  }

  /**
   * Selects a search result product by its name
   */
  public async selectProduct(productName: string): Promise<void> {
    const targetProduct = this.getProductLink(productName);
    await this.click(targetProduct);
    await this.waitForPageReady();
  }
}
