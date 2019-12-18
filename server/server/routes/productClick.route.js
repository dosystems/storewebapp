import express from 'express';
import productClickCtrl from '../controllers/productClick.controller';
import asyncHandler from 'express-async-handler';
import authPolicy from '../middlewares/authenticate';

const router = express.Router(); // eslint-disable-line new-cap

router.route('/recentlyViewed')
  .get(asyncHandler(productClickCtrl.getUniqueProductClicks))
router.route('/')
  /** GET /api/productClick - Get list of productClick */
  .get(asyncHandler(productClickCtrl.list))

  /** POST /api/productClick - Create new productClick */
  .post(asyncHandler(productClickCtrl.create));

router.route('/:productClickId')
  /** GET /api/productClick/:productClickId - Get productClick */
  .get(asyncHandler(productClickCtrl.get))

  /** PUT /api/productClick/:productClickId - Update productClick */
  .put(asyncHandler(productClickCtrl.update))

  /** DELETE /api/productClick/:productClickId - Delete productClick */
  .delete(asyncHandler(productClickCtrl.remove));

/** Load productClick when API with productClickId route parameter is hit */
router.param('productClickId', asyncHandler(productClickCtrl.load));

export default router;
