import { AddNewProductModule } from './add-new-product.module';

describe('AddNewProductModule', () => {
  let addNewProductModule: AddNewProductModule;

  beforeEach(() => {
    addNewProductModule = new AddNewProductModule();
  });

  it('should create an instance', () => {
    expect(addNewProductModule).toBeTruthy();
  });
});
