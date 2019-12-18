import config from '../config/config'
import session from '../utils/session.util';

/**
 * set Seller variables
 * @returns {Seller}
 */
function setCreateSettingVaribles(req, setting) {
  if (req.tokenInfo) {
    setting.createdBy[req.tokenInfo.loginType] = session.getSessionLoginID(req);
    setting.createdBy.name = session.getSessionLoginName(req);
    setting.userId = session.getSessionLoginID(req);
    setting.userName = session.getSessionLoginName(req);
    setting.role = session.getSessionLoginRole(req);
    if (req.tokenInfo.loginType === config.commonRole.employee && req.tokenInfo.role === config.roles.superAdmin) {
      session.wallet.BUX = 0.0;
      session.wallet.EUR = 0.0;
    }
  }
  return setting;
}

/**
 * set Seller update variables
 * @returns {Seller}
 */
function setUpdateSettingVaribles(req, setting) {
  setting.updated = Date.now();
  if (req.tokenInfo) {
    setting.updatedBy[req.tokenInfo.loginType] = session.getSessionLoginID(req);
    setting.updatedBy.name = session.getSessionLoginName(req);
  };
  return setting;
};

/**
 * add, update or delete setting details
 * @param {*} req 
 */
function updateSettingDetails(req, setting) {
  if (req.body && req.body.category) {
    //operation =0 for create new address

    if (req.body.category.operation === 0) {
      let count = 0;
      for (let category of setting.categories) {
        if (category.categoryId && req.body.category.categoryId && JSON.stringify(category.categoryId) === JSON.stringify(req.body.category.categoryId)) {
          if (!category.active) {
            category.active = true;
          }
          category.adminCharge = req.body.category.adminCharge;
          count++;
        }
      }
      if (count === 0) {
        setting.categories.set(setting.categories.length, req.body.category);
      }
    } else if (req.body.category.operation === 1) {
      for (let val of setting.categories) {
        if (JSON.stringify(val._id) === JSON.stringify(req.body.category._id)) {
          val = Object.assign(val, req.body.category);
        }
      }
    } else if (req.body.category.operation === 2) {
      for (let val of setting.categories) {
        if (JSON.stringify(val._id) === JSON.stringify(req.body.category._id)) {
          val.active = false;
        }
      }
    }
    delete req.body.category;

  }
  if (req.body.vendorWisePercentage) {

    if (req.body.vendorWisePercentage.operation === 0) {
      let count = 0;
      for (let vendorWisePercentage of setting.vendorWisePercentages) {
        if (vendorWisePercentage.vendorId && req.body.vendorWisePercentage.vendorId && JSON.stringify(vendorWisePercentage.vendorId) === JSON.stringify(req.body.vendorWisePercentage.vendorId)) {
          if (!vendorWisePercentage.active) {
            vendorWisePercentage.active = true;
          }
          vendorWisePercentage.adminCharge = req.body.vendorWisePercentage.adminCharge;
          count++;
        }
      }
      if (count === 0) {
        setting.vendorWisePercentages.set(setting.vendorWisePercentages.length, req.body.vendorWisePercentage);
      }
    } else if (req.body.vendorWisePercentage.operation === 1) {
      for (let val of setting.vendorWisePercentages) {
        if (JSON.stringify(val._id) === JSON.stringify(req.body.vendorWisePercentage._id)) {
          val = Object.assign(val, req.body.vendorWisePercentage);
        }
      }
    } else if (req.body.vendorWisePercentage.operation === 2) {
      for (let val of setting.vendorWisePercentages) {
        if (JSON.stringify(val._id) === JSON.stringify(req.body.vendorWisePercentage._id)) {
          val.active = false;
        }
      }
    }
    delete req.body.vendorWisePercentage;
  }
  return setting;
}

export default {
  setCreateSettingVaribles,
  setUpdateSettingVaribles,
  updateSettingDetails
};
