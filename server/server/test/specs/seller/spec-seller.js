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
import Seller from '../../models/seller';

// load payload module
import payload from '../../http-requests/lib/payloads';
// const authSeller = new Seller(credentials.validSeller);
const seller = new Seller({ firstName: "sai", lastName: "h", email: "sai5656@yopmail.com", companyName: "sai co" });
const createpostBody = payload.getPostBody(seller);
console.log()
// inject promise to mocha
chai.config.includeStack = true;
chai.use(chaiAsPromised);
describe('## Check seller creation', () => {
  it('## Check seller creation', (done) => {// mochaAsync(async () => {
    request(app).post('/api/sellers/signUp').send(createpostBody)
      .expect(httpStatus.OK)
      .then((res) => {
        expect(res.body.respCode).to.equal(responseCodes.create);
        expect(res.body.respMessage).to.equal('Registration successful. Activation link has been sent to registered mail');
        expect(res.body).to.have.property('sellerId')
        done()
      })
      // 
      .catch(done)
    // error
  });
  it('## Check seller creation :: Email already exists when create same seller', (done) => { //mochaAsync(async () => {
    request(app).post('/api/seller/signUp').send(createpostBody)
      .expect(httpStatus.OK)
      .then((res) => {
        expect(res.body).to.have.property('errorMessage');
        expect(res.body.errorCode).to.equal(responseCodes.error);
        done()
      })
      // 
      .catch(done)
    // error
  });
});