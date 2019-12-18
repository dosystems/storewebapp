import { ProductsorderedModule } from './productsordered.module';

describe('ProductsorderedModule', () => {
  let productsorderedModule: ProductsorderedModule;

  beforeEach(() => {
    productsorderedModule = new ProductsorderedModule();
  });

  it('should create an instance', () => {
    expect(productsorderedModule).toBeTruthy();
  });
});
