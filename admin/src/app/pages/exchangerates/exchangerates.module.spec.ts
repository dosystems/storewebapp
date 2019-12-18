import { ExchangeratesModule } from './exchangerates.module';

describe('ExchangeratesModule', () => {
  let exchangeratesModule: ExchangeratesModule;

  beforeEach(() => {
    exchangeratesModule = new ExchangeratesModule();
  });

  it('should create an instance', () => {
    expect(exchangeratesModule).toBeTruthy();
  });
});
