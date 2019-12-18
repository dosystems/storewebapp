import session from '../utils/session.util';
import Entity from '../models/entity.model';
import config from '../utils/activity.util';
/**
 * set Payment variables
 * @returns {Payment}
 */
async function setCreatePaymentVaribles(req, payment) {
  if (req.tokenInfo) {
    payment.createdBy[req.tokenInfo.loginType] = session.getSessionLoginID(req);
    payment.createdBy.name = session.getSessionLoginName(req);
  } else {
    if(req.buyer){
      payment.createdBy.buyer = req.buyer._id;
      payment.createdBy.name = req.buyer.displayName
    }
    
  }
  if(req.body.paypalInfo){
    payment.payId = req.body.paypalInfo.id;
    payment.payer = req.body.paypalInfo.payer;
    payment.created = req.body.paypalInfo["create_time"];
    payment.state = req.body.paypalInfo.state;
    payment.transactions = req.body.paypalInfo.transactions;
  }
  return payment;
};

/**
 * set Payment update variables
 * @returns {Payment}
 */
function setUpdatePaymentVaribles(req, payment) {
  payment.updated = Date.now();
  if (req.tokenInfo) {
    payment.updatedBy[req.tokenInfo.loginType] = session.getSessionLoginID(req);
    payment.createdBy.name = session.getSessionLoginName(req);
  };
  return payment;
};

export default {
  setCreatePaymentVaribles,
  setUpdatePaymentVaribles
};
