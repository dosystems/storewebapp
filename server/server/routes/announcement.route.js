import express from 'express';
import announcementCtrl from '../controllers/announcement.controller';
import asyncHandler from 'express-async-handler';
import authPolicy from '../middlewares/authenticate';

const router = express.Router(); // eslint-disable-line new-cap

router.route('/attachment/:announcementId').all(authPolicy.isAllowed)
  .post(asyncHandler(announcementCtrl.uploadAtachment))

router.route('/').all(authPolicy.isAllowed)
  /** GET /api/announcements - Get list of announcement */
  .get(asyncHandler(announcementCtrl.list))

  /** POST /api/announcements - Create new announcement */
  .post(asyncHandler(announcementCtrl.create));

router.route('/:announcementId').all(authPolicy.isAllowed)
  /** GET /api/announcements/:announcementId - Get announcement */
  .get(asyncHandler(announcementCtrl.get))

  /** PUT /api/announcements/:announcementId - Update announcement */
  .put(asyncHandler(announcementCtrl.update))

  /** DELETE /api/announcements/:announcementId - Delete announcement */
  .delete(asyncHandler(announcementCtrl.remove));

/** Load announcements when API with announcementId route parameter is hit */
router.param('announcementId', asyncHandler(announcementCtrl.load));

export default router;