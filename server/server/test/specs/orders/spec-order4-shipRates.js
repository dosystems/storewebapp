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
		"address_line1": "Dashwood House",
		"city_locality": "London",
		"state_province": "UK",
		"postal_code": "EC2M 1QS",
		"country_code": "GB",
		"name": "ilyas",
		"phone": "998989898998"
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
	"address_line1": "500 South Buena Vista Street",
	"city_locality": "Burbank",
	"state_province": "CA",
	"postal_code": "91521",
	"country_code": "US",
	"name": "Anusah Anu",
	"phone": "0987654321"
};
let shippingRateDetails = {
	carrierName: "FedEx UK",
	estimatedDeliveryOn: "2018-09-14T20:00:00Z",
	expectedDeliviryDays: 3,
	packageType: "",
	serviceType: "FedEx International Priority",
	shippingAmount: 20
};
describe('## Check shippimngrates functionality', () => {
	beforeEach(mochaAsync(async () => {
		// login employee and get access token
		await auth.getAccessToken(buyer);
	}));
	reqBody = {
		parcel: [{ weight: { value: 1, unit: "ounce" }, dimensions: { unit: "inch", length: 12, width: 7.1, height: 6 } }],
		shipFrom,
		shipTo
	}
	it('## get Shipping rates ', (done) => { //mochaAsync(async () => {
		request(app).post('/api/sellers/shipmentRates').send(reqBody)
			.set({ Authorization: `Bearer ${buyer.getAccessToken()}` })
			.expect(httpStatus.OK)
			.then((response) => {

				console.log(response.body)
				done()
				// expect(response.body.respCode).to.equal(responseCodes.update);
				// expect(response.body.respMessage).to.equal('Order cancelled successfully')

			})
			.catch()
	}).timeout(5000)
	/* 	it('## get Shipping rates ', mochaAsync(async () => {
			reqBody = {
				parcel:[{weight: {value: 1, unit: "ounce"}, dimensions: {unit: "inch", length: 12, width: 7.1, height: 6}}],
				shipFrom,
				shipTo
			}
			try {
				let createResponse = await request(app).post('/api/sellers/shipmentRates').send(reqBody)
					.set({ Authorization: `Bearer ${buyer.getAccessToken()}` });
			} catch (err) {
				// error
			}
		})); */
});