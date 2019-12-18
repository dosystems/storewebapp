import express from 'express';
import orderCtrl from '../controllers/order.controller';
import asyncHandler from 'express-async-handler';
import authPolicy from '../middlewares/authenticate';

const router = express.Router(); // eslint-disable-line new-cap

router.route('/getOrdersByOwnerId').all(authPolicy.isAllowed)
  /** GET /api/orders - Get list of orders */
  .get(asyncHandler(orderCtrl.getOrdersByOwnerId));

router.route('/updatePaymentExpiredOrders').all(authPolicy.isAllowed)
  /** GET /api/orders - Get list of orders */
  .put(asyncHandler(orderCtrl.updatePaymentExpiredOrders));

router.route('/updateOrderPayment').all(authPolicy.isAllowed)
  /** GET /api/orders - Get list of orders */
  .put(asyncHandler(orderCtrl.updateOrderPayment));

router.route('/updateShipmentAddress').all(authPolicy.isAllowed)
  /** GET /api/orders - Get list of orders */
  .put(asyncHandler(orderCtrl.updateShipmentAddress));

router.route('/updateCartOrders').all(authPolicy.isAllowed)
  /** GET /api/orders - Get list of orders */
  .put(asyncHandler(orderCtrl.updateCartOrders));
  
router.route('/').all(authPolicy.isAllowed)
  /** GET /api/orders - Get list of orders */
  .get(asyncHandler(orderCtrl.list))

  /** POST /api/orders - Create new orders */
  .post(asyncHandler(orderCtrl.create));

router.route('/:orderId').all(authPolicy.isAllowed)
  /** GET /api/orders/:orderId - Get orders */
  .get(asyncHandler(orderCtrl.get))

  /** PUT /api/orders/:orderId - Update orders */
  .put(asyncHandler(orderCtrl.update))

  /** DELETE /api/orders/:orderId - Delete orders */
  .delete(asyncHandler(orderCtrl.remove));

/** Load orders when API with orderId route parameter is hit */
router.param('orderId', asyncHandler(orderCtrl.load));

export default router;
