import express from 'express';
import colorCtrl from '../controllers/color.controller';
import asyncHandler from 'express-async-handler';
import authPolicy from '../middlewares/authenticate';

const router = express.Router(); // eslint-disable-line new-cap
router.route('/uploadSizeChartImage')
   /** POST /api/colors - uploadSizeChartImage */
  .post(asyncHandler(colorCtrl.uploadSizeChartImage))

router.route('/')
  /** GET /api/colors - Get list of colors */
  .get(asyncHandler(colorCtrl.list))

  /** POST /api/colors - Create new colors */
router.route('/').all(authPolicy.isAllowed)
  .post(asyncHandler(colorCtrl.create));

router.route('/:colorId')
  /** GET /api/colors/:colorId - Get colors */
  .get(asyncHandler(colorCtrl.get))

  /** PUT /api/colors/:colorId - Update colors */
router.route('/:colorId').all(authPolicy.isAllowed)
  .put(asyncHandler(colorCtrl.update))

  /** DELETE /api/colors/:colorId - Delete colors */
  .delete(asyncHandler(colorCtrl.remove));

/** Load colors when API with colorId route parameter is hit */
router.param('colorId', asyncHandler(colorCtrl.load));

export default router;
