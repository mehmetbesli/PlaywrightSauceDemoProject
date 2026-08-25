/**
 * Utility helper functions for currency parsing and numerical operations
 */
export class PriceHelper {
  /**
   * Extracts a numeric float value from a price string (e.g., '£55.00' -> 55)
   */
  public static parsePrice(priceText: string): number {
    const cleaned = priceText.replace(/[^0-9.]/g, '');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  }

  /**
   * Calculates subtotal for item price and quantity
   */
  public static calculateTotal(unitPrice: number, quantity: number): number {
    return Number((unitPrice * quantity).toFixed(2));
  }
}
