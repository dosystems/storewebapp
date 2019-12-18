import express from 'express';
import dealCtrl from '../controllers/deal.controller';
import asyncHandler from 'express-async-handler';
import authPolicy from '../middlewares/authenticate';

const router = express.Router(); // eslint-disable-line new-cap

router.route('/')
  /** GET /api/deals - Get list of deal */
  .get(asyncHandler(dealCtrl.list))

router.route('/').all(authPolicy.isAllowed)
  /** POST /api/deals - Create new deal */
  .post(asyncHandler(dealCtrl.create));

router.route('/:dealId')
  /** GET /api/deals/:dealId - Get deal */
  .get(asyncHandler(dealCtrl.get))

router.route('/:dealId').all(authPolicy.isAllowed)

  /** PUT /api/deals/:dealId - Update deal */
  .put(asyncHandler(dealCtrl.update))

  /** DELETE /api/deals/:dealId - Delete deal */
  .delete(asyncHandler(dealCtrl.remove));

/** Load deals when API with dealId route parameter is hit */
router.param('dealId', asyncHandler(dealCtrl.load));

export default router;