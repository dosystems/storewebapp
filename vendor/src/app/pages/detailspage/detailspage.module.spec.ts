import { DetailspageModule } from './detailspage.module';

describe('DetailspageModule', () => {
  let detailspageModule: DetailspageModule;

  beforeEach(() => {
    detailspageModule = new DetailspageModule();
  });

  it('should create an instance', () => {
    expect(detailspageModule).toBeTruthy();
  });
});
