import Exchangerates from '../models/exchangerates.model';
import Promocode from '../models/promocode.model';

import activityService from '../services/activity.service';
import promocodeService from '../services/promocode.service';
import uploadService from '../services/upload.service';

import respUtil from '../utils/resp.util';
import serviceUtil from '../utils/service.util';

/**
 * Load promocode and append to req.
 * @param req
 * @param res
 * @param next
 */
async function load(req, res, next) {
  req.promocode = await Promocode.get(req.params.promocodeId);
  return next();
}

/**
 * Get promocode
 * @param req
 * @param res
 * @returns {promocode}
 */
async function get(req, res) {
  logger.info('Log:promocode Controller:get: query :' + JSON.stringify(req.query));
  return res.json({
    details: req.promocode
  });
}

/**
 * Create new promocode
 * @param req
 * @param res
 * @returns { respCode: respCode, respMessage: respMessage }
 */
async function create(req, res) {
  logger.info('Log:promocode Controller:create: body :' + JSON.stringify(req.body));
  let promocode = new Promocode(req.body);

  // check unique promo code
  const uniquePromocode = await Promocode.findUniquePromoCode(promocode.promoCode);
  if (uniquePromocode) {
    req.i18nKey = 'promoCodeExists';
    return res.json(respUtil.getErrorResponse(req));
  }

  // set promo code create varialbes
  promocode = await promocodeService.setPromoCodeCreateVaribles(req, res, promocode);
  req.promocode = await Promocode.save(promocode);
  req.entityType = 'promocode';
  req.activityKey = 'promocodeCreate';
  activityService.insertActivity(req);
  return res.json(respUtil.createSuccessResponse(req));
}

/**
 * Update existing promocode
 * @param req
 * @param res
 * @param next
 * @returns { respCode: respCode, respMessage: respMessage }
 */
async function update(req, res, next) {
  logger.info('Log:promocode Controller:update: body :' + JSON.stringify(req.body));
  let promocode = req.promocode;

  // check unique promo code
  if (req.body.promoCode && promocode.promoCode !== req.body.promoCode) {
    const uniquePromocode = await Promocode.findUniquePromoCode(req.body.promoCode);
    if (uniquePromocode) {
      req.i18nKey = 'promoCodeExists';
      return res.json(respUtil.getErrorResponse(req));
    }
  }
  promocode = Object.assign(promocode, req.body);

  // set promo code update varialbes
  promocode = promocodeService.setPromoCodeUpdateVaribles(req, promocode);
  req.promocode = await Promocode.save(promocode);
  req.entityType = 'promocode';
  req.activityKey = 'promocodeUpdate';
  activityService.insertActivity(req);
  return res.json(respUtil.updateSuccessResponse(req));
}

/**
 * Get promocodes list. based on criteria
 * @param req
 * @param res
 * @param next
 * @returns {promocodes: promocodes, pagination: pagination}
 */
async function list(req, res, next) {
  let responseJson = {};
  logger.info('Log:promocode Controller:list: query :' + JSON.stringify(req.query));
  // req.entityType = "promocode";
  const query = serviceUtil.generateListQuery(req);
  if (query.page === 1) {

    // total count 
    query.pagination.totalCount = await Promocode.totalCount(query);
  }

  //get total promocodes
  const promocodes = await Promocode.list(query);
  responseJson.respCode = respUtil.successResponse(req).respCode;
  responseJson.promocodes = promocodes;
  responseJson.pagination = query.pagination;
  res.json(responseJson);
}

/**
 * Delete promocode.
 * @param req
 * @param res
 * @param next
 * @returns { respCode: respCode, respMessage: respMessage }
 */
async function remove(req, res, next) {
  logger.info('Log:promocode Controller:remove: body :' + JSON.stringify(req.body));
  let promocode = req.promocode;
  promocode.active = false;
  promocode = promocodeService.setPromoCodeUpdateVaribles(req, promocode);
  req.promocode = await Promocode.save(promocode);
  req.entityType = 'promocode';
  req.activityKey = 'promocodeDelete';
  activityService.insertActivity(req);
  return res.json(respUtil.removeSuccessResponse(req));
}

/**
 * Check promo code is valid or not
 * @param req
 * @param res
 * @returns { respCode: respCode, respMessage: respMessage }
 */
async function checkPromoCodeIsValidOrNot(req, res) {
  logger.info('Log:promocode Controller:checkPromoCodeIsValidOrNot: query :' + JSON.stringify(req.query));
  let responseJson = {}
  req.query.promoCode = req.query.promoCode.toLowerCase();
  // check promo code
  req.promocode = await Promocode.findUniquePromoCode(req.query.promoCode);
  if (!req.promocode) {
    req.i18nKey = 'promoCodeNotValid';
    return res.json(respUtil.getErrorResponse(req));
  }

  // entered promocode valid or not check on db
  await promocodeService.isPromoCodeValidOrNot(req);
  req.entityType = 'promocode';
  if (req.prmoCodeIsNotValid) {
    req.activityKey = 'promoCodeNotValid';
    activityService.insertActivity(req);
    return res.json(respUtil.getErrorResponse(req));
  } else {
    req.i18nKey = 'promoCodeValid';
    req.activityKey = 'promoCodeValid';
    activityService.insertActivity(req);
    responseJson.respCode = respUtil.successResponse(req).respCode;
    responseJson.respMessage = respUtil.successResponse(req).respMessage;
    responseJson.promocodeId = req.promocode.promoCodeUniqueId;
    if (req.query.selectPrice && req.query.defaultPrice && req.query.selectedCurrency) {
      let exchangerates = await Exchangerates.find({ active: true });
      if (req.promocode.promoType && req.promocode.promoType === "Discount") {
        if (req.promocode.discountPercentage) {
          responseJson.disountOnSelectedPrice = parseFloat(((req.query.selectPrice * req.promocode.discountPercentage) / 100).toFixed(2));
          responseJson.discountOnDefaultPrice = parseFloat(((req.query.defaultPrice * req.promocode.discountPercentage) / 100).toFixed(2));
          if (req.promocode.maxDiscountAmount && responseJson.discountOnDefaultPrice > req.promocode.maxDiscountAmount) {
            responseJson.discountOnDefaultPrice = req.promocode.maxDiscountAmount;
            for (let rates of exchangerates) {
              if (rates.pair === "BUX/" + req.query.selectedCurrency) {
                responseJson.disountOnSelectedPrice = parseFloat((req.promocode.maxDiscountAmount * rates.buyRate).toFixed(2));
              }
            }
          }
        }
      } else if (req.promocode.promoType && req.promocode.promoType === "FreeShipping") {
        responseJson.shippingRates = 0;
        responseJson.shippingRatesInBUX = 0;
      } else if (req.promocode.promoType && req.promocode.promoType === "Cashback") {
        if (req.promocode.minPurchaseValue && req.query.defaultPrice >= req.promocode.minPurchaseValue) {
          responseJson.cashBackInBUX = parseFloat(((req.query.defaultPrice * req.promocode.discountPercentage) / 100).toFixed(2));
          if (responseJson.cashBackInBUX && req.promocode.maxDiscountAmount && responseJson.cashBackInBUX > req.promocode.maxDiscountAmount) {
            responseJson.cashBackInBUX = req.promocode.maxDiscountAmount;
          }
        }
      }
    }

    responseJson.promoType = req.promocode.promoType;
    // responseJson.disountOnSelectedPrice = req.disountOnSelectPrice;
    // responseJson.discountOnDefaultPrice = req.discountOnDefaultPrice;

    return res.json(responseJson);
  }
}

export default {
  load,
  get,
  create,
  update,
  list,
  remove,
  checkPromoCodeIsValidOrNot
};
