import express from 'express';
import countryCtrl from '../controllers/country.controller';
import asyncHandler from 'express-async-handler';

const router = express.Router(); // eslint-disable-line new-cap


router.route('/')
  /** GET /api/countrys - Get list of countrys */
  .get(asyncHandler(countryCtrl.list))

  /** POST /api/countrys - Create new countrys */
  .post(asyncHandler(countryCtrl.create));

router.route('/:countryId')
  /** GET /api/countrys/:countryId - Get countrys */
  .get(asyncHandler(countryCtrl.get))

  /** PUT /api/countrys/:countryId - Update countrys */
  .put(asyncHandler(countryCtrl.update))

  /** DELETE /api/countrys/:countryId - Delete countrys */
  .delete(asyncHandler(countryCtrl.remove));

/** Load countrys when API with countryId route parameter is hit */
router.param('countryId', asyncHandler(countryCtrl.load));

export default router;
