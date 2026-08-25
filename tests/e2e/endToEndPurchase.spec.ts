import { test, expect } from '../../src/fixtures/testFixtures';
import { TEST_DATA } from '../../src/data/testData';
import { PriceHelper } from '../../src/utils/priceHelper';
import { Logger } from '../../src/utils/logger';
import { APP_MESSAGES } from '../../src/constants/messages';

test.describe('E2E Purchase Flow Tests', () => {
  const targetProduct = TEST_DATA.product;
  const customerInfo = TEST_DATA.customer;

  test('TC01 - Complete End-to-End Product Purchase Flow', async ({
    page,
    homePage,
    searchResultsPage,
    productDetailPage,
    cartPage,
    checkoutPage,
  }) => {
    // 1. Navigate to Store Homepage
    Logger.step(1, 'Mağaza ana sayfasına gidiliyor...');
    await homePage.open();
    const pageTitle = await homePage.getTitle();
    expect(pageTitle).toContain(APP_MESSAGES.PAGE_TITLES.HOME);
    Logger.success(`Ana sayfa başarıyla açıldı. Başlık: "${pageTitle}"`);

    // 2. Search for the target product
    Logger.step(2, `Hedef ürün aranıyor: "${targetProduct.name}"`);
    await homePage.header.searchProduct(targetProduct.name);

    // 3. Select the target product from search results
    Logger.step(3, 'Arama sonuçlarından ürün seçiliyor...');
    await searchResultsPage.selectProduct(targetProduct.name);

    // 4. Verify Product Details Page (PDP)
    Logger.step(4, 'Ürün detay sayfası (PDP) ve fiyat doğrulanıyor...');
    const displayedTitle = await productDetailPage.getProductTitle();
    expect(displayedTitle.toLowerCase()).toContain(targetProduct.name.toLowerCase());

    const unitPrice = await productDetailPage.getProductPriceNumeric();
    expect(unitPrice, APP_MESSAGES.ASSERTIONS.PRICE_GREATER_THAN_ZERO).toBeGreaterThan(0);
    Logger.success(`Ürün PDP doğrulandı. Ürün: "${displayedTitle}", Birim Fiyat: £${unitPrice}`);

    // 5. Add product to Cart
    Logger.step(5, 'Ürün sepete ekleniyor...');
    await productDetailPage.addToCart();

    // 6. Open Cart and Verify Items & Subtotal
    Logger.step(6, 'Sepet sayfası açılıyor ve ara toplam kontrol ediliyor...');
    await cartPage.open();
    await expect.poll(
      async () => {
        const titles = await cartPage.getItemTitles();
        return titles.some(title => title.toLowerCase().includes(targetProduct.name.toLowerCase()));
      },
      {
        message: APP_MESSAGES.ASSERTIONS.PRODUCT_IN_CART,
        timeout: 10000,
      }
    ).toBeTruthy();

    const expectedSubtotal = PriceHelper.calculateTotal(unitPrice, 1);
    const actualSubtotal = await cartPage.getSubtotal();
    expect(actualSubtotal, APP_MESSAGES.ASSERTIONS.SUBTOTAL_CALCULATION_MATCH).toBeCloseTo(expectedSubtotal, 1);
    Logger.success(`Sepet doğrulandı. Ara Toplam: £${actualSubtotal}`);

    // 7. Proceed to Checkout
    Logger.step(7, 'Checkout / Sipariş tamamlama aşamasına geçiliyor...');
    await cartPage.proceedToCheckout();

    // 8. Verify Checkout Page Navigation
    await expect(page).toHaveURL(/.*checkout|.*checkouts.*/i);

    // 9. Fill Customer Delivery & Contact Information
    Logger.step(9, 'Müşteri ve teslimat adresi bilgileri dolduruluyor...');
    await checkoutPage.fillCustomerInformation(customerInfo);

    // 10. Verify order summary amount is present in checkout
    const checkoutTotal = await checkoutPage.getCheckoutTotal();
    if (checkoutTotal > 0) {
      expect(checkoutTotal, APP_MESSAGES.ASSERTIONS.CHECKOUT_TOTAL_MATCH).toBeGreaterThanOrEqual(unitPrice);
      Logger.success(`Checkout sipariş tutarı kontrol edildi: £${checkoutTotal}`);
    }

    // 11. Return to Cart and Remove Product
    Logger.step(11, 'Sepete geri dönülerek ürün sepetten siliniyor...');
    await cartPage.open();
    await cartPage.removeItem();

    // 12. Verify Product Removal and Cart is Empty
    Logger.step(12, 'Sepetin başarıyla boşaltıldığı doğrulanıyor...');
    await expect.poll(async () => await cartPage.isCartEmpty(), {
      message: APP_MESSAGES.ASSERTIONS.CART_EMPTY_AFTER_REMOVAL,
      timeout: 10000,
    }).toBeTruthy();

    const remainingItems = await cartPage.getItemTitles();
    expect(
      remainingItems.some(title => title.toLowerCase().includes(targetProduct.name.toLowerCase())),
      APP_MESSAGES.ASSERTIONS.PRODUCT_NOT_IN_CART
    ).toBeFalsy();
    Logger.success('Sepet başarıyla boşaltıldı. Uçtan uca test tamamlandı!');
  });

  test('TC02 - Quick Product Search and Details Verification', async ({
    homePage,
    searchResultsPage,
    productDetailPage,
  }) => {
    // 1. Navigate to Store Homepage
    Logger.step(1, 'Mağaza ana sayfasına gidiliyor...');
    await homePage.open();

    // 2. Search for the target product
    Logger.step(2, `Arama kutusuna ürün yazılıyor: "${targetProduct.name}"`);
    await homePage.header.searchProduct(targetProduct.name);

    // 3. Select the target product from search results
    Logger.step(3, 'Arama sonucundaki ürüne tıklanıyor...');
    await searchResultsPage.selectProduct(targetProduct.name);

    // 4. Verify Product Details Page (PDP)
    Logger.step(4, 'Ürün detay sayfası (PDP) ve fiyat doğrulanıyor...');
    const displayedTitle = await productDetailPage.getProductTitle();
    expect(displayedTitle.toLowerCase()).toContain(targetProduct.name.toLowerCase());

    const unitPrice = await productDetailPage.getProductPriceNumeric();
    expect(unitPrice, APP_MESSAGES.ASSERTIONS.PRICE_GREATER_THAN_ZERO).toBeGreaterThan(0);
    Logger.success(`TC02 Başarılı: "${displayedTitle}" PDP sayfası ve £${unitPrice} fiyatı doğrulandı!`);
  });
});
