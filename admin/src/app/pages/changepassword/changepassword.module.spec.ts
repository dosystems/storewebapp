import { ChangepasswordModule } from './changepassword.module';

describe('ChangepasswordModule', () => {
  let changepasswordModule: ChangepasswordModule;

  beforeEach(() => {
    changepasswordModule = new ChangepasswordModule();
  });

  it('should create an instance', () => {
    expect(changepasswordModule).toBeTruthy();
  });
});
