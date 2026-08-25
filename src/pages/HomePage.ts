import { Page } from '@playwright/test';
import { BasePage } from './base/BasePage';
import { Header } from './components/Header';
import { ROUTES } from '../constants/routes';

/**
 * HomePage represents the landing page of the Sauce Demo Shopify store
 */
export class HomePage extends BasePage {
  readonly header: Header;

  constructor(page: Page) {
    super(page);
    this.header = new Header(page);
  }

  /**
   * Navigates to the store home page
   */
  public async open(): Promise<void> {
    await this.goto(ROUTES.HOME);
    await this.waitForPageReady();
  }
}
