import express from 'express';
import dashboardCtrl from '../controllers/dashboard.controller';
import sellerCtrl from '../controllers/seller.controller';
import asyncHandler from 'express-async-handler';
import authPolicy from '../middlewares/authenticate';

const router = express.Router(); // eslint-disable-line new-cap
router.route('/salesSummary').all(authPolicy.isAllowed)
  /** GET /api/sellers/salesSummary - Get list of getSalesSummary */
  .get(asyncHandler(sellerCtrl.getSalesSummary))

router.route('/shipmentRates').all(authPolicy.isAllowed)
  .post(asyncHandler(sellerCtrl.getshipmentRates))

router.route('/reviews').all(authPolicy.isAllowed)
  /** GET /api/sellers/reviews - Get list of reports */
  .get(asyncHandler(sellerCtrl.getReviews));
router.route('/reports').all(authPolicy.isAllowed)
  /** GET /api/sellers/reports - Get list of reports */
  .get(asyncHandler(sellerCtrl.getReports))

router.route('/dashBoard').all(authPolicy.isAllowed)
  /** GET /api/sellers/dashboard - Get list of dashboard */
  .get(asyncHandler(dashboardCtrl.getVendorDashBoard))

router.route('/getBuyersList').all(authPolicy.isAllowed)
  .get(asyncHandler(sellerCtrl.getBuyersList));

router.route('/signUp')
  .post(asyncHandler(sellerCtrl.create));

router.route('/changePassword').all(authPolicy.isAllowed)
  /** POST /api/sellers/changePassword - change password */
  .post(asyncHandler(sellerCtrl.changePassword));

router.route('/forgotPassword')
  /** POST /api/sellers/forgotPassword - forgot password */
  .post(asyncHandler(sellerCtrl.forgotPassword));

router.route('/changeRecoverPassword')
  /** POST /api/sellers/changeRecoverPassword - change recover password */
  .post(asyncHandler(sellerCtrl.changeRecoverPassword));

//update seller from email
router.route('/activate/:sellerId')
  /** PUT /api/sellers/:sellerId - Update seller */
  .put(asyncHandler(sellerCtrl.activate))

router.route('/').all(authPolicy.isAllowed)
  /** GET /api/sellers - Get list of sellers */
  .get(asyncHandler(sellerCtrl.list))

  /** POST /api/sellers - Create new seller */
  .post(asyncHandler(sellerCtrl.create));

router.route('/uploadAttachments/')

  /** post /api/sellers/uploadDetails/ - upload the profile picture, logo, kyc docs of seller */
  .post(asyncHandler(sellerCtrl.uploadAttachments))

router.route('/:sellerId')
  /** GET /api/sellers/:sellerId - Get seller */
  .get(asyncHandler(sellerCtrl.get));

router.route('/:sellerId').all(authPolicy.isAllowed)
  /** PUT /api/sellers/:sellerId - Update seller */
  .put(asyncHandler(sellerCtrl.update))

  /** DELETE /api/sellers/:sellerId - Delete seller */
  .delete(asyncHandler(sellerCtrl.remove));

/** Load seller when API with sellerId route parameter is hit */
router.param('sellerId', asyncHandler(sellerCtrl.load));

export default router;