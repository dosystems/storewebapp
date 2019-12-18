
import 'babel-polyfill';
import request from 'supertest-as-promised';
import httpStatus from 'http-status';
import chaiAsPromised from 'chai-as-promised';
import chai, { expect } from 'chai';
import { setTimeout } from 'timers';

import app from '../../../index';

import auth from '../../http-requests/lib/authorization';
import mochaAsync from '../../lib/mocha-async';

// load credentials
import credentials from '../../data/credentials.json';
import responseCodes from '../../data/response-codes.json';

// initialize models
import Buyer from '../../models/buyer';
import Order from '../../models/orders';
// load payload module
import payload from '../../http-requests/lib/payloads';
const buyer = new Buyer(credentials.validBuyer);
const order = new Order({
  entityId: "5b7faf56f80e9b1283ce1d59",
  entityName: "Miraan Womens Dress Material",
  inventory: {
    Size: "M",
    Color: "Red"
  },
  quantity: 1,
  status: "AddToCart",
  category: "Products",
  shippingFrom: {
    "street": "4120 Freidrich Ln",
    "city": "Austin",
    "state": "TX",
    "country": "United States Of America",
    "countryCode": "US",
    "zip": "78744"
  }
});

const createpostBody = payload.getPostBody(order);
// inject promise to mocha
chai.config.includeStack = true;
chai.use(chaiAsPromised);
let orderId;
let orderDetails;
let entityId = '5b7faf56f80e9b1283ce1d59';
let entity;
let reqBody;
let step;
let shipFrom = createpostBody.shippingFrom;
let shipTo = {
  name: "manohar",
  street: "500 South Buena Vista Street",
  state: "CA",
  city: "Burbank",
  country: "United States of America",
  countryCode: "US",
  phone: "0987654321",
  zip: "91521"
};
let shippingRateDetails = {
  carrierName: "FedEx UK",
  estimatedDeliveryOn: "2018-09-14T20:00:00Z",
  expectedDeliviryDays: 3,
  packageType: "",
  serviceType: "FedEx International Priority",
  shippingAmount: 20
};
describe('## Check order functionality', () => {

  beforeEach(mochaAsync(async () => {
    // login employee and get access token
    await auth.getAccessToken(buyer);
  }));
  it('##  get entity Details', mochaAsync(async () => {
    try {
      let createResponse = await request(app).get('/api/entities/' + entityId)
        .set({ Authorization: `Bearer ${buyer.getAccessToken()}` });
      createpostBody.currencies = createResponse.body.details.inventories[0].Currency;
      entity = createResponse.body.details;
    } catch (err) {
      // error
    }
  }));

  // it('## Check order creation', mochaAsync(async () => {
  // 	try {
  // 		let createResponse = await request(app).post('/api/orders?response=true').send(createpostBody)
  // 			.set({ Authorization: `Bearer ${buyer.getAccessToken()}` })
  // 		expect(createResponse.body.respMessage).to.equal("Order added to cart successfully")
  // 		expect(createResponse.body).to.have.property(orderId);
  // 		expect(createResponse.body.details).to.have.property(userId);
  // 		expect(createResponse.body.details).to.have.property(ownerId);
  // 		expect(createResponse.body.details).to.have.property(entityId);
  // 		expect(createResponse.body.details).to.have.property(inventory);
  // 		expect(createResponse.body.details.status).to.have.property("AddToCart");
  // 		orderId = createResponse.body.orderId;
  // 	} catch (err) {
  // 		// error
  // 	}
  // }));
  it('## Check order creation', (done) => { //, mochaAsync(async () => {
    request(app).post('/api/orders?response=true')
      .send(createpostBody)
      .set({ Authorization: `Bearer ${buyer.getAccessToken()}` })
      .expect(httpStatus.OK)
      .then((createResponse) => {
        console.log(createResponse.body)
        expect(createResponse.body.respCode).to.equal(responseCodes.create);
        expect(createResponse.body.respMessage).to.equal("Order added to cart successfully")
        expect(createResponse.body).to.have.property("orderId");
        expect(createResponse.body.details).to.have.property("userId");
        expect(createResponse.body.details).to.have.property("ownerId");
        expect(createResponse.body.details).to.have.property("entityId");
        expect(createResponse.body.details).to.have.property("inventory");
        expect(createResponse.body.details.status).to.equal("AddToCart");
        orderId = createResponse.body.orderId;
        done()
      })
      // 
      .catch(done)
    // error
  });

  it('## Check order update :: place cart order', (done) => { // mochaAsync(async () => {
    reqBody = {
      orders: [{
        orderId: orderId
      }]
    }
    request(app)
      .put('/api/orders/updateCartOrders')
      .send(reqBody)
      .set({ Authorization: `Bearer ${buyer.getAccessToken()}` })
      .expect(httpStatus.OK)
      .then((createResponse) => {
        expect(createResponse.body[0].response.respCode).to.equal(responseCodes.update);

        done()
      })
      .catch(done)
  });


  // it('## Check order update :: adding shipping address order', mochaAsync(async () => {
  //  reqBody = {
  // 		orders: [{
  // 			orderId: orderId
  // 		}],
  // 		address: shipTo
  // 	}

  // 	try {
  // 		let createResponse = await request(app).put('/api/orders/updateShipmentAddress').send(reqBody)
  // 			.set({ Authorization: `Bearer ${buyer.getAccessToken()}` });
  // 		expect(createResponse.body.respCode).to.have.equal(responseCodes.update);
  // 	} catch (err) {
  // 		// error
  // 	}
  // }));

  it('## Check order update :: adding shipping address order', (done) => { //mochaAsync(async () => {
    reqBody = {
      orders: [{
        orderId: orderId
      }],
      address: shipTo
    }
    request(app).put('/api/orders/updateShipmentAddress').send(reqBody)
      .set({ Authorization: `Bearer ${buyer.getAccessToken()}` })
      .expect(httpStatus.OK)
      .then((createResponse) => {
        expect(createResponse.body.respCode).to.have.equal(responseCodes.success);
        expect(createResponse.body.respMessage).to.have.equal('Delivery address added successfully');

        done()
      })
      .catch()
    // error
  });

  // it('## get Shipping rates ', mochaAsync(async () => {
  // 	reqBody = {
  // 		parcel:[{weight: {value: 1, unit: "ounce"}, dimensions: {unit: "inch", length: 12, width: 7.1, height: 6}}],
  // 		shipFrom,
  // 		shipTo
  // 	}
  // 	try {
  // 		let createResponse = await request(app).put('/api/seller/shipmentRates').send(reqBody)
  // 			.set({ Authorization: `Bearer ${buyer.getAccessToken()}` });
  // 	} catch (err) {
  // 		// error
  // 	}
  // }));


  // it('## update order :: update order with shippinmg rates details ', mochaAsync(async () => {
  // 	reqBody = {
  // 		quantity: 1,
  // 		shippingRateDetails
  // 	}
  // 	try {
  // 		let createResponse = await request(app).put('/api/orders/' + orderId+"?response=true").send(reqBody)
  // 			.set({ Authorization: `Bearer ${buyer.getAccessToken()}` });
  // 		expect(createResponse.body.respCode).to.have.equal(responseCodes.update);
  // 		orderDetails = createResponse.body.details;
  // 		console.log(orderDetails);

  // 	} catch (err) {
  // 		// error
  // 	}
  // }));

  it('## update order :: update order with shippinmg rates details ', (done) => { //mochaAsync(async () => {
    reqBody = {
      quantity: 1,
      shippingRateDetails
    }
    request(app).put('/api/orders/' + orderId + "?response=true").send(reqBody)
      .set({ Authorization: `Bearer ${buyer.getAccessToken()}` })
      .expect(httpStatus.OK)
      .then((createResponse) => {
        expect(createResponse.body.respCode).to.have.equal(responseCodes.update);
        expect(createResponse.body.respMessage).to.have.equal('Order updated successfully');
        expect(createResponse.body).to.have.property('details')
        expect(createResponse.body.details).to.have.property('shippingRateDetails');
        expect(createResponse.body.details).to.have.property('shipmentAddress');
        orderDetails = createResponse.body.details;
        done()
      })
      .catch()
  });

  // it('##  buyer  wallet amount checking :: update order with payment details ', mochaAsync(async () => {
  //   reqBody = {wallet: {BUX: (orderDetails.currencies[1].BUX + orderDetails.shippingRateCurrencies[1].BUX)}, type: "Deduct"}
  // 	try {
  // 		let createResponse = await request(app).put('/api/buyers/'+orderDetails.userId).send(reqBody)
  // 			.set({ Authorization: `Bearer ${buyer.getAccessToken()}` });
  // 		console.log(createResponse.body)
  // 	} catch (err) {
  // 		// error
  // 	}
  // }));


  it('##  buyer  wallet amount checking :: update order with payment details ', (done) => { // mochaAsync(async () => {
    reqBody = {
      wallet: {
        BUX: (orderDetails.currencies[1].BUX + orderDetails.shippingRateCurrencies[1].BUX)
      },
      type: "Deduct"
    }
    request(app).put('/api/buyers/' + orderDetails.userId).send(reqBody)
      .set({ Authorization: `Bearer ${buyer.getAccessToken()}` })
      .expect(httpStatus.OK)
      .then((createResponse) => {
        if (createResponse.body.errorCode) {
          expect(createResponse.body.errorCode).to.equal(responseCodes.error);
          expect(createResponse.body.errorMessage).to.equal('Insufficient Balance in your account');
          step = false;
        } else if (createResponse.body.respCode) {
          expect(createResponse.body.respCode).to.equal(responseCodes.success);
          expect(createResponse.body.respMessage).to.equal('Payment completed successfully');
          step = true;
        }
        done()
      })
      .catch()
  });

  // it('##  order  payment :: update order with payment details ', mochaAsync(async () => {
  // 	reqBody = {
  // 		orders: [{
  // 			orderId: orderId,
  // 			currency: 'BUX',
  // 			price: orderDetails.currencies[1].BUX,
  // 			shippingCharges: orderDetails.shippingRateCurrencies[1].BUX,
  // 			total: (orderDetails.currencies[1].BUX + orderDetails.shippingRateCurrencies[1].BUX)
  // 		}],
  // 		payments: {
  // 			wallet: { Bux: (orderDetails.currencies[1].BUX + orderDetails.shippingRateCurrencies[1].BUX )}
  // 		},
  // 		totalPrice: (orderDetails.currencies[1].BUX + orderDetails.shippingRateCurrencies[1].BUX)
  // 	}
  // 	try {
  // 		let createResponse = await request(app).put('/api/orders/updateOrderPayment').send(reqBody)
  // 			.set({ Authorization: `Bearer ${buyer.getAccessToken()}` });
  // 		expect(createResponse.body.respCode).to.have.equal(responseCodes.update);
  // 	} catch (err) {
  // 		// error
  // 	}
  // }));

  it('##  order  payment :: update order with payment details ', (done) => {//mochaAsync(async () => {

    reqBody = {
      orders: [{
        orderId: orderId,
        currency: 'BUX',
        price: orderDetails.currencies[1].BUX,
        shippingCharges: orderDetails.shippingRateCurrencies[1].BUX,
        total: (orderDetails.currencies[1].BUX + orderDetails.shippingRateCurrencies[1].BUX)
      }],
      payments: {
        wallet: { Bux: (orderDetails.currencies[1].BUX + orderDetails.shippingRateCurrencies[1].BUX) }
      },
      totalPrice: (orderDetails.currencies[1].BUX + orderDetails.shippingRateCurrencies[1].BUX)
    }
    console.log(step)
    if (step) {
      request(app).put('/api/orders/updateOrderPayment').send(reqBody)
        .set({ Authorization: `Bearer ${buyer.getAccessToken()}` })
        .expect(httpStatus.OK)
        .then((createResponse) => {
          expect(createResponse.body[0].response.respCode).to.equal(responseCodes.success);
          expect(createResponse.body[0].response.respMessage).to.equal('Payment completed successfully');
          done()
        }).catch()
    }
  })

  // it('## get order :: get order details by Id', (done) => { //mochaAsync(async () => {
  //   if (step) {
  //     request(app).get('/api/orders/' + orderId)
  //       .set({ Authorization: `Bearer ${buyer.getAccessToken()}` })
  //       .expect(httpStatus.OK)
  //       .then((response) => {
  //         expect(response.body.details).to.have.property('invoiceNo');
  //         expect(response.body.details).to.have.property('payments');
  //         expect(response.body.details).to.have.property('totalPrice');
  //         expect(response.body.details).to.have.property('purchased');
  //         expect(response.body.details.status).to.equal("Paid");

  //         expect(response.body.respCode).to.equal(responseCodes.success);

  //         done()
  //       })
  //       .catch()
  //   }
  // });

  // it('## list orders :: get all orders details', (done) => { //mochaAsync(async () => {
  //   request(app).get('/api/orders/')
  //     .set({ Authorization: `Bearer ${buyer.getAccessToken()}` })
  //     .expect(httpStatus.OK)
  //     .then((response) => {
  //       expect(response.body.respCode).to.equal(responseCodes.success);
  //       expect(response.body).to.have.property('orders');

  //       done()
  //     })
  //     .catch()
  // });

  // it('## update order :: update order status paid to processing ', (done) => { //mochaAsync(async () => {
  //   request(app).put('/api/orders/' + orderId).send({ status: "Processing" })
  //     .set({ Authorization: `Bearer ${buyer.getAccessToken()}` })
  //     .expect(httpStatus.OK)
  //     .then((response) => {
  //       expect(response.body.respCode).to.equal(responseCodes.update);
  //       expect(response.body.respMessage).to.equal('Order updated successfully');

  //       done()
  //     })
  //     .catch()
  // });
  // it('## update order :: update order status paid to Shipped ', (done) => { //mochaAsync(async () => {
  //   request(app).put('/api/orders/' + orderId).send({ status: "Shipped" })
  //     .set({ Authorization: `Bearer ${buyer.getAccessToken()}` })
  //     .expect(httpStatus.OK)
  //     .then((response) => {
  //       expect(response.body.respCode).to.equal(responseCodes.update);
  //       expect(response.body.respMessage).to.equal('Order updated successfully');

  //       done()
  //     })
  //     .catch()
  // });
  it('## update order :: update order status paid to Delivered ', (done) => { //mochaAsync(async () => {
    request(app).put('/api/orders/' + orderId).send({ status: "Delivered" })
      .set({ Authorization: `Bearer ${buyer.getAccessToken()}` })
      .expect(httpStatus.OK)
      .then((response) => {
        expect(response.body.respCode).to.equal(responseCodes.update);
        expect(response.body.respMessage).to.equal('Order updated successfully');

        done()
      })
      .catch()
  });

  it('## order return request :: update order status Delivered to return requested', (done) => { //mochaAsync(async () => {
    request(app).put('/api/orders/' + orderId).send({ status: "ReturnRequest" })
      .set({ Authorization: `Bearer ${buyer.getAccessToken()}` })
      .expect(httpStatus.OK)
      .then((response) => {
        expect(response.body.respCode).to.equal(responseCodes.update);
        expect(response.body.respMessage).to.equal('Order return requested successfully');

        done()
      })
      .catch()
  });

  it('## order return pickedup :: update order status return requested to pickedUp', (done) => { //mochaAsync(async () => {
  	request(app).put('/api/orders/'+orderId).send({status:"PickedUp"})
  		.set({ Authorization: `Bearer ${buyer.getAccessToken()}` })
  		.expect(httpStatus.OK)
  		.then((response) => {
  			expect(response.body.respCode).to.equal(responseCodes.update);
  			expect(response.body.respMessage).to.equal('Order updated successfully');
  			done()
  		})
  		.catch()
  });

  it('## order returned :: update order status pickedUp to returned', (done) => { //mochaAsync(async () => {
  	request(app).put('/api/orders/'+orderId).send({status:"Returned"})
  		.set({ Authorization: `Bearer ${buyer.getAccessToken()}` })
  		.expect(httpStatus.OK)
  		.then((response) => {
  			expect(response.body.respCode).to.equal(responseCodes.update);
  			expect(response.body.respMessage).to.equal('Order updated successfully');
  			done()
  		})
  		.catch()
  });

  it('## order refunded :: update order status returned to refunded', (done) => { //mochaAsync(async () => {
  	request(app).put('/api/orders/'+orderId).send({status:"Refunded"})
  		.set({ Authorization: `Bearer ${buyer.getAccessToken()}` })
  		.expect(httpStatus.OK)
  		.then((response) => {
  			expect(response.body.respCode).to.equal(responseCodes.update);
  			expect(response.body.respMessage).to.equal('Order amount refunded successfully');
  			done()
  		})
  		.catch()
  });
  // it('## delete order :: delete orders ', (done) => { //mochaAsync(async () => {
  // 	request(app).delete('/api/orders/'+orderId)
  // 		.set({ Authorization: `Bearer ${buyer.getAccessToken()}` })
  // 		.expect(httpStatus.OK)
  // 		.then((response) => {
  // 			expect(response.body.respCode).to.equal(responseCodes.delete);
  // 			expect(response.body.respMessage).to.equal('Order deleted successfully');
  // 			done()
  // 		})
  // 		.catch()
  // });
});