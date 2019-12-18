import express from 'express';
import reportsCtrl from '../controllers/reports.controller';
import asyncHandler from 'express-async-handler';
import authPolicy from '../middlewares/authenticate';

const router = express.Router(); // eslint-disable-line new-cap

router.route('/productCarts').all(authPolicy.isAllowed)
  .get(asyncHandler(reportsCtrl.getProductCartedOrders))
router.route('/mostlyViewed').all(authPolicy.isAllowed)
  .get(asyncHandler(reportsCtrl.mostlyViewed))

router.route('/orderAmount').all(authPolicy.isAllowed)
  .get(asyncHandler(reportsCtrl.ordersAmmount))

router.route('/bestSeller').all(authPolicy.isAllowed)
  .get(asyncHandler(reportsCtrl.bestSeller))

router.route('/productByOrder').all(authPolicy.isAllowed)
  .get(asyncHandler(reportsCtrl.productByOrder))
export default router;