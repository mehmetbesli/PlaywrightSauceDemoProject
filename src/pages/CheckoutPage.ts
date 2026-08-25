import { Locator, Page } from '@playwright/test';
import { BasePage } from './base/BasePage';
import { CustomerInfo } from '../data/testData';
import { PriceHelper } from '../utils/priceHelper';

/**
 * CheckoutPage represents the customer details, delivery address, and order summary
 */
export class CheckoutPage extends BasePage {
  readonly emailInput: Locator;
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly addressInput: Locator;
  readonly apartmentInput: Locator;
  readonly cityInput: Locator;
  readonly postalCodeInput: Locator;
  readonly orderSummaryTotal: Locator;

  constructor(page: Page) {
    super(page);
    this.emailInput = page.locator('input[name="email"]:visible, #email:visible, input[type="email"]:visible, #checkout_email:visible').first();
    this.firstNameInput = page.locator('input[name="firstName"]:visible, input[placeholder*="First name"]:visible, #checkout_shipping_address_first_name:visible').first();
    this.lastNameInput = page.locator('input[name="lastName"]:visible, input[placeholder*="Last name"]:visible, #checkout_shipping_address_last_name:visible').first();
    this.addressInput = page.locator('input[name="address1"]:visible, input[placeholder*="Address"]:visible, #checkout_shipping_address_address1:visible').first();
    this.apartmentInput = page.locator('input[name="address2"]:visible, input[placeholder*="Apartment"]:visible, #checkout_shipping_address_address2:visible').first();
    this.cityInput = page.locator('input[name="city"]:visible, input[placeholder*="City"]:visible, #checkout_shipping_address_city:visible').first();
    this.postalCodeInput = page.locator('input[name="postalCode"]:visible, input[placeholder*="Postal"]:visible, input[placeholder*="Postcode"]:visible, #checkout_shipping_address_zip:visible').first();
    this.orderSummaryTotal = page.locator('.total-line__price, .order-summary__emphasis, .payment-due__price, span[data-checkout-subtotal-price-target]');
  }

  /**
   * Fills contact and delivery customer details in the checkout form
   */
  public async fillCustomerInformation(customer: CustomerInfo): Promise<void> {
    if (await this.emailInput.isVisible()) {
      await this.fill(this.emailInput, customer.email);
    }
    if (await this.firstNameInput.isVisible()) {
      await this.fill(this.firstNameInput, customer.firstName);
    }
    if (await this.lastNameInput.isVisible()) {
      await this.fill(this.lastNameInput, customer.lastName);
    }
    if (await this.addressInput.isVisible()) {
      await this.fill(this.addressInput, customer.address);
    }
    if (customer.apartment && (await this.apartmentInput.isVisible())) {
      await this.fill(this.apartmentInput, customer.apartment);
    }
    if (await this.cityInput.isVisible()) {
      await this.fill(this.cityInput, customer.city);
    }
    if (await this.postalCodeInput.isVisible()) {
      await this.fill(this.postalCodeInput, customer.postalCode);
    }
  }

  /**
   * Retrieves checkout total price
   */
  public async getCheckoutTotal(): Promise<number> {
    if (await this.orderSummaryTotal.first().isVisible()) {
      const text = await this.getText(this.orderSummaryTotal.first());
      return PriceHelper.parsePrice(text);
    }
    return 0;
  }
}
