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
import Entity from '../../models/entities';
// load payload module
import payload from '../../http-requests/lib/payloads';
const authEmployee = new Employee(credentials.validEmployee);
const authSeller = new Seller(credentials.validSeller);

const entity = new Entity({
  name: "huhudhsuhdu",
  longDesc: "jjjoksoijoij",
  visibleDate: new Date("2018-09-11"),
  expiryDate: new Date("2018-09-25"),
  inventories: [
    {
      Color: "Blue",
      Price: 2000,
      MRP: 2500,
      Weight: 5,
      Quantity: 5
    }
  ],
  categories: "Products-Dress"
})
const createpostBody = payload.getPostBody(entity);
// inject promise to mocha
chai.config.includeStack = true;
chai.use(chaiAsPromised);
let entityId;
describe('## Check entity creation', () => {

  beforeEach(mochaAsync(async () => {
    // login employee and get access token
    await auth.getAccessToken(authSeller);
  }));

  it('## Check entity creation', (done) => { //mochaAsync(async () => {
    request(app).post('/api/entities').send(createpostBody)
      .set({ Authorization: `Bearer ${authSeller.getAccessToken()}` })
      .expect(httpStatus.OK)
      .then((res) => {
        expect(res.body.respCode).to.equal(responseCodes.create);
        expect(res.body.respMessage).to.equal('Product created successfully');
        expect(res.body).to.have.property('entityId')
        entityId = res.body.entityId;
        done()
      })
      // 
      .catch(done)
    // error
  });

  it('## Check entity update', (done) => { //mochaAsync(async () => {
    request(app).put('/api/entities/'+entityId).send(createpostBody)
      .set({ Authorization: `Bearer ${authSeller.getAccessToken()}` })
      .expect(httpStatus.OK)
      .then((res) => {
        expect(res.body.respCode).to.equal(responseCodes.update);
        expect(res.body.respMessage).to.equal('Product updated successfully');
        done()
      })
      // 
      .catch(done)
    // error
  });

  it('## get entity details', (done) => { //mochaAsync(async () => {
    request(app).get('/api/entities/'+entityId)
      .set({ Authorization: `Bearer ${authSeller.getAccessToken()}` })
      .expect(httpStatus.OK)
      .then((res) => {
        expect(res.body.respCode).to.equal(responseCodes.success);
        expect(res.body).to.have.property('details');
        expect(res.body.details).to.have.property('entityId');
        expect(res.body.details).to.have.property('ownerName');
        expect(res.body.details).to.have.property('ownerId');
        expect(res.body.details).to.have.property('totalAvailable');
        expect(res.body.details.visibleDate).to.equal(createpostBody.visibleDate.toISOString());
        expect(res.body.details.expiryDate).to.equal(createpostBody.expiryDate.toISOString());
        expect(res.body.details).to.have.property('multipleCategories');
        expect(res.body.details).to.have.property('inventories');
        expect(res.body.details.name).to.equal(createpostBody.name);
        done()
      })
      // 
      .catch(done)
    // error
  });

  it('## get entities details', (done) => { //mochaAsync(async () => {
    request(app).get('/api/entities?filter={"page":1,"limit":20,"sortfield":"created","direction":"desc","criteria":[]}')
      .set({ Authorization: `Bearer ${authSeller.getAccessToken()}`})
      .expect(httpStatus.OK)
      .then((res) => {
        expect(res.body.respCode).to.equal(responseCodes.success);
        expect(res.body).to.have.property('entities')
        done()
      })
      // 
      .catch(done)
    // error
  });

  it('## delete entity details', (done) => { //mochaAsync(async () => {
    request(app).delete('/api/entities/'+entityId)
      .set({ Authorization: `Bearer ${authSeller.getAccessToken()}` })
      .expect(httpStatus.OK)
      .then((res) => {
        expect(res.body.respCode).to.equal(responseCodes.delete);
        expect(res.body.respMessage).to.equal('Product deleted successfully');
        done()
      })
      // 
      .catch(done)
    // error
  });
});