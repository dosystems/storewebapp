import UserPromocode from '../models/userpromocode.model';
import Promocode from '../models/promocode.model';
import sessionUtil  from '../utils/session.util';

/**
 * set userpromocode variables
 * @returns {userpromocode}
 */

function setUserPromoCodeCreateVaribles(req, res, userpromocode) {
  if (req.body && req.body.promoCode) {
    userpromocode.promoCode = req.body.promoCode;
  }
  if (req.user) {
    if (req.user.displayName) {
      userpromocode.userName = req.user.displayName;
    }
    if (req.user.email) {
      userpromocode.email = req.user.email;
    }
    if (req.user.phone) {
      userpromocode.phone = req.user.phone;
    }
    if (req.user._id) {
      userpromocode.userId = req.user._id;
    }
  }
  return userpromocode;
}

/**
 * set userpromocode update variables
 * @returns {userpromocode}
 */

function setUserPromoCodeUpdateVaribles(req, userpromocode) {
  if (req.tokenInfo) {
    userpromocode.updatedBy.employee = sessionUtil.getSessionLoginID(req);
  }
  userpromocode.updated = Date.now();
  return userpromocode;
}

//saving promocode used details in userpromocode when order placed
async function createUserPromocode(order){
  let userpromocode = new UserPromocode();
  userpromocode.promocode = order.promocode;
  userpromocode.userId = order.userId;
  userpromocode.userName = order.userName;
  userpromocode.email = order.email;
  userpromocode.phone = order.shipmentAddress.phone;
  await UserPromocode.save(userpromocode);
  let promocode = await Promocode.get(order.promocodeId)
  if(promocode){
    promocode.maxNoOfUsersUsedTillNow = promocode.maxNoOfUsersUsedTillNow + 1;
    await Promocode.save(promocode)
  }
  return;
}

export default {
  setUserPromoCodeCreateVaribles,
  setUserPromoCodeUpdateVaribles,
  createUserPromocode
};
