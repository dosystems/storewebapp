import { OrderdetailsModule } from './orderdetails.module';

describe('OrderdetailsModule', () => {
  let orderdetailsModule: OrderdetailsModule;

  beforeEach(() => {
    orderdetailsModule = new OrderdetailsModule();
  });

  it('should create an instance', () => {
    expect(orderdetailsModule).toBeTruthy();
  });
});
