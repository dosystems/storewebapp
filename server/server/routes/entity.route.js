import express from 'express';
import entityCtrl from '../controllers/entity.controller';
import asyncHandler from 'express-async-handler';
import authPolicy from '../middlewares/authenticate';

const router = express.Router(); // eslint-disable-line new-cap

router.route('/getNeverPurchasedProductsList').all(authPolicy.isAllowed)

  .get(asyncHandler(entityCtrl.getNeverPurchasedProductsList))

router.route('/getLowStockList').all(authPolicy.isAllowed)

  .get(asyncHandler(entityCtrl.getLowStockList))
router.route('/uploadEntityImages').all(authPolicy.isAllowed)

  .post(asyncHandler(entityCtrl.uploadEntityImages))

router.route('/downloadCrafsProducts').all(authPolicy.isAllowed)

  .get(asyncHandler(entityCtrl.downloadAndUploadImg))

router.route('/popularProducts')
  .get(asyncHandler(entityCtrl.getPopularProducts))

router.route('/')
  /** GET /api/entities - Get list of entities */
  .get(asyncHandler(entityCtrl.list))

router.route('/').all(authPolicy.isAllowed)
  /** POST /api/entities - Create new entities */
  .post(asyncHandler(entityCtrl.create));

router.route('/:entityId')

  /** GET /api/entities/:entityId - Get entities */
  .get(asyncHandler(entityCtrl.get))

router.route('/:entityId').all(authPolicy.isAllowed)

  /** PUT /api/entities/:entityId - Update entities */
  .put(asyncHandler(entityCtrl.update))

  /** DELETE /api/entities/:entityId - Delete entities */
  .delete(asyncHandler(entityCtrl.remove));

/** Load entities when API with entityId route parameter is hit */
router.param('entityId', asyncHandler(entityCtrl.load));

export default router;
