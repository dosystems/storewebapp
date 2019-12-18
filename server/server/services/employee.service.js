import Employee from '../models/employee.model';
import Seller from '../models/seller.model';
import config from '../config/config';
import activityService from './activity.service';
import uploadService from './upload.service';
import renderEmailTemplateService from './renderEmailTemplate.service';
import session from '../utils/session.util';
import serviceUtil from '../utils/service.util';
import dateUtil from '../utils/date.util';

/**
 * set Employee variables
 * @returns {Employee}
 */
function setCreateEmployeeVaribles(req, employee) {
  employee.email = employee.email.toLowerCase();
  employee.status = config.commonStatus.Active;
  if (req.tokenInfo) {
    employee.createdBy[req.tokenInfo.loginType] = session.getSessionLoginID(req);
    employee.createdBy.name = session.getSessionLoginName(req);
  }
  if (employee.firstName) {
    employee.displayName = employee.firstName;
  }
  if (employee.middleName) {
    employee.displayName += ' ' + employee.middleName;
  }
  if (employee.lastName) {
    employee.displayName += ' ' + employee.lastName;
  }
  employee.password =  req.password = serviceUtil.generateRandomAlphanumeric(12);
  return employee;
}

/**
 * set Employee update variables
 * @returns {Employee}
 */
function setUpdateEmployeeVaribles(req, employee) {
  employee.updated = Date.now();
  if (req.tokenInfo) {
    employee.updatedBy[req.tokenInfo.loginType] = session.getSessionLoginID(req);
    employee.updatedBy.name = session.getSessionLoginName(req);
  };
  if (employee.firstName) {
    employee.displayName = employee.firstName;
  };
  if (employee.middleName) {
    employee.displayName += ' ' + employee.middleName;
  };
  if (employee.lastName) {
    employee.displayName += ' ' + employee.lastName;
  };
  return employee;
};

/**
 * insert Employees bulk data
 * @returns {Employees}
 */
async function insertEmployeesData(req, res) {
  let obj = await uploadService.generateJsonForEmployee(req);
  req.duplicates = [];

  //checking for the unique emial
  for (let val in obj) {
    let email = obj[val].email;
    let uniqueMail = await Employee.findUniqueEmail(email);

    //if mail exists the particule record will added to the duplicate object
    if (uniqueMail) {
      obj[val].reason = "Email alredy existed";
      req.duplicates.push(obj[val]);
      delete obj[val];

      //else the file will get uploaded in to the data base
    } else {
      let employee = new Employee(obj[val])
      employee = setCreateEmployeeVaribles(req, employee);
      req.employee = await Employee.save(employee);
      req.enEmail = serviceUtil.encodeString(email);
      req.entityType = 'employee';
      req.activityKey = 'employeeCreate';
      activityService.insertActivity(req);
      await renderEmailTemplateService.setCommonEmailVariables(req, res);
    };
  };
  return obj;
};

export default {
  setCreateEmployeeVaribles,
  setUpdateEmployeeVaribles,
  insertEmployeesData

};
