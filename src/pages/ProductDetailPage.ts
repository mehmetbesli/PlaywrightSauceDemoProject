import { Locator, Page } from '@playwright/test';
import { BasePage } from './base/BasePage';
import { PriceHelper } from '../utils/priceHelper';

/**
 * ProductDetailPage represents the single product view and add to cart action
 */
export class ProductDetailPage extends BasePage {
  readonly productTitle: Locator;
  readonly productPrice: Locator;
  readonly addToCartButton: Locator;

  constructor(page: Page) {
    super(page);
    this.productTitle = page.locator('#product-form h1, h1[itemprop="name"], .product-title').first();
    this.productPrice = page.locator('#product-price, .product-price, #product-form .product-price').first();
    this.addToCartButton = page.locator('#add, input#add, input[value="Add To Cart"], #product-form input[type="submit"]').first();
  }

  /**
   * Retrieves the displayed product title
   */
  public async getProductTitle(): Promise<string> {
    return this.getText(this.productTitle);
  }

  /**
   * Retrieves the numeric product price
   */
  public async getProductPriceNumeric(): Promise<number> {
    const text = await this.getText(this.productPrice);
    return PriceHelper.parsePrice(text);
  }

  /**
   * Adds the current product to cart and waits for cart update
   */
  public async addToCart(): Promise<void> {
    await Promise.all([
      this.page.waitForURL(url => url.pathname.includes('/cart'), { timeout: 10000 }).catch(() => {}),
      this.addToCartButton.click(),
    ]);
    await this.page.waitForLoadState('domcontentloaded');
  }
}
