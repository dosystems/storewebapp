import express from 'express';
import validate from 'express-validation';
import paramValidation from '../config/param-validation';
import employeeCtrl from '../controllers/employee.controller';
import csvCntrl from '../controllers/csvupload.controller';
import dashboardCtrl from '../controllers/dashboard.controller';
import asyncHandler from 'express-async-handler';
import authPolicy from '../middlewares/authenticate';

const router = express.Router(); // eslint-disable-line new-cap

router.route('/dashBoard').all(authPolicy.isAllowed)
  /** GET /api/dashboard - Get list of dashboard */
  .get(asyncHandler(dashboardCtrl.list))

router.route('/csvupload').all(authPolicy.isAllowed)
  /** POST /api/employees/signUp - Creates Employee*/
  .post(asyncHandler(csvCntrl.bulkUpload))

router.route('/signUp')
  /** POST /api/employees/signUp - Creates Employee*/
  .post(validate(paramValidation.createEmployee), asyncHandler(employeeCtrl.create));

router.route('/changePassword').all(authPolicy.isAllowed)
  /** POST /api/employees/changePassword - change password */
  .post(validate(paramValidation.changePassword), asyncHandler(employeeCtrl.changePassword));

router.route('/forgotPassword')
  /** POST /api/employees/forgotPassword - forgot password */
  .post(asyncHandler(employeeCtrl.forgotPassword));

router.route('/changeRecoverPassword')
  /** POST /api/employees/changeRecoverPassword - change recover password */
  .post(validate(paramValidation.changeRecoverPassword), asyncHandler(employeeCtrl.changeRecoverPassword));

router.route('/').all(authPolicy.isAllowed)
  /** GET /api/employees - Get list of employyes */
  .get(asyncHandler(employeeCtrl.list))

  /** POST /api/employees - Create new employyes */
  .post(validate(paramValidation.createEmployee), asyncHandler(employeeCtrl.create));

router.route('/uploadImage/:employeeId').all(authPolicy.isAllowed)
  /** post /api/employees/uploadprofilePicture/:employeeId - upload the profile picture of Employees */
  .post(asyncHandler(employeeCtrl.changeProfilePicture));

router.route('/:employeeId').all(authPolicy.isAllowed)
  /** GET /api/employees/:employeeId - Get employyes */
  .get(asyncHandler(employeeCtrl.get))

  /** PUT /api/employees/:employeeId - Update employyes */
  .put(validate(paramValidation.updateEmployee), asyncHandler(employeeCtrl.update))

  /** DELETE /api/employees/:employeeId - Delete employyes */
  .delete(asyncHandler(employeeCtrl.remove));

/** Load employees when API with employeeId route parameter is hit */
router.param('employeeId', asyncHandler(employeeCtrl.load));

export default router;
