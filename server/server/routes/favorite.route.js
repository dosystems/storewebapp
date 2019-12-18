import express from 'express';
import favoriteCtrl from '../controllers/favorite.controller';
import asyncHandler from 'express-async-handler';
import authPolicy from '../middlewares/authenticate';

const router = express.Router(); // eslint-disable-line new-cap

router.route('/').all(authPolicy.isAllowed)
  /** GET /api/favorites - Get list of favorite */
  .get(asyncHandler(favoriteCtrl.list))

  /** POST /api/favorites - Create new favorite */
  .post(asyncHandler(favoriteCtrl.create));

router.route('/:favoriteId').all(authPolicy.isAllowed)
  /** GET /api/favorites/:favoriteId - Get favorite */
  .get(asyncHandler(favoriteCtrl.get))

  /** PUT /api/favorites/:favoriteId - Update favorite */
  .put(asyncHandler(favoriteCtrl.update))

  /** DELETE /api/favorites/:favoriteId - Delete favorite */
  .delete(asyncHandler(favoriteCtrl.remove));

/** Load favorites when API with favoriteId route parameter is hit */
router.param('favoriteId', asyncHandler(favoriteCtrl.load));

export default router;