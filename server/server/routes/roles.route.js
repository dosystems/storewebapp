import express from 'express';
import rolesCtrl from '../controllers/roles.controller';
import asyncHandler from 'express-async-handler';
import authPolicy from '../middlewares/authenticate';

const router = express.Router(); // eslint-disable-line new-cap

router.route('/').all(authPolicy.isAllowed).all(authPolicy.isSuperAdmin)
  /** GET /api/roles - Get list of roles */
  .get(asyncHandler(rolesCtrl.list))

  /** POST /api/roles - Create new roles */
  .post(asyncHandler(rolesCtrl.create));

router.route('/:rolesId').all(authPolicy.isAllowed).all(authPolicy.isSuperAdmin)
  /** GET /api/roles/:rolesId - Get roles */
  .get(asyncHandler(rolesCtrl.get))

  /** PUT /api/roles/:rolesId - Update roles */
  .put(asyncHandler(rolesCtrl.update))

  /** DELETE /api/roles/:rolesId - Delete roles */
  .delete(asyncHandler(rolesCtrl.remove));

/** Load roles when API with rolesId route parameter is hit */
router.param('rolesId', asyncHandler(rolesCtrl.load));

export default router;