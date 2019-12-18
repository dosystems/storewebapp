import express from 'express';
import paymentCtrl from '../controllers/payment.controller';
import asyncHandler from 'express-async-handler';
import authPolicy from '../middlewares/authenticate';

const router = express.Router(); // eslint-disable-line new-cap

router.route('/').all(authPolicy.isAllowed)
  /** GET /api/payments - Get list of payment */
  .get(asyncHandler(paymentCtrl.list))

  /** POST /api/payments - Create new payment */
  .post(asyncHandler(paymentCtrl.create));

router.route('/:paymentId').all(authPolicy.isAllowed)
  /** GET /api/payments/:paymentId - Get payment */
  .get(asyncHandler(paymentCtrl.get))

  /** PUT /api/payments/:paymentId - Update payment */
  .put(asyncHandler(paymentCtrl.update))

  /** DELETE /api/payments/:paymentId - Delete payment */
  .delete(asyncHandler(paymentCtrl.remove));

/** Load payments when API with paymentId route parameter is hit */
router.param('paymentId', asyncHandler(paymentCtrl.load));

export default router;