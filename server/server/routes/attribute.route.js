import express from 'express';
import attributeCtrl from '../controllers/attribute.controller';
import asyncHandler from 'express-async-handler';
import authPolicy from '../middlewares/authenticate';

const router = express.Router(); // eslint-disable-line new-cap


router.route('/').all(authPolicy.isAllowed)
  /** GET /api/attributes - Get list of attributes */
  .get(asyncHandler(attributeCtrl.list))

  /** POST /api/attributes - Create new attributes */
  .post(asyncHandler(attributeCtrl.create));

router.route('/:attributeId').all(authPolicy.isAllowed)
  /** GET /api/attributes/:attributeId - Get attributes */
  .get(asyncHandler(attributeCtrl.get))

  /** PUT /api/attributes/:attributeId - Update attributes */
  .put(asyncHandler(attributeCtrl.update))

  /** DELETE /api/attributes/:attributeId - Delete attributes */
  .delete(asyncHandler(attributeCtrl.remove));

/** Load attributes when API with attributeId route parameter is hit */
router.param('attributeId', asyncHandler(attributeCtrl.load));

export default router;
