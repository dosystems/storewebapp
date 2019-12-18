import express from 'express';
import brandCtrl from '../controllers/brand.controller';
import asyncHandler from 'express-async-handler';
import authPolicy from '../middlewares/authenticate';

const router = express.Router(); // eslint-disable-line new-cap
router.route('/uploadSizeChartImage')
   /** POST /api/brands - uploadSizeChartImage */
  .post(asyncHandler(brandCtrl.uploadSizeChartImage))

router.route('/')
  /** GET /api/brands - Get list of brands */
  .get(asyncHandler(brandCtrl.list))

  /** POST /api/brands - Create new brands */
router.route('/').all(authPolicy.isAllowed)
  .post(asyncHandler(brandCtrl.create));

router.route('/:brandId')
  /** GET /api/brands/:brandId - Get brands */
  .get(asyncHandler(brandCtrl.get))

  /** PUT /api/brands/:brandId - Update brands */
router.route('/:brandId').all(authPolicy.isAllowed)
  .put(asyncHandler(brandCtrl.update))

  /** DELETE /api/brands/:brandId - Delete brands */
  .delete(asyncHandler(brandCtrl.remove));

/** Load brands when API with brandId route parameter is hit */
router.param('brandId', asyncHandler(brandCtrl.load));

export default router;
