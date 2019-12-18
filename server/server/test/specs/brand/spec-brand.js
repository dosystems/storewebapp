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
import Employee from '../../models/employee';
import Seller from '../../models/seller';
import Brand from '../../models/brand';
// load payload module
import payload from '../../http-requests/lib/payloads';
const authEmployee = new Employee(credentials.validEmployee);
const authSeller = new Seller(credentials.validSeller);

const brand = new Brand({
  name: "Sony",
})
const createpostBody = payload.getPostBody(brand);
const updateBrand = new Brand({
  name: "Nokia",
})
const updateBody = payload.getPostBody(updateBrand);
// inject promise to mocha
chai.config.includeStack = true;
chai.use(chaiAsPromised);
let brandId;
describe('## Check brand creation', () => {

  beforeEach(mochaAsync(async () => {
    // login employee and get access token
    await auth.getAccessToken(authEmployee);
  }));

  it('## Check brand creation', (done) => { //mochaAsync(async () => {
    request(app).post('/api/brands').send(createpostBody)
      .set({ Authorization: `Bearer ${authEmployee.getAccessToken()}` })
      .expect(httpStatus.OK)
      .then((res) => {
        expect(res.body.respCode).to.equal(responseCodes.create);
        expect(res.body.respMessage).to.equal('Brand created successfully');
        expect(res.body).to.have.property('brandId')
        brandId = res.body.brandId;
        done()
      })
      // 
      .catch(done)
    // error
  });
  it('## Check brand update', (done) => { //mochaAsync(async () => {
    request(app).put('/api/brands/'+brandId).send(updateBody)
      .set({ Authorization: `Bearer ${authEmployee.getAccessToken()}` })
      .expect(httpStatus.OK)
      .then((res) => {
        expect(res.body.respCode).to.equal(responseCodes.update);
        expect(res.body.respMessage).to.equal('Brand updated successfully');
        done()
      })
      // 
      .catch(done)
    // error
  });

  it('## get brand Details by Id', (done) => { //mochaAsync(async () => {
    request(app).get('/api/brands/'+brandId)
      .set({ Authorization: `Bearer ${authEmployee.getAccessToken()}` })
      .expect(httpStatus.OK)
      .then((res) => {
        expect(res.body.respCode).to.equal(responseCodes.success);
        expect(res.body).to.have.property('details');
        expect(res.body.details).to.have.property('name');
        expect(res.body.details.name).to.equal(updateBody.name);
        done()
      })
      // 
      .catch(done)
    // error
  });
  it('## get brands Details ', (done) => { //mochaAsync(async () => {
    request(app).get('/api/brands')
      .set({ Authorization: `Bearer ${authEmployee.getAccessToken()}` })
      .expect(httpStatus.OK)
      .then((res) => {
        expect(res.body.respCode).to.equal(responseCodes.success);
        expect(res.body).to.have.property('brands');
        done()
      })
      // 
      .catch(done)
    // error
  });

  it('## DELETE brand Details ', (done) => { //mochaAsync(async () => {
    request(app).delete('/api/brands/'+brandId)
      .set({ Authorization: `Bearer ${authEmployee.getAccessToken()}` })
      .expect(httpStatus.OK)
      .then((res) => {
        expect(res.body.respCode).to.equal(responseCodes.delete);
        expect(res.body.respMessage).to.equal('Brand deleted successfully');
        done()
      })
      // 
      .catch(done)
    // error
  });
});