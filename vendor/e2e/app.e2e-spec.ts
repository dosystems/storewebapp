import { AzCliPage } from './app.po';

describe('az-cli App', () => {
  let page: AzCliPage;

  beforeEach(() => {
    page = new AzCliPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
