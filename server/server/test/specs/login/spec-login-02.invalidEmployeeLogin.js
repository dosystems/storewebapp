import 'babel-polyfill';
import request from 'supertest-as-promised';
import httpStatus from 'http-status';
import chai, { expect } from 'chai';
import { setTimeout } from 'timers';

import app from '../../../index';

// load predfined modules
import responseCodes from '../../data/response-codes.json';

// initialize models
import Employee from '../../models/employee';

// load payload module
import payload from '../../http-requests/lib/payloads';
const employee = new Employee();
chai.config.includeStack = true;

describe('## Check employee invalid login', () => {
  it('User login :: should get invalid employee login', (done) => {
    const loginPostBody = payload.getPostLogin(employee);
    request(app)
      .post('/api/auth/login')
      .send(loginPostBody)
      .expect(httpStatus.OK)
      .then((res) => {
        // check access token
        expect(res.body.errorCode).to.equal(responseCodes.error);
        done();
      })
      .catch(done);
  });
});