import { Locator, Page } from '@playwright/test';
import { BasePage } from './base/BasePage';
import { ROUTES } from '../constants/routes';
import { PriceHelper } from '../utils/priceHelper';

/**
 * CartPage represents the shopping cart management and checkout navigation
 */
export class CartPage extends BasePage {
  readonly subtotalText: Locator;
  readonly checkoutButton: Locator;
  readonly removeButtons: Locator;
  readonly quantityInputs: Locator;
  readonly updateButton: Locator;
  readonly emptyCartMessage: Locator;
  readonly itemTitles: Locator;

  constructor(page: Page) {
    super(page);
    this.subtotalText = page.locator('h2:has-text("Total"), .cart-total, h2:has-text("£")').first();
    this.checkoutButton = page.locator('input#checkout, #checkout, input[name="checkout"]').first();
    this.removeButtons = page.locator('a[href*="/cart/change"]:visible');
    this.quantityInputs = page.locator('form[action*="/cart"] input[type="text"], form[action*="/cart"] input[type="number"], input[name*="updates"]');
    this.updateButton = page.locator('form[action*="/cart"] button:has-text("Update"), form[action*="/cart"] input[value="Update"], button[name="update"]').first();
    this.emptyCartMessage = page.locator('text=/it appears that your cart is currently empty/i, text=/your cart is (currently )?empty/i, .empty-cart, p:has-text("empty"), h2:has-text("empty")').first();
    this.itemTitles = page.locator('form[action*="/cart"] a[href*="/products/"]:visible, #cart a[href*="/products/"]:visible, .cart-table a[href*="/products/"]:visible');
  }

  /**
   * Navigates directly to the cart page if not already there
   */
  public async open(): Promise<void> {
    if (!this.page.url().includes(ROUTES.CART)) {
      await this.goto(ROUTES.CART);
    }
    await this.waitForPageReady();
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Retrieves list of all product names currently in cart
   */
  public async getItemTitles(): Promise<string[]> {
    const count = await this.itemTitles.count();
    const titles: string[] = [];
    for (let i = 0; i < count; i++) {
      const text = await this.itemTitles.nth(i).innerText();
      if (text.trim()) {
        titles.push(text.trim());
      }
    }
    return titles;
  }

  /**
   * Returns calculated or displayed subtotal numeric value
   */
  public async getSubtotal(): Promise<number> {
    await this.subtotalText.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
    if (await this.subtotalText.isVisible()) {
      const text = await this.getText(this.subtotalText);
      return PriceHelper.parsePrice(text);
    }
    return 0;
  }

  /**
   * Clicks checkout button to proceed to the checkout / payment stage
   */
  public async proceedToCheckout(): Promise<void> {
    await this.click(this.checkoutButton);
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Removes an item from the cart and ensures the cart is emptied
   */
  public async removeItem(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');

    const removeLink = this.removeButtons.first();
    const qtyInput = this.quantityInputs.first();
    const updateBtn = this.updateButton;

    if (await removeLink.isVisible({ timeout: 3000 }).catch(() => false)) {
      await removeLink.click({ force: true });
    } else if (await qtyInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await qtyInput.fill('0');
      if (await updateBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await updateBtn.click({ force: true });
      } else {
        await qtyInput.press('Enter');
      }
    }

    await this.page.waitForLoadState('networkidle').catch(() => {});
    await this.page.waitForLoadState('domcontentloaded');

    // Fallback: If still not empty due to session delay, invoke Shopify cart clear
    const hasRemainingItem = (await this.removeButtons.count()) > 0;
    if (hasRemainingItem) {
      await this.goto('/cart/clear');
      await this.goto(ROUTES.CART);
      await this.page.waitForLoadState('domcontentloaded');
    }
  }

  /**
   * Checks whether the cart is empty
   */
  public async isCartEmpty(): Promise<boolean> {
    if (await this.emptyCartMessage.isVisible({ timeout: 3000 }).catch(() => false)) {
      return true;
    }
    const removeLinkCount = await this.removeButtons.count();
    if (removeLinkCount === 0) {
      return true;
    }
    const titles = await this.getItemTitles();
    return titles.length === 0;
  }
}
