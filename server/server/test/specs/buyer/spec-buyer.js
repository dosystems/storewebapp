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

// load payload module
import payload from '../../http-requests/lib/payloads';
const buyer = new Buyer({
  firstName: "Manu",
  lastName: "S",
  email: "manus155@yopmail.com",
  phoneNumber: "989989989888",
  password: "Manohar@12"
});
const createpostBody = payload.getPostBody(buyer);

// inject promise to mocha
chai.config.includeStack = true;
chai.use(chaiAsPromised);

describe('## Check buyer creation', () => {

  // beforeEach(mochaAsync(async () => {
  //   // login employee and get access token
  //   await auth.getAccessToken(authEmployee);
  // }));

  it('## Check buyer creation', (done) => {// mochaAsync(async () => {
    request(app).post('/api/buyers/signUp').send(createpostBody)
      .expect(httpStatus.OK)
      .then((res) => {
        expect(res.body.respCode).to.equal(responseCodes.create);
        expect(res.body.respMessage).to.equal('Registration successful. Activation link has been sent to registered mail');
        expect(res.body).to.have.property('buyerId')
        done()
      })
      // 
      .catch(done)
    // error
  });
  it('## Check buyer creation :: Email already exists when create same buyer', (done) => { //mochaAsync(async () => {
    request(app).post('/api/buyers/signUp').send(createpostBody)
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