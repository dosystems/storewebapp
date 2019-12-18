import express from 'express';
import subscriptionCtrl from '../controllers/subscription.controller';
import asyncHandler from 'express-async-handler';
import authPolicy from '../middlewares/authenticate';

const router = express.Router(); // eslint-disable-line new-cap
router.route('/sendSubscriptionExpireMail')
  /** GET /api/subscriptions - Get list of subscription */
  .get(asyncHandler(subscriptionCtrl.sendSubscriptionExpireMail))

router.route('/').all(authPolicy.isAllowed)
  /** GET /api/subscriptions - Get list of subscription */
  .get(asyncHandler(subscriptionCtrl.list))

  /** POST /api/subscriptions - Create new subscription */
  .post(asyncHandler(subscriptionCtrl.create));

router.route('/:subscriptionId').all(authPolicy.isAllowed)
  /** GET /api/subscriptions/:subscriptionId - Get subscription */
  .get(asyncHandler(subscriptionCtrl.get))

  /** PUT /api/subscriptions/:subscriptionId - Update subscription */
  .put(asyncHandler(subscriptionCtrl.update))

  /** DELETE /api/subscriptions/:subscriptionId - Delete subscription */
  .delete(asyncHandler(subscriptionCtrl.remove));

/** Load subscriptions when API with subscriptionId route parameter is hit */
router.param('subscriptionId', asyncHandler(subscriptionCtrl.load));

export default router;