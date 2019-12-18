import { AnouncementsModule } from './anouncements.module';

describe('AnouncementsModule', () => {
  let anouncementsModule: AnouncementsModule;

  beforeEach(() => {
    anouncementsModule = new AnouncementsModule();
  });

  it('should create an instance', () => {
    expect(anouncementsModule).toBeTruthy();
  });
});
