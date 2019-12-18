import express from 'express';
import newsLetterCtrl from '../controllers/newsLetter.controller';
import asyncHandler from 'express-async-handler';
import authPolicy from '../middlewares/authenticate';

const router = express.Router(); // eslint-disable-line new-cap
router.route('/uploadImages').all(authPolicy.isAllowed)
  /** GET /api/newsLetters/uploadImages */
  .post(asyncHandler(newsLetterCtrl.uploadImages));

router.route('/').all(authPolicy.isAllowed)
  /** GET /api/newsLetters - Get list of newsLetter */
  .get(asyncHandler(newsLetterCtrl.list))

  /** POST /api/newsLetters - Create new newsLetter */
  .post(asyncHandler(newsLetterCtrl.create));

router.route('/:newsLetterId').all(authPolicy.isAllowed)
  /** GET /api/newsLetters/:newsLetterId - Get newsLetter */
  .get(asyncHandler(newsLetterCtrl.get))

  /** PUT /api/newsLetters/:newsLetterId - Update newsLetter */
  .put(asyncHandler(newsLetterCtrl.update))

  /** DELETE /api/newsLetters/:newsLetterId - Delete newsLetter */
  .delete(asyncHandler(newsLetterCtrl.remove));

/** Load newsLetters when API with newsLetterId route parameter is hit */
router.param('newsLetterId', asyncHandler(newsLetterCtrl.load));

export default router;