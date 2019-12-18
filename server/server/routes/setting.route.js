import express from 'express';
import settingCtrl from '../controllers/setting.controller';
import asyncHandler from 'express-async-handler';
import authPolicy from '../middlewares/authenticate';

const router = express.Router(); // eslint-disable-line new-cap


router.route('/').all(authPolicy.isAllowed)
  /** GET /api/settings - Get list of settings */
  .get(asyncHandler(settingCtrl.list))

  /** POST /api/settings - Create new settings */
  .post(asyncHandler(settingCtrl.create));

router.route('/:settingId').all(authPolicy.isAllowed)
  /** GET /api/settings/:settingId - Get settings */
  .get(asyncHandler(settingCtrl.get))

  /** PUT /api/settings/:settingId - Update settings */
  .put(asyncHandler(settingCtrl.update))

  /** DELETE /api/settings/:settingId - Delete settings */
  .delete(asyncHandler(settingCtrl.remove));

/** Load settings when API with settingId route parameter is hit */
router.param('settingId', asyncHandler(settingCtrl.load));

export default router;
