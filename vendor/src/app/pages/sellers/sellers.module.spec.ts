import { SellersModule } from './sellers.module';

describe('SellersModule', () => {
  let sellersModule: SellersModule;

  beforeEach(() => {
    sellersModule = new SellersModule();
  });

  it('should create an instance', () => {
    expect(sellersModule).toBeTruthy();
  });
});
