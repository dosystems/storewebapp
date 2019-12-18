import { AddProductModule } from './add-product.module';

describe('AddProductModule', () => {
  let addProductModule: AddProductModule;

  beforeEach(() => {
    addProductModule = new AddProductModule();
  });

  it('should create an instance', () => {
    expect(addProductModule).toBeTruthy();
  });
});
