import config from '../config/config';

import Activity from '../models/activity.model';
import Buyer from '../models/buyer.model';
import Seller from '../models/seller.model';
import ActivityUtil from '../utils/activity.util';
import session from '../utils/session.util';

/**
 * set activity variables
 * @returns {activity}
 */
function setActivityVaribles(req, activity) {
  if (req.tokenInfo) {
    activity.createdBy[req.tokenInfo.loginType] = session.getSessionLoginID(req);
    activity.createdBy.name = session.getSessionLoginName(req);
  };

  return activity;
};

/**
 * insert activity
 * @returns {activity}
 */
async function insertActivity(req) {
  let activityConfig = ActivityUtil.activityConfig;
  let activity = new Activity(activityConfig[req.activityKey]);
  if (req.contextId) {
    activity.contextId = req.contextId;
  };
  if (activityConfig && activityConfig[req.activityKey]) {
    if (req.key === '401') {
      if (!req.body.type) {
        req.body.type = "web";
      };
      activity.loginFrom = req.body.type;
    };
    if (req && req.tokenInfo && req.tokenInfo.loginType === config.commonRole.employee) {
      activity.createdBy.employee = req.tokenInfo._id;
      activity.createdBy.name = req.tokenInfo.displayName;
    } else if (req && req.employee && req.employee._id) {

      activity.contextId = req.employee._id;
      activity.createdBy.employee = req.employee._id;
      activity.createdBy.name = req.employee.displayName;
    }
    if (req && req.tokenInfo && req.tokenInfo.loginType === config.commonRole.seller) {
      activity.createdBy.seller = req.tokenInfo._id;
      if(req.tokenInfo.companyName){
        activity.createdBy.name = req.tokenInfo.companyName;
      }
      let seller = await Seller.get(req.tokenInfo._id);
      seller.lastActivity = activity.created.toISOString();
      await Seller.save(seller);
    } else if (req && req.seller && req.seller._id) {
      activity.contextId = req.seller._id;
      activity.createdBy.seller = req.seller._id;
      if(req.seller.companyName){
        activity.createdBy.name = req.seller.companyName;
      }
      let seller = await Seller.get(req.seller._id);
      seller.lastActivity = activity.created.toISOString();
      await Seller.save(seller);
    }
    if (req && req.tokenInfo && req.tokenInfo.loginType === config.commonRole.buyer) {
      activity.createdBy.buyer = req.tokenInfo._id;
      activity.createdBy.name = req.tokenInfo.displayName;
      let buyer = await Buyer.get(req.tokenInfo._id);
      buyer.lastActivity = activity.created.toISOString();
      await Buyer.save(buyer);
    } else if (req && req.buyer && req.buyer._id) {

      activity.contextId = req.buyer._id;
      activity.createdBy.buyer = req.buyer._id;
      activity.createdBy.name = req.buyer.displayName;
      let buyer = await Buyer.get(req.buyer._id);
      buyer.lastActivity = activity.created.toISOString();
      await Buyer.save(buyer);
    }
    await Activity.save(activity);
    return true;
  } else {
    return true;
  };
};

//activity of getting the description 
async function getHistory(req) {
  req.entries = await Activity.historyList(req.query);
  req.entries.forEach((values, index) => {
    if (values.desc) {
      req.history.push(values.desc);
    }
  })
}
export default {
  setActivityVaribles,
  insertActivity,
  getHistory
};