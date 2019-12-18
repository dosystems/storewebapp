import config from '../config/config';

import Buyer from '../models/buyer.model';
import Review from '../models/review.model';
import Payment from '../models/payment.model';

import activityService from '../services/activity.service';
import buyerService from '../services/buyer.service';
import renderEmailTemplateService from '../services/renderEmailTemplate.service';
import tokenService from '../services/token.service';
import uploadeService from '../services/upload.service';

import respUtil from '../utils/resp.util';
import serviceUtil from '../utils/service.util';
import paymentService from '../services/payment.service';

/**
 * Load buyer and append to req.
 * @param req
 * @param res
 * @param next
 */
async function load(req, res, next) {
  req.buyer = await Buyer.get(req.params.buyerId);
  return next();
}

/**
 * Get buyer
 * @param req
 * @param res
 * @returns {details: Buyer}
 */
async function get(req, res) {
  logger.info('Log:Buyer Controller:get: query :' + JSON.stringify(req.query));
  let buyer = req.buyer;
  buyer.password = buyer.salt = undefined;
  buyer = await buyerService.getBuyerDetails(buyer);
  buyer['address'].forEach((element, index) => {
    if (element.active === false) {
      delete buyer['address'][index]
    };
  });
  buyer['address'] = buyer['address'].filter(function (item) { return item != null })
  let responseJson = {
    respCode: respUtil.successResponse(req).respCode,
    details: buyer
  };
  res.json(responseJson);
}

/**
 * Create new buyer
 * @param req
 * @param res
 * @returns { respCode: respCode, respMessage: respMessage }
 */
async function create(req, res) {
  logger.info('Log:Buyer Controller:create: body :' + JSON.stringify(req.body));
  let buyer = new Buyer(req.body);
  // check unique email
  const uniqueEmail = await Buyer.findUniqueEmail(buyer.email);
  if (uniqueEmail) {
    req.i18nKey = 'emailExists';
    return res.json(respUtil.getErrorResponse(req));
  }
  buyer = buyerService.setCreateBuyerVaribles(req, buyer);
  req.buyer = await Buyer.save(buyer);
  req.buyer.password = req.buyer.salt = undefined;
  req.entityType = 'buyer';
  req.activityKey = 'buyerCreate';
  req.contextId = req.buyer._id;
  req.contextName = req.buyer.displayName;

  // adding buyer create activity
  activityService.insertActivity(req);

  // converted email to encoded format
  req.enEmail = serviceUtil.encodeString(req.buyer.email);

  // //send email to buyer
  renderEmailTemplateService.setCommonEmailVariables(req, res);
  res.json(respUtil.createSuccessResponse(req));
}

/**
 * Update existing buyer
 * @param req
 * @param res
 * @param next
 * @returns { respCode: respCode, respMessage: respMessage }
 */
async function update(req, res, next) {
  logger.info('Log:Buyer Controller:update: body :' + JSON.stringify(req.body));
  let buyer = req.buyer;
  // check unique email
  if (req.body.email && buyer.email !== req.body.email) {
    const uniqueEmail = await Buyer.findUniqueEmail(req.body.email);
    if (uniqueEmail) {
      req.i18nKey = 'emailExists';
      return res.json(respUtil.getErrorResponse(req));
    }
  }
  if (req.body.address) {
    buyer = await buyerService.updateBuyerDetails(req, buyer);
  };
  // buyer = Object.assign(buyer, req.body);
  if (req.body.type) {
    if (buyer.wallet && req.body.type === "Deduct") {
      if (req.body.wallet && req.body.wallet.BUX && buyer.wallet.BUX && buyer.wallet.BUX > 0 && req.body.wallet.BUX > 0 && buyer.wallet.BUX >= req.body.wallet.BUX) {
        buyer.wallet.BUX -= req.body.wallet.BUX;
        req.buyer = await Buyer.save(buyer);
        req.i18nKey = 'paymentSuccess';
        res.json(respUtil.successResponse(req));
      } else {
        req.i18nKey = 'insufficientBalance'
        res.json(respUtil.getErrorResponse(req))
      }
    } else if (buyer.wallet && req.body.type === "Add") {
      if (req.body.wallet && req.body.wallet.BUX && req.body.wallet.BUX > 0) {

        buyer.wallet.BUX += req.body.wallet.BUX;
        req.buyer = await Buyer.save(buyer);
        if (req.body.paypalInfo) {
          let payment = new Payment();
          payment = await paymentService.setCreatePaymentVaribles(req, payment);
          await Payment.save(payment);
        }
        req.i18nKey = 'walletUpdate';
        res.json(respUtil.successResponse(req));
      } else {
        req.i18nKey = 'inValidAmount'
        res.json(respUtil.getErrorResponse(req))
      }
    }
  } else if (req.body && req.body.status && req.body.status === 'Active') {
    req.i18nKey = 'activateAccount';
    buyer = Object.assign(buyer, req.body);
    buyer = buyerService.setUpdateBuyerVaribles(req, buyer);
    req.buyer = await Buyer.save(buyer);
    req.buyer.password = req.buyer.salt = undefined;
    res.json(respUtil.successResponse(req));
  } else {
    req.entityType = 'buyer';
    req.activityKey = 'buyerUpdate';
    req.contextId = req.buyer._id;
    req.contextName = req.buyer.displayName;

    buyer = buyerService.setUpdateBuyerVaribles(req, buyer);
    buyer = Object.assign(buyer, req.body);
    req.buyer = await Buyer.save(buyer);
    req.buyer.password = req.buyer.salt = undefined;

    // adding buyer update activity
    activityService.insertActivity(req);
    res.json(respUtil.updateSuccessResponse(req));
  }

}

/**
 * Get buyer list. based on criteria
 * @param req
 * @param res
 * @param next
 * @returns {buyers: buyers, pagination: pagination}
 */
async function list(req, res, next) {
  let responseJson = {};
  logger.info('Log:Buyer Controller:list: query :' + JSON.stringify(req.query));
  req.entityType = 'buyer';
  const query = serviceUtil.generateListQuery(req);
  if (query.page === 1) {
    // total count 
    query.pagination.totalCount = await Buyer.totalCount(query);
  }
  //get total buyers
  let buyers = await Buyer.list(query);
  if (buyers.length > 0) {
    for (let buyer of buyers) {
      if (buyer.address && buyer.address.length > 0) {
        buyer['address'].forEach((element, index) => {
          if (element.active === false) {
            delete buyer['address'][index]
          };
        });
        buyer['address'] = buyer['address'].filter(function (item) { return item != null })
      }
    };
  };
  let index;
  if (buyers && buyers.length > 0) {
    for (let buyer of buyers) {
      buyer = await buyerService.getBuyerDetails(buyer);
      index = buyers.indexOf(buyer);
      buyers.splice(index, 1, buyer);
    }
  }
  if (query && query.sortfield && query.sortfield === "totalAmount" || query.sortfield === "noOfProductsBuy") {
    if (query && query.direction && query.direction === "desc") {
      buyers.sort((a, b) => {
        if (query.sortfield) {
          let field = query.sortfield
          return b[field] - a[field];
        }
      })
    }
    if (query && query.direction && query.direction === "asc") {
      buyers.sort((a, b) => {
        if (query.sortfield) {
          let field = query.sortfield;
          return a[field] - b[field];
        }
      })
    }
  }
  responseJson.respCode = respUtil.successResponse(req).respCode;
  responseJson.buyers = buyers;
  responseJson.pagination = query.pagination;
  res.json(responseJson);
}

/**
 * Delete buyer.
 * @param req
 * @param res
 * @param next
 * @returns { respCode: respCode, respMessage: respMessage }
 */
async function remove(req, res, next) {
  logger.info('Log:Buyer Controller:remove: query :' + JSON.stringify(req.query));
  let buyer = req.buyer;
  buyer.active = false;
  buyer = buyerService.setUpdateBuyerVaribles(req, buyer);
  req.buyer = await Buyer.save(buyer);
  req.buyer.password = req.buyer.salt = undefined;
  req.entityType = 'buyer';
  req.activityKey = 'buyerDelete';
  req.contextId = req.buyer._id;
  req.contextName = req.buyer.displayName;

  // adding buyer delete activity
  activityService.insertActivity(req);
  res.json(respUtil.removeSuccessResponse(req));
}

/**
 * Change Password
 * @param req
 * @param res
 */
async function changePassword(req, res) {
  logger.info('Log:Buyer Controller:Change password: body :' + JSON.stringify(req.body));
  let buyerId = '';
  if (req.query && req.query.buyerId) {
    buyerId = req.query.buyerId;
  } else if (req.tokenInfo && req.tokenInfo._id) {
    buyerId = req.tokenInfo._id;
  }
  let passwordDetails = req.body;
  let buyer = await Buyer.get(buyerId);
  // check new password exists
  if (passwordDetails.newPassword) {

    // check current password and new password are same
    if (passwordDetails.currentPassword && (passwordDetails.currentPassword === passwordDetails.newPassword)) {
      req.i18nKey = 'currentOldSameMsg';
      return res.json(respUtil.getErrorResponse(req));
    }
    // authenticate current password
    if (buyer.authenticate(passwordDetails.currentPassword)) {
      if (passwordDetails.newPassword === passwordDetails.confirmPassword) {
        buyer.password = passwordDetails.newPassword;
        req.buyer = await Buyer.save(buyer);
        req.entityType = 'buyer';
        req.activityKey = 'buyerChangePassword';
        req.contextId = req.buyer._id;
        req.contextName = req.buyer.displayName;

        // adding buyer change password activity
        activityService.insertActivity(req);
        req.i18nKey = 'passwordSuccess';
        res.json(respUtil.successResponse(req));
      } else {
        req.i18nKey = 'passwordsNotMatched';
        return res.json(respUtil.getErrorResponse(req));
      }
    } else {
      req.i18nKey = 'currentPasswordError';
      return res.json(respUtil.getErrorResponse(req));
    }
  } else {
    req.i18nKey = 'newPassword';
    return res.json(respUtil.getErrorResponse(req));
  }
}


/**
 * Forgot Password
 * @param req
 * @param res
 */
async function forgotPassword(req, res) {
  logger.info('Log:Buyer Controller:forgotPassword: query :' + JSON.stringify(req.query));
  if (req.query.displayName) {
    let buyer = await Buyer.findUniqueEmail(req.query.displayName);

    if (buyer && buyer.status === config.commonStatus.Inactive) {
      req.i18nKey = 'buyerInactiveStatusMessage';
      return res.json(respUtil.getErrorResponse(req));
    } else if (!buyer) {
      req.i18nKey = 'emailNotExist';
      return res.json(respUtil.getErrorResponse(req));
    }
    req.buyer = buyer;
    req.entityType = 'buyer';
    req.activityKey = 'buyerForgotPassword';
    req.contextId = buyer._id;
    req.contextName = req.buyer.displayName;

    // converted email to encoded format
    req.enEmail = serviceUtil.encodeString(req.buyer.email);

    // adding buyer forgot password activity
    activityService.insertActivity(req);

    //send email to buyer
    renderEmailTemplateService.setCommonEmailVariables(req, res);
    req.i18nKey = 'mailSuccess';
    res.json(respUtil.successResponse(req));
  } else {
    req.i18nKey = 'missingBuyernameParameter';
    return res.json(respUtil.getErrorResponse(req));
  }
}

/**
 * Change recover Password
 * @param req
 * @param res
 */
async function changeRecoverPassword(req, res) {

  if (req.body.enEmail) {
    logger.info('Log:Buyer Controller:changeRecoverPassword: body : ' + req.body.enEmail);
    req.deEmail = serviceUtil.decodeString(req.body.enEmail);
    // converted encode string to decode
    let buyer = await Buyer.findUniqueEmail(req.deEmail);
    req.buyer = buyer;
    // email not exists
    if (!buyer) {
      req.i18nKey = 'emailNotExist';
      return res.json(respUtil.getErrorResponse(req));
    }
    let passwordDetails = req.body;
    // active buyer response
    if (req.query.active) {
      if (buyer.status === config.commonStatus.Active) {
        req.i18nKey = 'buyerAlreadyActivated';
        return res.json(respUtil.getErrorResponse(req));
      } else if (buyer && buyer.status === config.commonStatus.Inactive) {
        req.i18nKey = 'buyerInactiveStatusMessage';
        return res.json(respUtil.getErrorResponse(req));
      } else {
        buyer.activatedDate = dateUtil.getTodayDate();
        buyer.status = config.commonStatus.Active;
      }
    }
    if (passwordDetails.newPassword && !(passwordDetails.newPassword === passwordDetails.confirmPassword)) {
      req.i18nKey = 'passwordsNotMatched';
      return res.json(respUtil.getErrorResponse(req));
    } else if (!passwordDetails.newPassword) {
      req.i18nKey = 'newPassword';
      return res.json(respUtil.getErrorResponse(req));
    }
    buyer.password = passwordDetails.newPassword;
    req.buyer = await Buyer.save(buyer);
    req.activityKey = 'buyerChangePassword';
    req.entityType = 'buyer';
    req.contextId = req.buyer._id;
    req.contextName = req.buyer.displayName;
    req.i18nKey = 'passwordSuccess';

    // adding buyer Change recover password activity
    activityService.insertActivity(req);

    // remove exisisting token and save new token
    await tokenService.removeTokenAndSaveNewToken(req);
    res.json(respUtil.successResponse(req));
  }
}

/**
 * change Buyer profilePucture
 * @param req
 * @param res
 */
async function changeProfilePicture(req, res, next) {
  logger.info('Log:Buyer Controller :Change Buyer logo:body:' + JSON.stringify(req.body));
  let buyer = req.buyer;
  req.uploadFile = [];
  req.uploadPath = 'buyer';

  //Calling the activity of uploading the required file
  uploadeService.upload(req, res, (err) => {
    if (err) {
      logger.error('Error:Buyer Controller: Change Buyer Logo: Error:' + JSON.stringify(err));
      req.i18nKey = "uploadDirectoryNotFound";
      res.json(respUtil.getErrorResponse(req));
    } else if (req.uploadFile && req.uploadFile[0] && req.uploadFile[0].name) {
      req.image = req.uploadFile[0].name;
      buyer.photo = req.uploadFile[0].name;

      //Saving the changes of the buyer
      req.buyer = Buyer.save(buyer)
      req.entityType = 'buyer';
      req.activityKey = 'buyerUpload';
      req.contextId = req.buyer._id;
      req.contextName = req.buyer.displayName;

      //adding buyer logo activity
      activityService.insertActivity(req);
      res.json(respUtil.uploadLogoSucessResponse(req))
    } else {
      req.i18nKey = 'buyerLogoUploadedErrorMessage';
      logger.error('Error:Buyer Buyer:Change Buyer Logo: Error : Buyer Logo not uploded.');
      res.json(respUtil.getErrorResponse(req));
    }
  })
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
  changeProfilePicture,
};