import config from '../config/config';

import Buyer from '../models/buyer.model';
import Entity from '../models/entity.model';
import Order from '../models/order.model';
import Review from '../models/review.model';
import Seller from '../models/seller.model';

import activityService from '../services/activity.service';
import renderEmailTemplateService from '../services/renderEmailTemplate.service';
import sellerService from '../services/seller.service';
import tokenService from '../services/token.service';
import shipmentService from '../services/shipment.service'
import uploadeService from '../services/upload.service';

import respUtil from '../utils/resp.util';
import i18nUtil from '../utils/i18n.util';
import serviceUtil from '../utils/service.util';
/**
 * Load seller and append to req.
 * @param req
 * @param res
 * @param next
 */
async function load(req, res, next) {
  req.seller = await Seller.get(req.params.sellerId);
  return next();
}

/**
 * Get seller
 * @param req
 * @param res
 * @returns {details: Seller}
 */
async function get(req, res) {
  logger.info('Log:Seller Controller:get: query :' + JSON.stringify(req.query));
  let seller = req.seller;
  seller.password = seller.salt = undefined;
  seller = await sellerService.getSellerDetails(seller);
  let responseJson = {
    respCode: respUtil.successResponse(req).respCode,
    details: seller
  };
  res.json(responseJson);
}

/**
 * Create new seller
 * @param req
 * @param res
 * @returns { respCode: respCode, respMessage: respMessage }
 */
async function create(req, res) {
  logger.info('Log:Seller Controller:create: body :' + JSON.stringify(req.body));
  let seller = new Seller(req.body);
  // check unique email
  const uniqueEmail = await Seller.findUniqueEmail(seller.email);
  if (uniqueEmail) {
    req.i18nKey = 'emailExists';
    return res.json(respUtil.getErrorResponse(req));
  }
  seller = sellerService.setCreateSellerVaribles(req, seller);
  req.seller = await Seller.save(seller);
  await sellerService.generateSettings(req);
  req.seller.password = req.seller.salt = undefined;
  req.entityType = 'seller';
  req.activityKey = 'sellerCreate';
  req.contextId = req.seller._id;
  req.contextName = req.seller.displayName;

  // adding seller create activity
  activityService.insertActivity(req);

  // converted email to encoded format
  req.enEmail = serviceUtil.encodeString(req.seller.email);

  //send email to seller
  renderEmailTemplateService.setCommonEmailVariables(req, res);
  res.json(respUtil.createSuccessResponse(req));
}

/**
 * Update existing seller
 * @param req
 * @param res
 * @param next
 * @returns { respCode: respCode, respMessage: respMessage }
 */
async function update(req, res, next) {
  logger.info('Log:Seller Controller:update: body :' + JSON.stringify(req.body));
  let seller = req.seller;
  if (req.tokenInfo && req.tokenInfo.loginType === config.commonRole.employee) {
    req.activityKey = 'sellerApproval';
    req.entityType = 'seller';
    if (req.query && req.query.type && req.query.type === config.commonStatus.Verified) {
      seller.status = config.commonStatus.Verified;
      delete req.body.status;
      renderEmailTemplateService.setCommonEmailVariables(req, res);
    } else if (req.query && req.query.type && req.query.type === config.commonStatus.Rejected) {
      seller.status = config.commonStatus.Rejected;
      delete req.body.status;
      renderEmailTemplateService.setCommonEmailVariables(req, res);
    } else if (req.query && req.query.type && req.query.type === config.commonStatus.Blocked) {
      seller.status = config.commonStatus.Blocked;
      delete req.body.status;
      renderEmailTemplateService.setCommonEmailVariables(req, res);
    }

  }

  // check unique email
  if (req.body.email && seller.email !== req.body.email) {
    const uniqueEmail = await Seller.findUniqueEmail(req.body.email);
    if (uniqueEmail) {
      req.i18nKey = 'emailExists';
      return res.json(respUtil.getErrorResponse(req));
    }
  }
  seller = Object.assign(seller, req.body);
  req.entityType = 'seller';
  req.activityKey = 'sellerUpdate';
  req.contextId = req.seller._id;
  req.contextName = req.seller.displayName;

  seller = sellerService.setUpdateSellerVaribles(req, seller);
  req.seller = await Seller.save(seller);
  req.seller.password = req.seller.salt = undefined;

  // adding seller update activity
  activityService.insertActivity(req);
  res.json(respUtil.updateSuccessResponse(req));
}

/**
 * Get seller list. based on criteria
 * @param req
 * @param res
 * @param next
 * @returns {sellers: sellers, pagination: pagination}
 */
async function list(req, res, next) {
  let responseJson = {};
  logger.info('Log:Seller Controller:list: query :' + JSON.stringify(req.query));
  req.entityType = 'seller';
  const query = serviceUtil.generateListQuery(req);
  if (query.page === 1) {
    // total count 
    query.pagination.totalCount = await Seller.totalCount(query);
  }
  //get total sellers
  const sellers = await Seller.list(query);
  let index;
  if (sellers && sellers.length > 0) {
    for (let seller of sellers) {
      seller = await sellerService.getSellerDetails(seller);
      index = sellers.indexOf(seller);
      sellers.splice(index, 1, seller);
    }
  }
  if (query && query.sortfield && query.sortfield === "totalAmount" || query.sortfield === "noOfProducts") {
    if (query && query.direction && query.direction === "desc") {
      sellers.sort((a, b) => {
        if (query.sortfield) {
          let field = query.sortfield
          return b[field] - a[field];
        }
      })
    }
    if (query && query.direction && query.direction === "asc") {
      sellers.sort((a, b) => {
        if (query.sortfield) {
          let field = query.sortfield
          return a[field] - b[field];
        }
      })
    }
  }
  responseJson.respCode = respUtil.successResponse(req).respCode;
  responseJson.sellers = sellers;
  responseJson.pagination = query.pagination;
  res.json(responseJson);
}

/**
 * Delete seller.
 * @param req
 * @param res
 * @param next
 * @returns { respCode: respCode, respMessage: respMessage }
 */
async function remove(req, res, next) {
  logger.info('Log:Seller Controller:remove: query :' + JSON.stringify(req.query));
  let seller = req.seller;
  seller.active = false;
  seller = sellerService.setUpdateSellerVaribles(req, seller);
  req.seller = await Seller.save(seller);
  req.seller.password = req.seller.salt = undefined;
  req.entityType = 'seller';
  req.activityKey = 'sellerDelete';
  req.contextId = req.seller._id;
  req.contextName = req.seller.displayName;

  // adding seller delete activity
  activityService.insertActivity(req);
  res.json(respUtil.removeSuccessResponse(req));
}

async function activate(req, res, next) {
  logger.info('Log:Seller Controller:update: body :' + JSON.stringify(req.body));
  let seller = req.seller;
  if (req.query && req.query.type && req.query.type === 'accountActivation') {
    seller.status = config.commonStatus.NotVerified;
    req.i18nKey = 'activationPending';
    seller = sellerService.setUpdateSellerVaribles(req, seller);
    req.seller = await Seller.save(seller);
    req.seller.password = req.seller.salt = undefined;
    res.json(respUtil.successResponse(req));
  }
}


/**
 * Change Password
 * @param req
 * @param res
 */
async function changePassword(req, res) {
  logger.info('Log:Seller Controller:Change password: body :' + JSON.stringify(req.body));
  let sellerId = '';
  if (req.query && req.query.sellerId) {
    sellerId = req.query.sellerId;
  } else if (req.tokenInfo && req.tokenInfo._id) {
    sellerId = req.tokenInfo._id;
  }
  let passwordDetails = req.body;
  let seller = await Seller.get(sellerId);
  // check new password exists
  if (passwordDetails.newPassword) {

    // check current password and new password are same
    if (passwordDetails.currentPassword && (passwordDetails.currentPassword === passwordDetails.newPassword)) {
      req.i18nKey = 'currentOldSameMsg';
      return res.json(respUtil.getErrorResponse(req));
    }
    // authenticate current password
    if (seller.authenticate(passwordDetails.currentPassword)) {
      if (passwordDetails.newPassword === passwordDetails.confirmPassword) {
        seller.password = passwordDetails.newPassword;
        req.seller = await Seller.save(seller);
        req.entityType = 'seller';
        req.activityKey = 'sellerChangePassword';
        req.contextId = req.seller._id;
        req.contextName = req.seller.displayName;

        // adding seller change password activity
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
  logger.info('Log:Seller Controller:forgotPassword: query :' + JSON.stringify(req.query));
  if (req.query.displayName) {
    let seller = await Seller.findUniqueEmail(req.query.displayName);
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
    } else if (!seller) {
      req.i18nKey = 'emailNotExist';
      return res.json(respUtil.getErrorResponse(req));
    }
    req.seller = seller;
    req.entityType = 'seller';
    req.activityKey = 'sellerForgotPassword';
    req.contextId = seller._id;

    // converted email to encoded format
    req.enEmail = serviceUtil.encodeString(req.seller.email);

    // adding seller forgot password activity
    activityService.insertActivity(req);

    //send email to seller
    renderEmailTemplateService.setCommonEmailVariables(req, res);
    req.i18nKey = 'mailSuccess';
    res.json(respUtil.successResponse(req));
  } else {
    req.i18nKey = 'missingSellernameParameter';
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
    logger.info('Log:Seller Controller:changeRecoverPassword: body : ' + req.body.enEmail);
    req.deEmail = serviceUtil.decodeString(req.body.enEmail);
    // converted encode string to decode
    let seller = await Seller.findUniqueEmail(req.deEmail);
    req.seller = seller;
    // email not exists
    if (!seller) {
      req.i18nKey = 'emailNotExist';
      return res.json(respUtil.getErrorResponse(req));
    }
    let passwordDetails = req.body;
    // active seller response
    if (req.query.active) {
      if (seller.status === config.commonStatus.Active) {
        req.i18nKey = 'sellerAlreadyActivated';
        return res.json(respUtil.getErrorResponse(req));
      } else if (seller && seller.status === config.commonStatus.Inactive) {
        req.i18nKey = 'sellerInactiveStatusMessage';
        return res.json(respUtil.getErrorResponse(req));
      } else {
        seller.activatedDate = dateUtil.getTodayDate();
        seller.status = config.commonStatus.Active;
      }
    }
    if (passwordDetails.newPassword && !(passwordDetails.newPassword === passwordDetails.confirmPassword)) {
      req.i18nKey = 'passwordsNotMatched';
      return res.json(respUtil.getErrorResponse(req));
    } else if (!passwordDetails.newPassword) {
      req.i18nKey = 'newPassword';
      return res.json(respUtil.getErrorResponse(req));
    }
    seller.password = passwordDetails.newPassword;
    req.seller = await Seller.save(seller);
    req.activityKey = 'sellerChangePassword';
    req.entityType = 'seller';
    req.contextId = req.seller._id;
    req.contextName = req.seller.displayName;
    req.i18nKey = 'passwordSuccess';

    // adding seller Change recover password activity
    activityService.insertActivity(req);

    // remove exisisting token and save new token
    await tokenService.removeTokenAndSaveNewToken(req);
    res.json(respUtil.successResponse(req));
  }
}

/**
 * change Seller profilePucture
 * @param req
 * @param res
 */
async function uploadAttachments(req, res, next) {
  logger.info('Log:Seller Controller :Change Seller logo:body:' + JSON.stringify(req.body));
  if (req.query.id) {
    req.seller = await Seller.get(req.query.id);
  }
  req.uploadFile = [];
  req.uploadPath = 'seller';

  //Calling the activity of uploading the required file

  uploadeService.upload(req, res, async (err) => {
    if (err) {
      logger.error('Error:Seller Controller: Change Seller Logo: Error:' + JSON.stringify(err));
      req.i18nKey = "uploadDirectoryNotFound";
      res.json(respUtil.getErrorResponse(req));
    } else if (req.uploadFile && req.uploadFile[0] && req.uploadFile[0].name) {
      if (req.query && req.query.type && req.query.type === 'logo') {
        req.image = req.uploadFile[0].name;
        req.seller.logo = req.uploadFile[0].name;
      } else if (req.query && req.query.type && req.query.type === 'profilePicture') {
        req.image = req.uploadFile[0].name;
        req.seller.photo = req.uploadFile[0].name;
      } else if (req.query && req.query.type && req.query.type === 'documents') {
        req.image = req.uploadFile;
      }
      //Saving the changes of the seller
      if (req.seller) {
        req.seller = await Seller.save(req.seller)
        req.entityType = 'seller';
        req.activityKey = 'sellerUpload';
        req.contextId = req.seller._id;
        req.contextName = req.seller.displayName;
        //adding seller logo activity
        activityService.insertActivity(req);
      }
      setTimeout(function () {
        res.json(respUtil.uploadLogoSucessResponse(req));
      }, 3000);
    } else {
      req.i18nKey = 'sellerLogoUploadedErrorMessage';
      logger.error('Error:Seller Seller:Change Seller Logo: Error : Seller Logo not uploded.');
      res.json(respUtil.getErrorResponse(req));
    }
  })
};
async function getBuyersList(req, res) {
  let responseJson = {};
  logger.info('Log:Seller Controller:getBuyersList: query :' + JSON.stringify(req.query));
  let query = serviceUtil.generateListQuery(req)
  let buyersIds = await Order.distinct("userId", {
    ownerId: req.tokenInfo._id, status: {
      $nin: [
        config.orderStatus.addToCart,
        config.orderStatus.cancelled,
        config.orderStatus.refunded,
        config.orderStatus.returned
      ]
    }
  });
  //let buyers = [];
  let buyers = await Buyer.aggregate([{
    $match: {
      _id: { $in: buyersIds }
    }
  }, {
    $sort: query.sorting
  }
  ])

  // Regex serach for the buyers Name filed
  if (req.query && req.query.filter) {
    // if (query.filter && query.filter.email) {
    //   let field = query.filter.email.$regex;
    //   let regex = new RegExp(`\\b${field}`, 'i')
    //   buyers = buyers.filter(({ email }) => email.match(regex));
    // }
    // if (query.filter && query.filter.firstName) {
    //   let field = query.filter.firstName.$regex;
    //   let regex = new RegExp(`\\b${field}`, 'i')
    //   buyers = buyers.filter(({ firstName }) => firstName.match(regex));
    // }
    // if (query.filter && query.filter.lastName) {
    //   let field = query.filter.lastName.$regex;
    //   let regex = new RegExp(`\\b${field}`, 'i')
    //   buyers = buyers.filter(({ lastName }) => lastName.match(regex));
    // }
    if (query.filter && query.filter) {
      let field;
      if (query.filter.phoneNumber) {
        field = "phoneNumber"
      } else if (query.filter.firstName) {
        field = "firstName"
      } else if (query.filter.lastName) {
        field = "lastName"
      } else if (query.filter.email) {
        field = "email"
      }
      let array = [];
      let count = 0;
      for (let buyer of buyers) {
        if (buyer[field] && query.filter[field]) {
          let regex = new RegExp(`\\b${query.filter[field].$regex}`, 'i')
          if (buyer[field].match(regex)) {
            array.push(buyer)
          } else {
            count++;
          }
        }
      }
      if (count > 0) {
        buyers = array;
      }
    }
  }
  let totalCount = buyers.length;
  responseJson.respCode = respUtil.successResponse(req).respCode;
  responseJson.buyers = buyers.splice((query.page - 1) * (query.limit), query.limit)
  responseJson.pagination = {};
  responseJson.pagination.totalCount = totalCount;

  //get total sellers

  res.json(responseJson);
}


/**
 * getReports
 * @param {*} req 
 * @param {*} res 
 */
async function getReports(req, res) {
  let responseJson = {}
  let query = sellerService.getReportDetails(req);
  responseJson.productWiseSalesReport = await Order.getAggregateResult(query.productWiseSalesReportQuery);
  responseJson.itemsToBeShipped = await Order.getAggregateResult(query.itemsToBeShippedQuery);
  responseJson.itemsDelivered = await Order.getAggregateResult(query.itemsDeliveredQuery);
  res.json(responseJson);
}
/**
 * get reviews list for seller
 * @param {*} req 
 * @param {*} res 
 */
async function getReviews(req, res) {
  let responseJson = {};
  let query = serviceUtil.generateListQuery(req)

  let entities = await Entity.list(query);
  if (entities && entities.length > 0) {
    let reviewQuery = {
      filter: {
        active: true
      }
    };
    let reviews = [];
    for (let entity of entities) {
      reviewQuery.filter.entityId = entity._id;
      let productReviews = await Review.list(reviewQuery);
      if (productReviews && productReviews.length > 0) {
        for (let productReview of productReviews) {
          reviews.push(productReview);
        }
      }
    }
    reviews.sort(function (a, b) {
      let d1 = new Date(a.created);
      let d2 = new Date(b.created);
      return d2 - d1;
    });
    responseJson.reviews = reviews.splice(0, 5);
  }
  res.json(responseJson);
}

/**
 * sales Summary 
 */

async function getSalesSummary(req, res) {
  const query = serviceUtil.generateListQuery(req);
  let salesSummaryQuery = sellerService.getSalesSummaryQuery(req)
  let orders = await Order.aggregate(salesSummaryQuery);
  if (orders && orders.length > 0) {
    orders.sort((a, b) => {
      return b.dates > a.dates;
    })
  }
  if (query && query.sortfield && query.sortfield === "totalAmount" || query.sortfield === "totalQuantity" || query.sortfield === "dates") {
    if (query && query.direction && query.direction === "desc") {
      buyers.sort((a, b) => {
        if (query.sortfield === "dates") {
          return b.dates > a.dates;
        } else {
          let field = query.sortfield
          return b[field] - a[field];
        }
      })
    }
    if (query && query.direction && query.direction === "asc") {
      buyers.sort((a, b) => {
        if (query.sortfield === "dates") {
          return a.date > b.dates;
        } else {
          let field = query.sortfield;
          return a[field] - b[field];
        }
      })
    }
  }
  res.json(orders)
}
async function getshipmentRates(req, res) {
  let responseData = await shipmentService.shipmentRates(req);
  if (req.err) {
    res.json(responseData)
  } else if (responseData) {
    res.json({ shipmentRates: responseData })
  }
}
export default {
  load,
  get,
  create,
  update,
  list,
  remove,
  activate,
  changePassword,
  forgotPassword,
  changeRecoverPassword,
  uploadAttachments,
  getBuyersList,
  getReports,
  getReviews,
  getSalesSummary,
  getshipmentRates
};