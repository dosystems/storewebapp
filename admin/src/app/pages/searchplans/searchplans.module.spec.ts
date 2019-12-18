import { SearchplansModule } from './searchplans.module';

describe('SearchplansModule', () => {
  let searchplansModule: SearchplansModule;

  beforeEach(() => {
    searchplansModule = new SearchplansModule();
  });

  it('should create an instance', () => {
    expect(searchplansModule).toBeTruthy();
  });
});
