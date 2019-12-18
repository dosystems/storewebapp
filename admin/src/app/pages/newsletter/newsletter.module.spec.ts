import { NewsletterModule } from './newsletter.module';

describe('NewsletterModule', () => {
  let newsletterModule: NewsletterModule;

  beforeEach(() => {
    newsletterModule = new NewsletterModule();
  });

  it('should create an instance', () => {
    expect(newsletterModule).toBeTruthy();
  });
});
