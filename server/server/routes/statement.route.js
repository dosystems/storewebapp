import express from 'express';
import statementCtrl from '../controllers/statement.controller';
import asyncHandler from 'express-async-handler';
import authPolicy from '../middlewares/authenticate';

const router = express.Router(); // eslint-disable-line new-cap


router.route('/').all(authPolicy.isAllowed)
  /** GET /api/statements - Get list of statements */
  .get(asyncHandler(statementCtrl.list))

  /** POST /api/statements - Create new statements */
  .post(asyncHandler(statementCtrl.create));

router.route('/:statementId').all(authPolicy.isAllowed)
  /** GET /api/statements/:statementId - Get statements */
  .get(asyncHandler(statementCtrl.get))

  /** PUT /api/statements/:statementId - Update statements */
  .put(asyncHandler(statementCtrl.update))

  /** DELETE /api/statements/:statementId - Delete statements */
  .delete(asyncHandler(statementCtrl.remove));

/** Load statements when API with statementId route parameter is hit */
router.param('statementId', asyncHandler(statementCtrl.load));

export default router;
