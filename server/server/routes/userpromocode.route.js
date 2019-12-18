import asyncHandler from 'express-async-handler';
import express from 'express';

import authPolicy from '../middlewares/authenticate';

import userpromocodeCtrl from '../controllers/userpromocode.controller';

const router = express.Router(); // eslint-disable-line new-cap

router.route('/').all(authPolicy.isAllowed)
  /** GET /api/userpromocodes - Get list of userpromocodes */
  .get(asyncHandler(userpromocodeCtrl.list))

  /** POST /api/userpromocodes - Create new userpromocodes */
  .post(asyncHandler(userpromocodeCtrl.create));

router.route('/:userpromocodeId').all(authPolicy.isAllowed)
  /** GET /api/userpromocodes/:promocodeId - Get userpromocodes */
  .get(asyncHandler(userpromocodeCtrl.get))

  /** PUT /api/userpromocodes/:promocodeId - Update userpromocodes */
  .put(asyncHandler(userpromocodeCtrl.update))

  /** DELETE /api/userpromocodes/:promocodeId - Delete userpromocodes */
  .delete(asyncHandler(userpromocodeCtrl.remove));

/** Load userpromocodes when API with promocodeId route parameter is hit */
router.param('userpromocodeId', asyncHandler(userpromocodeCtrl.load));

export default router;
