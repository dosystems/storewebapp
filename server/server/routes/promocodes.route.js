import asyncHandler from 'express-async-handler';
import express from 'express';

import authPolicy from '../middlewares/authenticate';
import promocodeCtrl from '../controllers/promocode.controller';

const router = express.Router(); // eslint-disable-line new-cap

router.route('/checkPromoCodeIsValidOrNot').all(authPolicy.isAllowed)
  /** POST /api/promocodes/checkPromoCodeIsValidOrNot - Check promo code */
  .get(asyncHandler(promocodeCtrl.checkPromoCodeIsValidOrNot));

router.route('/').all(authPolicy.isAllowed)
  /** GET /api/promocodes - Get list of promocodes */
  .get(asyncHandler(promocodeCtrl.list))

  /** POST /api/promocodes - Create new promocodes */
  .post(asyncHandler(promocodeCtrl.create));

router.route('/:promocodeId').all(authPolicy.isAllowed)
  /** GET /api/promocodes/:promocodeId - Get promocodes */
  .get(asyncHandler(promocodeCtrl.get))

  /** PUT /api/promocodes/:promocodeId - Update promocodes */
  .put(asyncHandler(promocodeCtrl.update))

  /** DELETE /api/promocodes/:promocodeId - Delete promocodes */
  .delete(asyncHandler(promocodeCtrl.remove));

/** Load promocodes when API with promocodeId route parameter is hit */
router.param('promocodeId', asyncHandler(promocodeCtrl.load));

export default router;
