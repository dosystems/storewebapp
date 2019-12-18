import express from 'express';
import buyerCtrl from '../controllers/buyer.controller';
import asyncHandler from 'express-async-handler';
import authPolicy from '../middlewares/authenticate';

const router = express.Router(); // eslint-disable-line new-cap

router.route('/signUp')
  .post(asyncHandler(buyerCtrl.create));

router.route('/changePassword').all(authPolicy.isAllowed)
  /** POST /api/buyers/changePassword - change password */
  .post(asyncHandler(buyerCtrl.changePassword));

router.route('/forgotPassword')
  /** POST /api/buyers/forgotPassword - forgot password */
  .post(asyncHandler(buyerCtrl.forgotPassword));

router.route('/changeRecoverPassword')
  /** POST /api/buyers/changeRecoverPassword - change recover password */
  .post(asyncHandler(buyerCtrl.changeRecoverPassword));

router.route('/')
  /** GET /api/buyers - Get list of buyers */
  .get(asyncHandler(buyerCtrl.list))

  /** POST /api/buyers - Create new buyer */
  .post(asyncHandler(buyerCtrl.create));

router.route('/uploadProfilePicture/:buyerId').all(authPolicy.isAllowed)

  /** post /api/buyers/uploadprofilePicture/:buyerId - upload the profile picture of buyer */
  .post(asyncHandler(buyerCtrl.changeProfilePicture))

router.route('/:buyerId')
  /** GET /api/buyers/:buyerId - Get buyer */
  .get(asyncHandler(buyerCtrl.get))

  /** PUT /api/buyers/:buyerId - Update buyer */
  .put(asyncHandler(buyerCtrl.update))

  /** DELETE /api/buyers/:buyerId - Delete buyer */
  .delete(asyncHandler(buyerCtrl.remove));

/** Load buyer when API with buyerId route parameter is hit */
router.param('buyerId', asyncHandler(buyerCtrl.load));

export default router;