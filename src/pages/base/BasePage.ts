import { Page, Locator } from '@playwright/test';

/**
 * BasePage provides reusable core browser actions, element interactions,
 * and navigation helpers for all Page Object classes.
 */
export abstract class BasePage {
  constructor(protected readonly page: Page) {}

  /**
   * Navigates to a specific path relative to the baseURL
   */
  public async goto(path: string = ''): Promise<void> {
    await this.page.goto(path, { waitUntil: 'domcontentloaded' });
  }

  /**
   * Returns current page title
   */
  public async getTitle(): Promise<string> {
    return this.page.title();
  }

  /**
   * Safely clicks an element after ensuring it is visible
   */
  public async click(locator: Locator): Promise<void> {
    await locator.waitFor({ state: 'visible' });
    await locator.click();
  }

  /**
   * Clears and fills an input field
   */
  public async fill(locator: Locator, value: string): Promise<void> {
    await locator.waitFor({ state: 'visible' });
    await locator.fill(value);
  }

  /**
   * Retrieves inner text trimmed from a locator
   */
  public async getText(locator: Locator): Promise<string> {
    await locator.waitFor({ state: 'visible' });
    const text = await locator.innerText();
    return text.trim();
  }

  /**
   * Checks if an element is visible on the page
   */
  public async isVisible(locator: Locator): Promise<boolean> {
    return locator.isVisible();
  }

  /**
   * Presses a specific keyboard key on a locator
   */
  public async pressKey(locator: Locator, key: string): Promise<void> {
    await locator.press(key);
  }

  /**
   * Waits for DOM content to be loaded
   */
  public async waitForPageReady(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
  }
}
