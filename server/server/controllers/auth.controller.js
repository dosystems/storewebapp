import config from '../config/config';

import Buyer from '../models/buyer.model';
import Employee from '../models/employee.model';
import Seller from '../models/seller.model';

import activityService from '../services/activity.service';
import buyerService from '../services/buyer.service';
import rolesService from '../services/roles.service';
import tokenService from '../services/token.service';

import respUtil from '../utils/resp.util';
import i18nUtil from '../utils/i18n.util';

/**
 * Returns jwt token if valid Email and password is provided
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
async function login(req, res, next) {
  logger.info('Log:Auth Controller:login: body :' + JSON.stringify(req.body));
  let employee, buyer, seller;
  req.i18nKey = 'loginError';

  //Checks the existance of employee with unique email condition
  if (req.body.entityType === config.commonRole.employee) {
    req.entityType = 'employee';
    req.activityKey = 'employeeLoginSuccess';
    employee = await Employee.findUniqueEmail(req.body.email);

    //authenticate password for employee
    if (!employee || !employee.authenticate(req.body.password)) {
      logger.error('Error:auth Controller:login:' + i18nUtil.getI18nMessage("employeeLoginError"));
      req.i18nKey = 'employeeLoginError'
      return res.json(respUtil.getErrorResponse(req));
    };
    req.i18nKey = 'employeeWaStatusMessage';
    if (employee.status === config.commonStatus.Pending) {
      logger.error('Error:auth Controller:loginResponse:' + i18nUtil.getI18nMessage("employeeWaStatusMessage"));
      return res.json(respUtil.getErrorResponse(req));
    };
    req.employee = employee;

    //get the persmissions for the employee based on the role if exist
    if (req.employee && req.employee.role) {
      req.permissions = await rolesService.getPermissions(req.employee.role);
    }
  };

  //Checks the existance of buyer with unique email condition
  if (req.body.entityType === config.commonRole.buyer) {
    req.entityType = 'buyer';
    req.activityKey = 'buyerLoginSuccess';
    buyer = await Buyer.findUniqueEmail(req.body.email);


    //authenticate password of buyer
    if (!buyer || !buyer.authenticate(req.body.password)) {
      logger.error('Error:auth Controller:login:' + i18nUtil.getI18nMessage("buyerLoginError"));
      req.i18nKey = 'buyerLoginError'
      return res.json(respUtil.getErrorResponse(req));
    };
    req.i18nKey = 'buyerWaStatusMessage';
    if (buyer.status === config.commonStatus.Pending) {
      logger.error('Error:auth Controller:loginResponse:' + i18nUtil.getI18nMessage("buyerWaStatusMessage"));
      return res.json(respUtil.getErrorResponse(req));
    };
    req.buyer = buyer;
    if (req.buyer && !req.buyer.isBitsolivesUser) {
      req.buyer.isBitsolivesUser = await buyerService.checkEmailInBitSolvies(req.buyer);
      await Buyer.save(buyer);
    }

    //get the persmissions for the buyer based on the role if exist
    if (req.buyer && req.buyer.role) {
      req.permissions = await rolesService.getPermissions(req.buyer.role);
    }
  };

  //Checks the existance of seller with unique email condition
  if (req.body.entityType === config.commonRole.seller) {
    req.entityType = 'seller';
    req.activityKey = 'sellerLoginSuccess';
    seller = await Seller.findUniqueEmail(req.body.email);
    //authenticate password of seller
    if (!seller || !seller.authenticate(req.body.password)) {
      req.i18nKey = 'sellerLoginError'
      return res.json(respUtil.getErrorResponse(req));
    };
    if (seller.status === config.commonStatus.Pending) {
      req.i18nKey = 'sellerWaStatusMessage';
      logger.error('Error:auth Controller:loginResponse:' + i18nUtil.getI18nMessage("sellerWaStatusMessage"));
      return res.json(respUtil.getErrorResponse(req));
    } else if (seller.status === config.commonStatus.NotVerified) {
      req.i18nKey = 'sellerNotVerified';
      logger.error('Error:auth Controller:loginResponse:' + i18nUtil.getI18nMessage("sellerWaStatusMessage"));
      return res.json(respUtil.getErrorResponse(req));
    } else if (seller.status === config.commonStatus.Rejected) {
      req.i18nKey = 'sellerRejected';
      logger.error('Error:auth Controller:loginResponse:' + i18nUtil.getI18nMessage("sellerNotAuthorized"));
      return res.json(respUtil.getErrorResponse(req));
    } else if (seller.status === config.commonStatus.Blocked) {
      req.i18nKey = 'sellerBlocked';
      logger.error('Error:auth Controller:loginResponse:' + i18nUtil.getI18nMessage("sellerBlocked"));
      return res.json(respUtil.getErrorResponse(req));
    }
    req.seller = seller;


    //get the persmissions for the seller based on the role if exist
    if (req.seller && req.seller.role) {
      req.permissions = await rolesService.getPermissions(req.seller.role);
    }
  };
  req.i18nKey = 'loginSuccessMessage';
  req.contextId = req[req.entityType]._id;

  // creating activity for login
  activityService.insertActivity(req);

  // remove exisisting token and save new token
  await tokenService.removeTokenAndSaveNewToken(req);
  res.json(respUtil.loginSuccessResponse(req));
};

async function logout(req, res, next) {
  logger.info('Log:Auth Controller:logout: body :' + JSON.stringify(req.body));
  req.i18nKey = 'logoutMessage';

  // check login type employee
  if (req.body.type === config.commonRole.employee) {
    req.activityKey = 'employeeLogout';
  };
  // check login type buyer
  if (req.body.type === config.commonRole.buyer) {
    req.activityKey = 'buyerLogout';
  };
  // check login type seller
  if (req.body.type === config.commonRole.seller) {
    req.activityKey = 'sellerLogout';
  };

  req.contextId = req[req.entityType]._id;
  // Creating an logout activity 
  activityService.insertActivity(req);
  res.json(respUtil.logoutSuccessResponse(req));
};

/**
 * reset password by admin
 */
async function resetPassword(req, res) {
  logger.info(`Req.body: ${req.body}`);

  //Conditions statisfies if reset request is for seller
  if (req.body && req.body.type && req.body.type === 'seller') {
    if (req.body._id) {
      let seller = await Seller.get(req.body._id);

      // Error response if active seller was not found 
      if (!seller) {
        req.i18nKey = 'noRecordFound';
        return res.json(respUtil.getErrorResponse(req));
      }
      let passwordDetails = req.body;

      //check wheather entered new password and confirm password 
      if (passwordDetails.newPassword === passwordDetails.confirmPassword) {
        seller.password = passwordDetails.newPassword;
        seller = await Seller.save(seller);
        req.i18nKey = "passwordSuccess"
        res.json(respUtil.successResponse(req))
      } else {
        req.i18nKey = 'passwordsNotMatched';
        return res.json(respUtil.getErrorResponse(req));
      }
    }
  }
  if (req.body && req.body.type && req.body.type === 'buyer') {
    if (req.body._id) {
      let buyer = await Buyer.get(req.body._id);
      if (!buyer) {
        req.i18nKey = 'noRecordFound';
        return res.json(respUtil.getErrorResponse(req));
      }
      let passwordDetails = req.body;
      if (passwordDetails.newPassword && !(passwordDetails.newPassword === passwordDetails.confirmPassword)) {
        req.i18nKey = 'passwordsNotMatched';
        return res.json(respUtil.getErrorResponse(req));
      } else if (!passwordDetails.newPassword) {
        req.i18nKey = 'newPassword';
        return res.json(respUtil.getErrorResponse(req));
      };
      buyer.password = passwordDetails.newPassword;
      buyer = await Buyer.save(buyer);
      req.i18nKey = "passwordSuccess"
      res.json(respUtil.successResponse(req))
    }
  }
}

/**
 * This is a protected route. Will return random number only if jwt token is provided in header.
 * @param req
 * @param res
 * @returns {*}
 */
function getRandomNumber(req, res) {

  // req.employee is assigned by jwt middleware if valid token is provided
  if (req.employee) {
    return res.json({
      employee: req.employee,
      num: Math.random() * 100
    });
  };
};


export default {
  login,
  getRandomNumber,
  logout,
  resetPassword
};
