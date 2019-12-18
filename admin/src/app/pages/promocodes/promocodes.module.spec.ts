import { PromocodesModule } from './promocodes.module';

describe('PromocodesModule', () => {
  let promocodesModule: PromocodesModule;

  beforeEach(() => {
    promocodesModule = new PromocodesModule();
  });

  it('should create an instance', () => {
    expect(promocodesModule).toBeTruthy();
  });
});
