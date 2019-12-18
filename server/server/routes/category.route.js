import asyncHandler from 'express-async-handler';
import express from 'express';

import categoryCtrl from '../controllers/category.controller';

import authPolicy from '../middlewares/authenticate';

const router = express.Router(); // eslint-disable-line new-cap


router.route('/multipleCategories')
  .post(asyncHandler(categoryCtrl.createMultipleCategories));

router.route('/')
  /** GET /api/categorys - Get list of categorys */
  .get(asyncHandler(categoryCtrl.list))

router.route('/').all(authPolicy.isAllowed)

  /** POST /api/categorys - Create new categorys */
  .post(asyncHandler(categoryCtrl.create));

router.route('/:categoryId')
  /** GET /api/categorys/:categoryId - Get categorys */
  .get(asyncHandler(categoryCtrl.get))

router.route('/:categoryId').all(authPolicy.isAllowed)

  /** PUT /api/categorys/:categoryId - Update categorys */
  .put(asyncHandler(categoryCtrl.update))

  /** DELETE /api/categorys/:categoryId - Delete categorys */
  .delete(asyncHandler(categoryCtrl.remove));

/** Load categorys when API with categoryId route parameter is hit */
router.param('categoryId', asyncHandler(categoryCtrl.load));

export default router;
