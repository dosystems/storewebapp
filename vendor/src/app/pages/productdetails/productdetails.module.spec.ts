import { ProductdetailsModule } from './productdetails.module';

describe('ProductdetailsModule', () => {
  let productdetailsModule: ProductdetailsModule;

  beforeEach(() => {
    productdetailsModule = new ProductdetailsModule();
  });

  it('should create an instance', () => {
    expect(productdetailsModule).toBeTruthy();
  });
});
