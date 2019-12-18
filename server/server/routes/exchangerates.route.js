import express from 'express';
import exchangeratesCtrl from '../controllers/exchangerates.controller';
import asyncHandler from 'express-async-handler';
import authPolicy from '../middlewares/authenticate';

const router = express.Router(); // eslint-disable-line new-cap

router.route('/exchangeratesByPair')
  /** GET /api/exchangerates - Get list of exchangerates */
  .get(asyncHandler(exchangeratesCtrl.getExchangerateByPair));

router.route('/updateExchangeratesForTypeAPI').all(authPolicy.isAllowed)
  /** GET /api/exchangerates- update exchangerates for API */
  .get(asyncHandler(exchangeratesCtrl.updateExchangeratesForTypeAPI));

router.route('/')
  /** GET /api/exchangerates - Get list of exchangerates */
  .get(asyncHandler(exchangeratesCtrl.list));

router.route('/').all(authPolicy.isAllowed)
  /** POST /api/exchangerates- Create new exchangerates */
  .post(asyncHandler(exchangeratesCtrl.create));

router.route('/:exchangeratesId').all(authPolicy.isAllowed)
  /** GET /api/exchangerates/:exchangeratesId - Get exchangerates */
  .get(asyncHandler(exchangeratesCtrl.get))

  /** PUT /api/exchangerates/:exchangeratesId - Update exchangerates */
  .put(asyncHandler(exchangeratesCtrl.update))

  /** DELETE /api/exchangerates/:exchangeratesId - Delete exchangerates */
  .delete(asyncHandler(exchangeratesCtrl.remove));

/** Load exchangerates when API with exchangeratesId route parameter is hit */
router.param('exchangeratesId', asyncHandler(exchangeratesCtrl.load));

export default router;
