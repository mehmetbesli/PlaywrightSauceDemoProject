import { Locator, Page } from '@playwright/test';
import { BasePage } from '../base/BasePage';

/**
 * Header component representing the top navigation bar and search box
 */
export class Header extends BasePage {
  readonly searchInput: Locator;

  constructor(page: Page) {
    super(page);
    this.searchInput = page.locator('#search-field');
  }

  /**
   * Searches for a product term using the header search box
   */
  public async searchProduct(term: string): Promise<void> {
    await this.fill(this.searchInput, term);
    await this.pressKey(this.searchInput, 'Enter');
    await this.waitForPageReady();
  }
}
