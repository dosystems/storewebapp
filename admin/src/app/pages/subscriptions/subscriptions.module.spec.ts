import { SubscriptionsModule } from './subscriptions.module';

describe('SubscriptionsModule', () => {
  let subscriptionsModule: SubscriptionsModule;

  beforeEach(() => {
    subscriptionsModule = new SubscriptionsModule();
  });

  it('should create an instance', () => {
    expect(subscriptionsModule).toBeTruthy();
  });
});
