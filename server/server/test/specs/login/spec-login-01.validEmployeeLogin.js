import 'babel-polyfill';
import request from 'supertest-as-promised';
import httpStatus from 'http-status';
import chai, { expect } from 'chai';
import { setTimeout } from 'timers';

import app from '../../../index';

// load credentials
import credentials from '../../data/credentials.json';

// initialize models
import Employee from '../../models/employee';

// load payload module
import payload from '../../http-requests/lib/payloads';
const employee = new Employee(credentials.validEmployee);
chai.config.includeStack = true;

describe('## Check employee login', () => {
  it('User login :: should get valid Bearer token', (done) => {
    const loginPostBody = payload.getPostLogin(employee);
    request(app)
      .post('/api/auth/login')
      .send(loginPostBody)
      .expect(httpStatus.OK)
      .then((res) => {
        // check access token
        expect(res.body).to.have.property('accessToken');
        expect(res.body).to.have.property('refreshToken');
        done();
      })
      .catch(done);
  });
});