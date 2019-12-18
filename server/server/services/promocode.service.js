import config from '../config/config';

import Promocode from '../models/promocode.model';
import Buyer from '../models/buyer.model';
import UserPromocode from '../models/userpromocode.model';

import dateUtil from '../utils/date.util';
import serviceUtil from '../utils/service.util';
import sessionUtil from '../utils/session.util';

/**
 * set promocode variables
 * @returns {promocode}
 */

async function setPromoCodeCreateVaribles(req, res, promocode) {
  promocode.promoCode = promocode.promoCode.toLowerCase();
  // set unique promocode id
  promocode.promoCodeUniqueId = serviceUtil.generateRandom() + 'OFF';
  let pc = await Promocode.findPromoCodeUniqueId(promocode.promoCodeUniqueId);
  while (pc) {
    promocode.promoCodeUniqueId = serviceUtil.generateRandom() + 'OFF';
    pc = await Promocode.findPromoCodeUniqueId(promocode.promoCodeUniqueId);
  }
  promocode.status = config.commonStatus.Disabled;
  if (req.tokenInfo) {
    promocode.createdBy.employee = sessionUtil.getSessionLoginID(req);
  }
  // if (promocode.promoType === 'discount') {
  //   setCouponCreateVariables(req, promocode);
  //   await stripeService.createCoupon(req, res);
  // }
  return promocode;
}

/**
 * set promocode update variables
 * @returns {promocode}
 */

function setPromoCodeUpdateVaribles(req, promocode) {
  promocode.promoCode = promocode.promoCode.toLowerCase();
  if (req.tokenInfo) {
    promocode.updatedBy.employee = sessionUtil.getSessionLoginID(req);
  }
  promocode.updated = Date.now();
  return promocode;
}

/**
 * is promo code is valid or not
 * @returns {promocode}
 */

async function isPromoCodeValidOrNot(req) {
  if (req.tokenInfo) {
    // retrieve buyer details
    req.buyer = await Buyer.get(sessionUtil.getSessionLoginID(req));
  } else {
    logger.info('Info:PromoCode service:isPromoCodeValidOrNot: buyer not found');
    req.prmoCodeIsNotValid = true;
    return;
  }

  let userPromoCodeData = await UserPromocode.findPromoCodeByUserId(req.buyer._id, req.promocode.promoCode);
  // check promo code is valid or not based on conditions
  // check max number of buyers used or not more than limit
  if (userPromoCodeData) {
    logger.info('Info:PromoCode service:isPromoCodeValidOrNot: Already used this promo code');

    // This promo code is already used by this buyer.
    req.prmoCodeIsNotValid = true;
    req.i18nKey = "promocodeAlreadyUsed";
    return req;
  } else if (req.promocode && req.promocode.status === config.commonStatus.Disabled) {

    logger.info('Info:PromoCode service:isPromoCodeValidOrNot: promo code is disabled');
    // check  promo code is disabled or not
    req.prmoCodeIsNotValid = true;
    req.i18nKey = 'promoCodeNotValid';
    return;
  } else if (req.promocode && req.promocode.maxNoOfUsersUsedTillNow >= req.promocode.maxUsersLimitToUse) {
    logger.info('Info:PromoCode service:isPromoCodeValidOrNot: Max Limit is reached');
    // check Max Limit is reached or not 
    req.prmoCodeIsNotValid = true;
    req.i18nKey = 'promoCodeNotValid';
    return;
  } else if (req.promocode && req.promocode.promoCodeStartDate && dateUtil.getTimestampDate(dateUtil.formatUtcDate(req.promocode.promoCodeStartDate)) > dateUtil.getTimestampDate(dateUtil.formatUtcDate(new Date()))) {
    logger.info('Info:PromoCode service:isPromoCodeValidOrNot: not able to use this because start date for this promo code.');
    // check promo code expiration date 
    req.prmoCodeIsNotValid = true;
    req.i18nKey = 'promoCodeNotValid';
    return;
  } else if (req.promocode && req.promocode.promoCodeEndDate && dateUtil.getTimestampDate(dateUtil.formatUtcDate(req.promocode.promoCodeEndDate)) < dateUtil.getTimestampDate(dateUtil.formatUtcDate(new Date()))) {
    logger.info('Info:PromoCode service:isPromoCodeValidOrNot: Expired promo code');

    // check promo code expiration date 
    req.prmoCodeIsNotValid = true;
    req.i18nKey = 'promoCodeExpired';
    return;
  } else if (req.promocode && req.promocode.minPurchaseValue && req.query.defaultPrice && req.promocode.minPurchaseValue > req.query.defaultPrice) {
    logger.info('Info:PromoCode service:isPromoCodeValidOrNot:  promo code not applicable');

    // check promo code expiration date 
    req.prmoCodeIsNotValid = true;
    req.i18nKey = 'promoCodeNotValid';
    return;
  } else if (req.promocode && req.promocode.toNewOrOldUsers && req.promocode.toNewOrOldUsers.length === 1 && req.promocode.toNewOrOldUsers.indexOf('Old') > -1 && req.buyer.isFirstPurchaseComplete) {
    logger.info('Info:PromoCode service:isPromoCodeValidOrNot: Valid for only new buyers.');
    // check for promo code is valid for only New buyers
    req.prmoCodeIsNotValid = true;
    req.i18nKey = 'promoCodeNotValid';
    return;
  } 
  //  else if (req.promocode && req.promocode.toNewOrOldUsers && req.promocode.toNewOrOldUsers.length === 1 && req.promocode.toNewOrOldUsers.indexOf('New') > -1 && !sessionUtil.getSessionLoginID(req)) {
  //   logger.info('Info:PromoCode service:isPromoCodeValidOrNot: Valid for only old buyers.');

  //   // check for promo code is valid for only old buyers
  //   req.prmoCodeIsNotValid = true;
  //   req.i18nKey = 'promoCodeNotValid';
  //   return;
  // } 
  // else {
  //   if (req.buyer) {

  //     // saving promo code to buyer 
  //     req.buyer.promoCode = req.promocode.promoCode;
  //     req.buyer = await Buyer.save(req.user);
  //   }
  // }
  req.details = req.promocode;
}

export default {

  isPromoCodeValidOrNot,
  // setCouponCreateVariables,
  setPromoCodeCreateVaribles,
  setPromoCodeUpdateVaribles
};
