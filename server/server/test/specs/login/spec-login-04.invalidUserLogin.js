import 'babel-polyfill';
import request from 'supertest-as-promised';
import httpStatus from 'http-status';
import chai, { expect } from 'chai';
import { setTimeout } from 'timers';

import app from '../../../index';

// load predfined modules
import responseCodes from '../../data/response-codes.json';

// initialize models
import User from '../../models/user';

// load payload module
import payload from '../../http-requests/lib/payloads';
const user = new User();
chai.config.includeStack = true;

describe('## Check user invalid login', () => {
  it('User login :: should get invalid user login', (done) => {
    const loginPostBody = payload.getPostLogin(user);
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