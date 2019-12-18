import 'babel-polyfill';
import request from 'supertest-as-promised';
import httpStatus from 'http-status';
import chai, { expect } from 'chai';
import { setTimeout } from 'timers';

import app from '../../../index';

// load predfined modules
import credentials from '../../data/credentials.json';

// initialize models
import User from '../../models/user';

// load payload module
import payload from '../../http-requests/lib/payloads';
const user = new User(credentials.validUser);
chai.config.includeStack = true;

describe('## Check user login', () => {
  it('User login :: should get valid Bearer token', (done) => {
    const loginPostBody = payload.getPostLogin(user);
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