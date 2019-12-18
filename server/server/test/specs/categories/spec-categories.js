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
import Category from '../../models/category';
// load payload module
import payload from '../../http-requests/lib/payloads';
const authEmployee = new Employee(credentials.validEmployee);
const authSeller = new Seller(credentials.validSeller);

const category = new Category({
  name: ["Automobiles"],
})
const createpostBody = payload.getPostBody(category);
const updateCategory = new Category({
  name: ["Mobiles"],
})
const updateBody = payload.getPostBody(updateCategory);

const multipleCategories = new Category({
  categories: ["Mobiles","Smartphones"],
})
const multiPostBody = payload.getPostBody(multipleCategories);
// inject promise to mocha
chai.config.includeStack = true;
chai.use(chaiAsPromised);
let categoryId;
describe('## Check entity creation', () => {

  beforeEach(mochaAsync(async () => {
    // login employee and get access token
    await auth.getAccessToken(authEmployee);
  }));

  it('## Check category creation', (done) => { //mochaAsync(async () => {
    request(app).post('/api/categories').send(createpostBody)
      .set({ Authorization: `Bearer ${authEmployee.getAccessToken()}` })
      .expect(httpStatus.OK)
      .then((res) => {
        expect(res.body.respCode).to.equal(responseCodes.create);
        expect(res.body.respMessage).to.equal('Category created successfully');
        expect(res.body).to.have.property('categoryId')
        categoryId = res.body.categoryId;
        done()
      })
      // 
      .catch(done)
    // error
  });
  it('## Check category update', (done) => { //mochaAsync(async () => {
    request(app).put('/api/categories/'+categoryId).send(updateBody)
      .set({ Authorization: `Bearer ${authEmployee.getAccessToken()}` })
      .expect(httpStatus.OK)
      .then((res) => {
        expect(res.body.respCode).to.equal(responseCodes.update);
        expect(res.body.respMessage).to.equal('Category updated successfully');
        done()
      })
      // 
      .catch(done)
    // error
  });

  it('## get category Details by Id', (done) => { //mochaAsync(async () => {
    request(app).get('/api/categories/'+categoryId)
      .set({ Authorization: `Bearer ${authEmployee.getAccessToken()}` })
      .expect(httpStatus.OK)
      .then((res) => {
        expect(res.body.respCode).to.equal(responseCodes.success);
        expect(res.body).to.have.property('details');
        expect(res.body.details).to.have.property('tree');
        expect(res.body.details).to.have.property('name');
        done()
      })
      // 
      .catch(done)
    // error
  });
  it('## get categories Details ', (done) => { //mochaAsync(async () => {
    request(app).get('/api/categories')
      .set({ Authorization: `Bearer ${authEmployee.getAccessToken()}` })
      .expect(httpStatus.OK)
      .then((res) => {
        expect(res.body.respCode).to.equal(responseCodes.success);
        expect(res.body).to.have.property('categories');
        done()
      })
      // 
      .catch(done)
    // error
  });

  it('## DELETE category Details ', (done) => { //mochaAsync(async () => {
    request(app).delete('/api/categories/'+categoryId)
      .set({ Authorization: `Bearer ${authEmployee.getAccessToken()}` })
      .expect(httpStatus.OK)
      .then((res) => {
        expect(res.body.respCode).to.equal(responseCodes.delete);
        expect(res.body.respMessage).to.equal('Category deleted successfully');
        done()
      })
      // 
      .catch(done)
    // error
  });

  it('## create multiple categories Details ', (done) => { //mochaAsync(async () => {
    request(app).post('/api/categories/multipleCategories').send(multiPostBody)
      .set({ Authorization: `Bearer ${authEmployee.getAccessToken()}` })
      .expect(httpStatus.OK)
      .then((res) => {
        expect(res.body.respCode).to.equal(responseCodes.create);
        expect(res.body.respMessage).to.equal('Categories created succesfully');
        done()
      })
      // 
      .catch(done)
    // error
  });
});