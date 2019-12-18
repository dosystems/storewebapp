import { BrandsModule } from './brands.module';

describe('BrandsModule', () => {
  let brandsModule: BrandsModule;

  beforeEach(() => {
    brandsModule = new BrandsModule();
  });

  it('should create an instance', () => {
    expect(brandsModule).toBeTruthy();
  });
});
