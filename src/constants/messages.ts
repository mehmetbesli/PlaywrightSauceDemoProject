/**
 * Centralized constant strings, page titles, and assertion messages
 * Used across test scenarios to prevent hardcoded strings in test files
 */
export const APP_MESSAGES = {
  PAGE_TITLES: {
    HOME: 'Sauce Demo',
  },
  ASSERTIONS: {
    CART_EMPTY_AFTER_REMOVAL: 'Cart should be empty after item removal',
    PRODUCT_IN_CART: 'Target product should be present in the cart',
    PRODUCT_NOT_IN_CART: 'Target product should not be present in the cart after removal',
    PRICE_GREATER_THAN_ZERO: 'Product unit price should be greater than zero',
    SUBTOTAL_CALCULATION_MATCH: 'Cart subtotal should match calculated item price',
    CHECKOUT_TOTAL_MATCH: 'Checkout total should be greater than or equal to unit price',
  },
} as const;
