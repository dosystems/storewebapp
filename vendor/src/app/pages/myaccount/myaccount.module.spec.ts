import { MyaccountModule } from './myaccount.module';

describe('MyaccountModule', () => {
  let myaccountModule: MyaccountModule;

  beforeEach(() => {
    myaccountModule = new MyaccountModule();
  });

  it('should create an instance', () => {
    expect(myaccountModule).toBeTruthy();
  });
});
