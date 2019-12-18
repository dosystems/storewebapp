import { AttributesModule } from './attributes.module';

describe('AttributesModule', () => {
  let attributesModule: AttributesModule;

  beforeEach(() => {
    attributesModule = new AttributesModule();
  });

  it('should create an instance', () => {
    expect(attributesModule).toBeTruthy();
  });
});
