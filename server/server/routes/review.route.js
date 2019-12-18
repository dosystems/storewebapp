import express from 'express';
import reviewCtrl from '../controllers/review.controller';
import asyncHandler from 'express-async-handler';
import authPolicy from '../middlewares/authenticate';

const router = express.Router(); // eslint-disable-line new-cap

router.route('/')
  /** GET /api/reviews - Get list of review */
  .get(asyncHandler(reviewCtrl.list))

  /** POST /api/reviews - Create new review */
router.route('/').all(authPolicy.isAllowed)
  .post(asyncHandler(reviewCtrl.create));

router.route('/:reviewId')
  /** GET /api/reviews/:reviewId - Get review */
  .get(asyncHandler(reviewCtrl.get))

  /** PUT /api/reviews/:reviewId - Update review */
router.route('/:reviewId').all(authPolicy.isAllowed)
  .put(asyncHandler(reviewCtrl.update))

  /** DELETE /api/reviews/:reviewId - Delete review */
  .delete(asyncHandler(reviewCtrl.remove));

/** Load reviews when API with reviewId route parameter is hit */
router.param('reviewId', asyncHandler(reviewCtrl.load));

export default router;