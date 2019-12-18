import request from 'request';
import Promise from 'bluebird';
import config from '../config/config';

import Activity from '../models/activity.model';
import Buyer from '../models/buyer.model';
import Order from '../models/order.model';
import Setting from '../models/setting.model';
import Statement from '../models/statement.model';

import renderEmailTemplateService from './renderEmailTemplate.service';

import serviceUtil from '../utils/service.util';
import session from '../utils/session.util';

/**
 * set buyer variables
 * @returns {Buyer}
 */
function setCreateBuyerVaribles(req, buyer) {
  buyer.email = buyer.email.toLowerCase();
  buyer.status = config.commonStatus.Pending;
  if (buyer.firstName) {
    buyer.displayName = buyer.firstName;
  }
  if (buyer.middleName) {
    buyer.displayName += ' ' + buyer.middleName;
  }
  if (buyer.lastName) {
    buyer.displayName += ' ' + buyer.lastName;
  }
  if (req.tokenInfo) {
    buyer.createdBy[req.tokenInfo.loginType] = session.getSessionLoginID(req);
    buyer.createdBy.name = session.getSessionLoginName(req);
  }
  return buyer;
}

/**
 * set buyer update variables
 * @returns {buyer}
 */
function setUpdateBuyerVaribles(req, buyer) {
  buyer.updated = Date.now();
  if (buyer.firstName) {
    buyer.displayName = buyer.firstName;
  }
  if (buyer.middleName) {
    buyer.displayName += ' ' + buyer.middleName;
  }
  if (buyer.lastName) {
    buyer.displayName += ' ' + buyer.lastName;
  }
  if (req.tokenInfo) {
    buyer.updatedBy[req.tokenInfo.loginType] = session.getSessionLoginID(req);
    buyer.updatedBy.name = session.getSessionLoginName(req);
  }
  return buyer;
}

/**
 * update Buyer's and Vendor's wallet when order payment is completed
 */
async function generateStatement(buyer, req, res) {
  if (req.order && req.order.status && req.order.status === config.orderStatus.paid) {
    let statement = new Statement();

    // statement for debiting order amount from wallet 
    let amount = req.order.totalPrice;
    statement.userId = buyer._id;
    statement.userName = buyer.displayName;
    statement.orderId = req.order._id;
    statement.type = config.statementType.buyer.order;
    statement.favorTo = config.commonRole.buyer;
    statement.amount = amount;
    statement.buxTradable = amount;
    if (req.order.payments && req.order.payments.wallet) {
      statement.buxTradableBefore = buyer.wallet.BUX;
      statement.buxTradableAfter = buyer.wallet.BUX - amount;
    }
    req.buyer = buyer;
    if(buyer && !buyer.isFirstPurchaseComplete){
      buyer.isFirstPurchaseComplete = true;
      await Buyer.save(buyer);
    }
    //debit order amount from wallet   
    await Statement.save(statement);

    let query = {
      filter: {
        active: true
      }
    };
    query.filter.role = config.roles.superAdmin;
    let setting = await Setting.list(query);
    let adminStatement = new Statement();

    // statement for debiting order amount from wallet 
    if (setting && setting.length > 0) {
      adminStatement.userId = setting[0].userId;
      adminStatement.userName = setting[0].userName;
      adminStatement.orderId = req.order._id;
      adminStatement.favorTo = config.roles.superAdmin;
      adminStatement.type = config.statementType.superAdmin.order;
      adminStatement.amount = amount;
      adminStatement.buxTradable = amount;
      adminStatement.buxTradableBefore = setting[0].wallet.BUX;
      adminStatement.buxTradableAfter = setting[0].wallet.BUX + amount;

      //credit order amount in settings wallet
      setting[0].wallet.BUX += amount;
      await Setting.save(setting[0]);
      await Statement.save(adminStatement);
    }
  } else if (req.order && req.order.status && req.order.status === config.orderStatus.refunded) {
    let statement = new Statement();
    // statement for debiting order amount from wallet 
    let amount = req.order.BUX;
    statement.userId = buyer._id;
    statement.userName = buyer.displayName;
    statement.orderId = req.order._id;
    statement.type = config.statementType.buyer.return;
    statement.favorTo = config.commonRole.buyer;
    statement.amount = amount;
    statement.buxTradable = amount;
    statement.buxTradableBefore = buyer.wallet.BUX;
    statement.buxTradableAfter = buyer.wallet.BUX + amount;
    buyer.wallet.BUX += amount;

    // if (order && order.payments && order.payments.bitsolives) {
    //   var options = {
    //     method: 'POST',
    //     url: 'http://crmserver.nonstopfx.com/api/updateUserWalletFromEcomm',
    //     form: {
    //       "userId": order.payments.bitsolives.userId,
    //       "euro": -(order.payments.bitsolives.EUR),
    //       "buxT": -(order.payments.bitsolives.BUX)
    //     }
    //   }
    //   request(options, function (err, response, body) {
    //     if (err) {
    //       console.error('Error token response ' + new Date() + ': ' + err);
    //     } else {
    //       console.log(response);
    //     }
    //   });
    // }

    //debit order amount from wallet
    req.buyer = await Buyer.save(buyer);

    await Statement.save(statement);


    req.entityType = 'buyer';
    req.activityKey = 'buyerOrderReturned';
    renderEmailTemplateService.setCommonEmailVariables(req, res);
    let query = {
      filter: {
        active: true
      }
    };
    query.filter.role = config.roles.superAdmin;
    let setting = await Setting.list(query);
    let adminStatement = new Statement();
    if (setting && setting.length > 0) {
      // statement for debiting order amount from wallet 
      adminStatement.userId = setting[0].userId;
      adminStatement.userName = setting[0].userName;
      adminStatement.orderId = req.order._id;
      adminStatement.type = config.statementType.superAdmin.return;
      adminStatement.favorTo = config.roles.superAdmin;
      adminStatement.amount = amount;
      adminStatement.buxTradable = amount;
      adminStatement.buxTradableBefore = setting[0].wallet.BUX;
      adminStatement.buxTradableAfter = setting[0].wallet.BUX - amount;

      //credit order amount in settings wallet
      setting[0].wallet.BUX -= amount;
      await Setting.save(setting[0]);
    }
    await Statement.save(adminStatement);
  }
}

/**
 * add, update or delete buyer address
 * @param {*} req 
 */

async function updateBuyerDetails(req, buyer) {
  if (req.body && req.body.address) {
    //operation =0 for create new address
    if (req.body.address.operation === 0) {
      buyer.address.set(buyer.address.length, req.body.address);
    } else if (req.body.address.operation === 1) {
      for (let val of buyer.address) {
        if (JSON.stringify(val._id) === JSON.stringify(req.body.address._id)) {
          val = Object.assign(val, req.body.address);
        }
      }
    } else if (req.body.address.operation === 2) {
      for (let val of buyer.address) {
        if (JSON.stringify(val._id) === JSON.stringify(req.body.address._id)) {
          val.active = false;
        }
      }
    }
    delete req.body.address;
  }
  return buyer;
}

/**
 * adding noOfProducts buy count and lastactivity to the Buyers list
 */
async function getBuyerDetails(buyer) {
  if (buyer) {
    let buyerQuery = {
      filter: {}
    };

    let matchQuery = {
      $match: {
        userId: buyer._id,
        active: true,
        status: { $nin: [config.orderStatus.addToCart] }
      }
    }

    //calculating total products buy quantity count and volume count
    let totalAmount = await Order.aggregate([{
      $match: {
        userId: buyer._id,
        active: true,
        status: {
          $nin: [
            config.orderStatus.addToCart,
            config.orderStatus.returned,
            config.orderStatus.refunded,
            config.orderStatus.cancelled
          ]
        }
      }
    }, {
      $group: {
        _id: "$userId",
        totalAmount: { $sum: "$totalPrice" },
        totalQuantity: { $sum: "$quantity" }
      }
    }]);
    if (totalAmount && totalAmount.length > 0) {
      buyer.totalAmount = totalAmount[0].totalAmount;
      buyer.noOfProductsBuy = totalAmount[0].totalQuantity;
    } else {
      buyer.totalAmount = 0;
      buyer.noOfProductsBuy = 0;
    }
  }
  return buyer;
}


/**
 * checking user mailid exist in bitsolvies 
 */

async function checkEmailInBitSolvies(buyer, res) {
  var options = {
    method: 'GET',
    url: config.buxUrl + `getUserByEmailId?emailid=${buyer.email}`,
  }
  return new Promise((resolve, reject) => {
    request(options, function (err, response, body) {
      if (err) {
        console.error('Error token response ' + new Date() + ': ' + err);
        reject(err);
      } else {
        let res;
        try {
          res = JSON.parse(response.body);
        } catch (err) {
          resolve(false);

        }
        if (res && res.respMessage && res.respMessage === "email Exists") {
          resolve(true);
        } else {
          resolve(false);
        }
      }
    });
  });
}
export default {
  setCreateBuyerVaribles,
  setUpdateBuyerVaribles,
  generateStatement,
  updateBuyerDetails,
  getBuyerDetails,
  checkEmailInBitSolvies
};