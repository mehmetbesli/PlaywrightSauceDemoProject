/**
 * Test dataset for E2E scenarios and assertions
 */
export interface ProductInfo {
  name: string;
}

export interface CustomerInfo {
  email: string;
  firstName: string;
  lastName: string;
  address: string;
  apartment?: string;
  city: string;
  postalCode: string;
}

export const TEST_DATA = {
  product: {
    name: 'Grey Jacket',
  } as ProductInfo,
  customer: {
    email: 'automation.tester@example.com',
    firstName: 'Mehmet',
    lastName: 'Tester',
    address: '10 Downing Street',
    apartment: 'Suite 4B',
    city: 'London',
    postalCode: 'SW1A 2AA',
  } as CustomerInfo,
};
