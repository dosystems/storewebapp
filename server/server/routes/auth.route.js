
import express from 'express';
import validate from 'express-validation';
import expressJwt from 'express-jwt';
import paramValidation from '../config/param-validation';
import authCtrl from '../controllers/auth.controller';
import config from '../config/config';
import asyncHandler from 'express-async-handler';
const router = express.Router(); // eslint-disable-line new-cap
router.route('/resetPassword')
  /** POST /api/auth/login - Returns token if correct email and password is provided */
  .post(asyncHandler(authCtrl.resetPassword));

router.route('/login')
  /** POST /api/auth/login - Returns token if correct email and password is provided */
  .post(validate(paramValidation.login), asyncHandler(authCtrl.login));

router.route('/logout')
  /** POST /api/auth/logout - Returns logout*/
  .post(asyncHandler(authCtrl.logout));

router.route('/random-number')
  /** GET /api/auth/random-number - Protected route,
   * needs token returned by the above as header. Authorization: Bearer {token} */
  .get(expressJwt({ secret: config.jwtSecret }), authCtrl.getRandomNumber);

export default router;
