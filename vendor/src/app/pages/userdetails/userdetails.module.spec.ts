import { UserdetailsModule } from './userdetails.module';

describe('UserdetailsModule', () => {
  let userdetailsModule: UserdetailsModule;

  beforeEach(() => {
    userdetailsModule = new UserdetailsModule();
  });

  it('should create an instance', () => {
    expect(userdetailsModule).toBeTruthy();
  });
});
