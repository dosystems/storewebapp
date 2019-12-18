import 'babel-polyfill';
import request from 'supertest-as-promised';
import httpStatus from 'http-status';
import chai, { expect } from 'chai';
import { setTimeout } from 'timers';

import app from '../../../index';

// load credentials
import credentials from '../../data/credentials.json';
import responseCodes from '../../data/response-codes.json';
// initialize models
import Employee from '../../models/employee';
import Exchangerate from '../../models/exchangerates';
import i18nService from '../../../utils/i18n.util';
// load payload module
import payload from '../../http-requests/lib/payloads';
const employee = new Employee(credentials.validEmployee);
const exchangerate = new Exchangerate({ pair: 'BTC/USD' });
const exchangerateUpdate = new Exchangerate({ pair: 'BTC/USD' });
let userToken = {};
let i18nKey;
let loginPostBody;
let exchnageratePostBody;
let exchangeratesId;
chai.config.includeStack = true;
describe('## Check user login', () => {
  it('User login :: should get valid Bearer token', (done) => {
    loginPostBody = payload.getPostLogin(employee);
    request(app)
      .post('/api/auth/login')
      .send(loginPostBody)
      .expect(httpStatus.OK)
      .then((res) => {
        // check access token
        expect(res.body).to.have.property('accessToken');
        expect(res.body).to.have.property('refreshToken');
        userToken[loginPostBody.email] = 'bearer ' + res.body.accessToken;
        done();
      })
      .catch(done);
  });
  describe('# POST /api/exchnagerate', () => {
    it('should create a new exchnagerate', (done) => {
      exchnageratePostBody = payload.getPostBody(exchangerate);
      request(app)
        .post('/api/exchangerates')
        .send(exchnageratePostBody)
        .set({ Authorization: userToken[loginPostBody.email] })
        .expect(httpStatus.OK)
        .then((res) => {
          i18nKey = "exchangeratesCreate";
          console.log(i18nService.getI18nMessage(i18nKey))
          expect(res.body.respMessage).to.equal(i18nService.getI18nMessage(i18nKey));
          expect(res.body.respCode).to.equal(responseCodes.create);
          exchangeratesId = res.body.exchangeratesId;
          done();
        })
        .catch(done);
    });
  });
  describe('# GET /api/exchangerates/:exchangeratesId', () => {
    it('should get exchangerates details', (done) => {
      request(app)
        .get(`/api/exchangerates/${exchangeratesId}`)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.details.pair).to.equal(exchnageratePostBody.pair);
          expect(res.body.details.buyRate).to.equal(exchnageratePostBody.buyRate);
          expect(res.body.details.sellRate).to.equal(exchnageratePostBody.sellRate);
          expect(res.body.details.maximum).to.equal(exchnageratePostBody.maximum);
          expect(res.body.details.minimum).to.equal(exchnageratePostBody.minimum);
          expect(res.body.details.maxVariationPercentage).to.equal(exchnageratePostBody.maxVariationPercentage);
          expect(res.body.details.minVariationPercentage).to.equal(exchnageratePostBody.minVariationPercentage);
          done();
        })
        .catch(done);
    });

    it('should report error with message - Not found, when exchangerates does not exists', (done) => {
      request(app)
        .get('/api/exchangerates/56c787ccc67fc16ccc1a5e92')
        .expect(httpStatus.NOT_FOUND)
        .then((res) => {
          expect(res.body.message).to.equal('Not Found');
          done();
        })
        .catch(done);
    });
  });

  describe('# PUT /api/exchangerates/:exchangeratesId', () => {
    it('should update exchangerates details', (done) => {
      exchnageratePostBody = payload.getPostBody(exchangerateUpdate);
      request(app)
        .put(`/api/exchangerates/${exchangeratesId}`)
        .send(exchnageratePostBody)
        .set({ Authorization: userToken[loginPostBody.email] })
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.respCode).to.equal(responseCodes.update);
          i18nKey = "exchangeratesUpdate";
          expect(res.body.respMessage).to.equal(i18nService.getI18nMessage(i18nKey));
          done();
        })
        .catch(done);
    });
  });

});