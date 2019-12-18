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

// load payload module
import payload from '../../http-requests/lib/payloads';
const authEmployee = new Employee(credentials.validEmployee);
const employee = new Employee();
const createpostBody = payload.getPostBody(employee);

// inject promise to mocha
chai.config.includeStack = true;
chai.use(chaiAsPromised);

describe('## Check employee creation', () => {
  
  beforeEach(mochaAsync(async () => {
    // login employee and get access token
    await auth.getAccessToken(authEmployee);
  }));

  it('## Check employee creation', mochaAsync(async () => {
    try {
      let createEmpResponse  = await request(app).post('/api/employees').send(createpostBody)
      .set({ Authorization: `Bearer ${authEmployee.getAccessToken()}` });
      expect(createEmpResponse.body).to.have.property('employeeId');
      expect(createEmpResponse.body.respCode).to.equal(responseCodes.create);
    } catch(err) {
      // error
    }
  }));

  it('## Check employee creation :: Email already exists when create same employee', mochaAsync(async () => {
    try {
      let createEmpResponse  = await request(app).post('/api/employees').send(createpostBody)
                      .set({ Authorization: `Bearer ${authEmployee.getAccessToken()}` });
      expect(createEmpResponse.body).to.have.property('errorMessage');
      expect(createEmpResponse.body.errorCode).to.equal(responseCodes.error);
    } catch(err) {
      // error
    }
  }));
});