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
import NewsLetter from '../../models/newsLetter';
// load payload module
import payload from '../../http-requests/lib/payloads';
const authEmployee = new Employee(credentials.validEmployee);
const authSeller = new Seller(credentials.validSeller);

const newsLetter = new NewsLetter({
  name: "Sony",
  subject: "advertisement",
  data:"<p>hehghghgheghhsgsg</p>",
  type:"buyers"
})
const createpostBody = payload.getPostBody(newsLetter);
const updateNewsLetter = new NewsLetter({
  name: "Sony",
  subject: "advertisement",
  data:"<p>hehghghgheghhsgsg</p>"
})
const updateBody = payload.getPostBody(updateNewsLetter);
// inject promise to mocha
chai.config.includeStack = true;
chai.use(chaiAsPromised);
let newsLetterId;
describe('## Check newsLetter creation', () => {

  beforeEach(mochaAsync(async () => {
    // login employee and get access token
    await auth.getAccessToken(authEmployee);
  }));

  it('## Check newsLetter creation', (done) => { //mochaAsync(async () => {
    request(app).post('/api/newsLetters').send(createpostBody)
      .set({ Authorization: `Bearer ${authEmployee.getAccessToken()}` })
      .expect(httpStatus.OK)
      .then((res) => {
        expect(res.body.respCode).to.equal(responseCodes.create);
        expect(res.body.respMessage).to.equal('Newsletter created successfully');
        expect(res.body).to.have.property('newsLetterId')
        newsLetterId = res.body.newsLetterId;
        done()
      })
      // 
      .catch(done)
    // error
  });
  it('## Check newsLetter update', (done) => { //mochaAsync(async () => {
    request(app).put('/api/newsLetters/'+newsLetterId).send(updateBody)
      .set({ Authorization: `Bearer ${authEmployee.getAccessToken()}` })
      .expect(httpStatus.OK)
      .then((res) => {
        expect(res.body.respCode).to.equal(responseCodes.update);
        expect(res.body.respMessage).to.equal('Newsletter updated successfully');
        done()
      })
      // 
      .catch(done)
    // error
  });

  it('## get newsLetter Details by Id', (done) => { //mochaAsync(async () => {
    request(app).get('/api/newsLetters/'+newsLetterId)
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
  it('## get newsLetters Details ', (done) => { //mochaAsync(async () => {
    request(app).get('/api/newsLetters')
      .set({ Authorization: `Bearer ${authEmployee.getAccessToken()}` })
      .expect(httpStatus.OK)
      .then((res) => {
        expect(res.body.respCode).to.equal(responseCodes.success);
        expect(res.body).to.have.property('newsLetters');
        done()
      })
      // 
      .catch(done)
    // error
  });

  it('## DELETE newsLetter Details ', (done) => { //mochaAsync(async () => {
    request(app).delete('/api/newsLetters/'+newsLetterId)
      .set({ Authorization: `Bearer ${authEmployee.getAccessToken()}` })
      .expect(httpStatus.OK)
      .then((res) => {
        expect(res.body.respCode).to.equal(responseCodes.delete);
        expect(res.body.respMessage).to.equal('Newsletter deleted successfully');
        done()
      })
      // 
      .catch(done)
    // error
  });
});