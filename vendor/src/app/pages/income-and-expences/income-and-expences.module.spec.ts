import { IncomeAndExpencesModule } from './income-and-expences.module';

describe('IncomeAndExpencesModule', () => {
  let incomeAndExpencesModule: IncomeAndExpencesModule;

  beforeEach(() => {
    incomeAndExpencesModule = new IncomeAndExpencesModule();
  });

  it('should create an instance', () => {
    expect(incomeAndExpencesModule).toBeTruthy();
  });
});
