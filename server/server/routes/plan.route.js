import express from 'express';
import planCtrl from '../controllers/plan.controller';
import asyncHandler from 'express-async-handler';
import authPolicy from '../middlewares/authenticate';

const router = express.Router(); // eslint-disable-line new-cap

router.route('/').all(authPolicy.isAllowed)
  /** GET /api/plans - Get list of plan */
  .get(asyncHandler(planCtrl.list))

  /** POST /api/plans - Create new plan */
  .post(asyncHandler(planCtrl.create));

router.route('/:planId').all(authPolicy.isAllowed)
  /** GET /api/plans/:planId - Get plan */
  .get(asyncHandler(planCtrl.get))

  /** PUT /api/plans/:planId - Update plan */
  .put(asyncHandler(planCtrl.update))

  /** DELETE /api/plans/:planId - Delete plan */
  .delete(asyncHandler(planCtrl.remove));

/** Load plans when API with planId route parameter is hit */
router.param('planId', asyncHandler(planCtrl.load));

export default router;