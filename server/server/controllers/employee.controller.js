import config from '../config/config';

import Employee from '../models/employee.model';

import activityService from '../services/activity.service';
import employeeService from '../services/employee.service';
import renderEmailTemplateService from '../services/renderEmailTemplate.service';
import tokenService from '../services/token.service';
import uploadeService from '../services/upload.service';

import respUtil from '../utils/resp.util';
import serviceUtil from '../utils/service.util';

/**
 * Load Employee and append to req.
 * @param req
 * @param res
 * @param next
 */
async function load(req, res, next) {
  req.employee = await Employee.get(req.params.employeeId);
  return next();
};

/**
 * Get employee
 * @param req
 * @param res
 * @returns {details: Employee}
 */
async function get(req, res) {
  logger.info('Log:Employee Controller:get: query :' + JSON.stringify(req.query));
  let employee = req.employee;
  let responseJson = {
    respCode: respUtil.successResponse(req).respCode,
    details: employee
  };
  req.query =  serviceUtil.generateListQuery(req);
  req.history = [];
  req.query.filter.contextId = employee.id;
  await activityService.getHistory(req);
  if (req.history.length > 0) {
    responseJson.history = req.history;
  };
  res.json(responseJson);
};

/**
 * Create new employee
 * @param req
 * @param res
 * @returns { respCode: respCode, respMessage: respMessage }
 */
async function create(req, res) {
  logger.info('Log:Employee Controller:create: body :' + JSON.stringify(req.body));
  let employee = new Employee(req.body);

  // check unique email
  const uniqueEmail = await Employee.findUniqueEmail(employee.email);
  if (uniqueEmail) {
    req.i18nKey = 'emailExists';
    return res.json(respUtil.getErrorResponse(req));
  };
  employee = employeeService.setCreateEmployeeVaribles(req, employee);
  req.employee = await Employee.save(employee);
  req.employee.password = req.employee.salt = undefined;
  req.entityType = 'employee';
  req.activityKey = 'employeeCreate';
  req.contextId = req.employee._id;

  // creating activity for new employee 
  activityService.insertActivity(req);

  // converted email to encoded format
  req.enEmail = serviceUtil.encodeString(req.employee.email);

  //send email to employee
  renderEmailTemplateService.setCommonEmailVariables(req, res);
  res.json(respUtil.createSuccessResponse(req));
};

/**
 * Update existing employee
 * @param req
 * @param res
 * @param next
 * @returns { respCode: respCode, respMessage: respMessage }
 */
async function update(req, res, next) {
  logger.info('Log:Employee Controller:update: body :' + JSON.stringify(req.body));
  let employee = req.employee;

  // check unique email
  if (req.body.email && employee.email !== req.body.email) {
    const uniqueEmail = await Employee.findUniqueEmail(req.body.email);
    if (uniqueEmail) {
      req.i18nKey = 'emailExists';
      return res.json(respUtil.getErrorResponse(req));
    }
  }
  employee = Object.assign(employee, req.body);
  employee = employeeService.setUpdateEmployeeVaribles(req, employee);
  req.employee = await Employee.save(employee);
  req.employee.password = req.employee.salt = undefined;
  req.entityType = 'employee';
  req.activityKey = 'employeeUpdate';
  req.contextId = req.employee._id;

  // creating update activity for employee
  activityService.insertActivity(req);
  res.json(respUtil.updateSuccessResponse(req));
};

/**
 * Get employee list. based on criteria
 * @param req
 * @param res
 * @param next
 * @returns {employees: employees, pagination: pagination}
 */
async function list(req, res, next) {
  let responseJson = {};
  logger.info('Log:Employee Controller:list: query :' + JSON.stringify(req.query));
  req.entityType = 'employee';
  const query =  serviceUtil.generateListQuery(req);
  if (query.page === 1) {
    // total count 
    query.pagination.totalCount = await Employee.totalCount(query);
  };

  //get total employees
  const employees = await Employee.list(query);
  responseJson.respCode = respUtil.successResponse(req).respCode;
  responseJson.employees = employees;
  responseJson.pagination = query.pagination;
  res.json(responseJson);
};

/**
 * Delete employee.
 * @param req
 * @param res
 * @param next
 * @returns { respCode: respCode, respMessage: respMessage }
 */
async function remove(req, res, next) {
  logger.info('Log:Employee Controller:remove: query :' + JSON.stringify(req.query));
  let employee = req.employee;
  employee.active = false;
  employee = employeeService.setUpdateEmployeeVaribles(req, employee);
  req.employee = await Employee.save(employee);
  req.employee.password = req.employee.salt = undefined;
  req.entityType = 'employee';
  req.activityKey = 'employeeDelete';
  req.contextId = req.employee._id;

  // adding employee delete activity
  activityService.insertActivity(req);
  res.json(respUtil.removeSuccessResponse(req));
};

/**
 * Change Password
 * @param req
 * @param res
 */
async function changePassword(req, res) {
  let employeeId = '';
  if (req.query.employeeId) {
    employeeId = req.query.employeeId;
  } else if (req.tokenInfo._id) {
    employeeId = req.tokenInfo._id;
  };
  let passwordDetails = req.body;
  let employee = await Employee.get(employeeId);

  // check new password exists
  if (passwordDetails.newPassword) {

    // check current password and new password are same
    if (passwordDetails.currentPassword && (passwordDetails.currentPassword === passwordDetails.newPassword)) {
      req.i18nKey = 'currentOldSameMsg';
      return res.json(respUtil.getErrorResponse(req));
    };

    // authenticate current password
    if (employee.authenticate(passwordDetails.currentPassword)) {
      if (passwordDetails.newPassword === passwordDetails.confirmPassword) {
        employee.password = passwordDetails.newPassword;
        employee = await Employee.save(employee);
        req.entityType = 'employee'
        req.activityKey = 'employeeChangePassword';
        req.contextId = employee._id;

        // adding employee change password activity
        activityService.insertActivity(req);
        req.i18nKey = 'passwordSuccess';
        res.json(respUtil.successResponse(req));
      } else {
        req.i18nKey = 'passwordsNotMatched';
        return res.json(respUtil.getErrorResponse(req));
      };
    } else {
      req.i18nKey = 'currentPasswordError';
      return res.json(respUtil.getErrorResponse(req));
    };
  } else {
    req.i18nKey = 'newPassword';
    return res.json(respUtil.getErrorResponse(req));
  };
};


/**
 * Forgot Password
 * @param req
 * @param res
 */
async function forgotPassword(req, res) {
  logger.info('Log:Employee Controller:forgotPassword: query :' + JSON.stringify(req.query));
  if (req.query.employeeName) {
    let employee = await Employee.findUniqueEmail(req.query.employeeName);
    if (employee && employee.status === config.commonStatus.Inactive) {
      req.i18nKey = 'employeeInactiveStatusMessage';
      return res.json(respUtil.getErrorResponse(req));
    } else if (!employee) {
      req.i18nKey = 'emailNotExist';
      return res.json(respUtil.getErrorResponse(req));
    };
    req.employee = employee;
    req.entityType = 'employee';
    req.activityKey = 'employeeForgotPassword';
    req.contextId = req.employee._id;

    // converted email to encoded format
    req.enEmail = serviceUtil.encodeString(req.employee.email);

    // adding employee forgot password activity
    activityService.insertActivity(req);

    //send email to employee
    renderEmailTemplateService.setCommonEmailVariables(req, res);
    req.i18nKey = 'mailSuccess';
    res.json(respUtil.successResponse(req));
  } else {
    req.i18nKey = 'missingEmployeenameParameter';
    return res.json(respUtil.getErrorResponse(req));
  };
};

/**
 * Change recover Password
 * @param req
 * @param res
 */
async function changeRecoverPassword(req, res) {
  if (req.body.enEmail) {
    logger.info('Log:Employee Controller:changeRecoverPassword: body : ' + req.body.enEmail);
    req.deEmail = serviceUtil.decodeString(req.body.enEmail);

    // converted encode string to decode
    let employee = await Employee.findUniqueEmail(req.deEmail);
    req.employee = employee;

    // email not exists
    if (!employee) {
      req.i18nKey = 'emailNotExist';
      return res.json(respUtil.getErrorResponse(req));
    };
    let passwordDetails = req.body;

    // active employee response
    if (req.query.active) {
      if (employee.status === config.commonStatus.Active) {
        req.i18nKey = 'employeeAlreadyActivated';
        return res.json(respUtil.getErrorResponse(req));
      } else if (employee && employee.status === config.commonStatus.Inactive) {
        req.i18nKey = 'employeeInactiveStatusMessage';
        return res.json(respUtil.getErrorResponse(req));
      } else {
        employee.activatedDate = dateUtil.getTodayDate();
        employee.status = config.commonStatus.Active;
      };
    };
    if (passwordDetails.newPassword && !(passwordDetails.newPassword === passwordDetails.confirmPassword)) {
      req.i18nKey = 'passwordsNotMatched';
      return res.json(respUtil.getErrorResponse(req));
    } else if (!passwordDetails.newPassword) {
      req.i18nKey = 'newPassword';
      return res.json(respUtil.getErrorResponse(req));
    };
    employee.isFirstTimeLogged = false;
    employee.password = passwordDetails.newPassword;
    employee = await Employee.save(employee);
    req.activityKey = 'employeeChangePassword';
    req.entityType = 'employee';
    req.contextId = req.employee._id;
    req.i18nKey = 'loginSuccessMessage';

    // adding employee Change recover password activity
    activityService.insertActivity(req);

    // remove exisisting token and save new token
    await tokenService.removeTokenAndSaveNewToken(req);
    res.json(respUtil.loginSuccessResponse(req));
  };
};

/**
 * change employee profilePucture
 * @param req
 * @param res
 */
async function changeProfilePicture(req, res, next) {
  logger.info('Log:Employee Controller :Change employee logo:body:' + JSON.stringify(req.body));
  let employee = req.employee;
  req.uploadFile = [];
  req.uploadPath = 'employee';

  //Calling the activity of uploading the required file
  uploadeService.upload(req, res, (err) => {
    if (err) {
      logger.error('Error:employee Controller: Change employee Logo: Error:' + JSON.stringify(err));
      req.i18nKey = "uploadDirectoryNotFound";
      res.json(respUtil.getErrorResponse(req));
    } else if (req.uploadFile && req.uploadFile[0] && req.uploadFile[0].name) {
      req.image = req.uploadFile[0].name;
      employee.photo = req.uploadFile[0].name;

      //Saving the changes of the employee
      req.employee = Employee.save(employee)
      req.entityType = 'employee';
      req.activityKey = 'employeeUpload';
      req.contextId = req.employee._id;

      //adding employee logo activity
      activityService.insertActivity(req);
      res.json(respUtil.uploadLogoSucessResponse(req))
    } else {
      req.i18nKey = 'employeeLogoUploadedErrorMessage';
      logger.error('Error:Employee Employee:Change Employee Logo: Error : Employee Logo not uploded.');
      res.json(respUtil.getErrorResponse(req));
    };
  });
};

export default {
  load,
  get,
  create,
  update,
  list,
  remove,
  changePassword,
  forgotPassword,
  changeRecoverPassword,
  changeProfilePicture
};
