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
import Attribute from '../../models/attribute';
// load payload module
import payload from '../../http-requests/lib/payloads';
const authEmployee = new Employee(credentials.validEmployee);
const authSeller = new Seller(credentials.validSeller);

const attribute = new Attribute({
  name: "Colour",
})
const createpostBody = payload.getPostBody(attribute);
const updateAttribute = new Attribute({
  name: "Color",
})
const updateBody = payload.getPostBody(updateAttribute);
// inject promise to mocha
chai.config.includeStack = true;
chai.use(chaiAsPromised);
let attributeId;
describe('## Check attribute creation', () => {

  beforeEach(mochaAsync(async () => {
    // login employee and get access token
    await auth.getAccessToken(authEmployee);
  }));

  it('## Check attribute creation', (done) => { //mochaAsync(async () => {
    request(app).post('/api/attributes').send(createpostBody)
      .set({ Authorization: `Bearer ${authEmployee.getAccessToken()}` })
      .expect(httpStatus.OK)
      .then((res) => {
        expect(res.body.respCode).to.equal(responseCodes.create);
        expect(res.body.respMessage).to.equal('Attribute created successfully');
        expect(res.body).to.have.property('attributeId')
        attributeId = res.body.attributeId;
        done()
      })
      // 
      .catch(done)
    // error
  });
  it('## Check attribute update', (done) => { //mochaAsync(async () => {
    request(app).put('/api/attributes/'+attributeId).send(updateBody)
      .set({ Authorization: `Bearer ${authEmployee.getAccessToken()}` })
      .expect(httpStatus.OK)
      .then((res) => {
        expect(res.body.respCode).to.equal(responseCodes.update);
        expect(res.body.respMessage).to.equal('Attribute updated successfully');
        done()
      })
      // 
      .catch(done)
    // error
  });

  it('## get attribute Details by Id', (done) => { //mochaAsync(async () => {
    request(app).get('/api/attributes/'+attributeId)
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
  it('## get attributes Details ', (done) => { //mochaAsync(async () => {
    request(app).get('/api/attributes')
      .set({ Authorization: `Bearer ${authEmployee.getAccessToken()}` })
      .expect(httpStatus.OK)
      .then((res) => {
        expect(res.body.respCode).to.equal(responseCodes.success);
        expect(res.body).to.have.property('attributes');
        done()
      })
      // 
      .catch(done)
    // error
  });

  it('## DELETE attribute Details ', (done) => { //mochaAsync(async () => {
    request(app).delete('/api/attributes/'+attributeId)
      .set({ Authorization: `Bearer ${authEmployee.getAccessToken()}` })
      .expect(httpStatus.OK)
      .then((res) => {
        expect(res.body.respCode).to.equal(responseCodes.delete);
        expect(res.body.respMessage).to.equal('Attribute deleted successfully');
        done()
      })
      // 
      .catch(done)
    // error
  });
});