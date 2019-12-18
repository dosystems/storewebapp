import express from 'express';
import categoryRequestCtrl from '../controllers/categoryRequest.controller';
import asyncHandler from 'express-async-handler';
import authPolicy from '../middlewares/authenticate';

const router = express.Router(); // eslint-disable-line new-cap

router.route('/')
  /** GET /api/categoryRequests - Get list of categoryRequest */
  .get(asyncHandler(categoryRequestCtrl.list))

router.route('/').all(authPolicy.isAllowed)
  /** POST /api/categoryRequests - Create new categoryRequest */
  .post(asyncHandler(categoryRequestCtrl.create));

router.route('/:categoryRequestId')
  /** GET /api/categoryRequests/:categoryRequestId - Get categoryRequest */
  .get(asyncHandler(categoryRequestCtrl.get))

router.route('/:categoryRequestId').all(authPolicy.isAllowed)

  /** PUT /api/categoryRequests/:categoryRequestId - Update categoryRequest */
  .put(asyncHandler(categoryRequestCtrl.update))

  /** DELETE /api/categoryRequests/:categoryRequestId - Delete categoryRequest */
  .delete(asyncHandler(categoryRequestCtrl.remove));

/** Load categoryRequests when API with categoryRequestId route parameter is hit */
router.param('categoryRequestId', asyncHandler(categoryRequestCtrl.load));

export default router;