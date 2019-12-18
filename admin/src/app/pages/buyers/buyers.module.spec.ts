import { BuyersModule } from './buyers.module';

describe('BuyersModule', () => {
  let buyersModule: BuyersModule;

  beforeEach(() => {
    buyersModule = new BuyersModule();
  });

  it('should create an instance', () => {
    expect(buyersModule).toBeTruthy();
  });
});
