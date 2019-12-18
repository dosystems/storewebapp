import { AddSettingsModule } from './add-settings.module';

describe('AddSettingsModule', () => {
  let addSettingsModule: AddSettingsModule;

  beforeEach(() => {
    addSettingsModule = new AddSettingsModule();
  });

  it('should create an instance', () => {
    expect(addSettingsModule).toBeTruthy();
  });
});
