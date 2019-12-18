import config from '../config/config';

import Activity from '../models/activity.model';
import Entities from '../models/entity.model';
import Order from '../models/order.model';
import Settings from '../models/setting.model';
import Statement from '../models/statement.model';
import Seller from '../models/seller.model';

import renderEmailTemplateService from './renderEmailTemplate.service';

import serviceUtil from '../utils/service.util';
import session from '../utils/session.util';

/**
 * set seller variables
 * @returns {Seller}
 */
function setCreateSellerVaribles(req, seller) {
  seller.email = seller.email.toLowerCase();
  seller.status = config.commonStatus.Pending;
  if (seller.firstName) {
    seller.displayName = seller.firstName;
  }
  if (seller.middleName) {
    seller.displayName += ' ' + seller.middleName;
  }
  if (seller.lastName) {
    seller.displayName += ' ' + seller.lastName;
  }
  if (req.tokenInfo) {
    seller.createdBy[req.tokenInfo.loginType] = session.getSessionLoginID(req);
    seller.createdBy.name = session.getSessionLoginName(req);
  }
  return seller;
}

/**
 * set seller update variables
 * @returns {seller}
 */
function setUpdateSellerVaribles(req, seller) {
  seller.updated = Date.now();
  if (req.tokenInfo) {
    seller.updatedBy[req.tokenInfo.loginType] = session.getSessionLoginID(req);
    seller.updatedBy.name = session.getSessionLoginName(req);
  }
  return seller;
}

async function generateSettings(req) {
  let setting = new Settings();
  setting.userId = req.seller._id;
  setting.userName = req.seller.displayName;
  setting.payments = "BiMonthly";
  setting.vendorPrefix = "BUX";
  setting.supportedLanguages = ['en'];
  setting.supportedCountries = [];
  await Settings.save(setting);
}

/**
 * generating statement for vendor when order payment done by buyer
 */
async function generateStatement(req, res) {
  if (req.order && req.order.status && req.order.status === config.orderStatus.paid && req.inventory) {
    //vender details 
    req.seller = await Seller.get(req.order.ownerId);
    let amount = req.order.BUX;
    let statement = new Statement();

    // //calculating admin charge
    // let percentage = await getAdminChargePercentage(req);
    // let adminCharge = amount * percentage / 100;



    // statement for crediting order amount to the wallet

    statement.userId = req.seller._id;
    statement.userName = req.seller.displayName;
    statement.favorTo = config.commonRole.seller;
    statement.orderId = req.order._id;
    statement.type = config.statementType.seller.order;
    statement.amount = amount;

    await Statement.save(statement);
    req.entityType = 'seller';
    req.activityKey = 'sellerOrderConfirm';
    //send email to employee
    // renderEmailTemplateService.setCommonEmailVariables(req, res);
  } else if (req.order && req.order.status && req.order.status === config.orderStatus.refunded && req.inventory) {
    //vender details 
    req.seller = await Seller.get(req.order.ownerId);
    let amount = req.order.BUX;
    let statement = new Statement();

    // //calculating admin charge
    // let percentage = await getAdminChargePercentage(req);
    // let adminCharge = amount * percentage / 100;
    // statement for crediting order amount to the wallet

    statement.userId = req.seller._id;
    statement.userName = req.seller.displayName;
    statement.favorTo = config.commonRole.seller;
    statement.orderId = req.order._id;
    statement.type = config.statementType.seller.return;
    statement.amount = amount;

    await Statement.save(statement);
    // req.entityType = 'seller';
    // req.activityKey = 'sellerOrderReturned';

    // renderEmailTemplateService.setCommonEmailVariables(req, res);
  }
}

/**
 * calculating Admin commission percentage
 * @param {*} order 
 * @param {*} req 
 * @param {*} percentage 
 */
// async function getAdminChargePercentage(req, percentage) {
//   let category = req.order.category;
//   const query = serviceUtil.generateListQuery(req);
//   query.filter = { role: config.roles.superAdmin }
//   //get total settings    

//   const settings = await Settings.list(query);
//   if (settings) {
//     for (var obj of settings[0].categories) {
//       if (obj.name === category) {
//         percentage = obj.adminCharge;
//       }
//     }
//     return percentage;
//   }
// }

/**
 * adding noOfProducts for sell count and lastactivity to the seller list
 */
async function getSellerDetails(seller) {
  if (seller) {
    let sellerQuery = {
      filter: {}
    };
    let matchQuery = {
      $match: {
        active: true,
        ownerId: seller._id,
      }
    }

    let productsCount = await Entities.aggregate([
      matchQuery,
      {
        $group: {
          _id: "",
          count: { $sum: "$totalAvailable" }
        }
      }
    ])
    if (productsCount && productsCount.length > 0) {
      seller.noOfProducts = productsCount[0].count;
    } else {
      seller.noOfProducts = 0;
    }
    //calculating business volume of a seller
    let bussinessVolume = await Order.aggregate([{
      $match: {
        ownerId: seller._id,
        active: true,
        status: {
          $nin: [config.orderStatus.addToCart,
          config.orderStatus.returned,
          config.orderStatus.refunded,
          config.orderStatus.cancelled]
        }
      }
    }, {
      $group: {
        _id: "$ownerId",
        totalAmount: { $sum: "$BUX" },
        totalQuantity: { $sum: "$quantity" }
      }
    }])

    if (bussinessVolume && bussinessVolume.length > 0) {
      seller.bussinessVolume = bussinessVolume[0].totalAmount;
    } else {
      seller.bussinessVolume = 0;
    }
    sellerQuery.filter = {
      active: true,
      ownerId: seller._id
    }
    let products = await Entities.list(sellerQuery);
    let totalAmount = 0;
    if (products && products.length > 0) {
      for (let product of products) {
        if (product && product.inventories && product.inventories.length > 0) {
          for (let inventory of product.inventories) {
            totalAmount += inventory.Available * inventory.Price;
          }
        }
      }
      seller.totalAmount = totalAmount;
    } else {
      seller.totalAmount = totalAmount;
    }
  }
  return seller;
}

function getReportDetails(req) {
  let reportsQuery = {};
  let matchQuery = {
    $match: {
      active: true,
      ownerId: req.tokenInfo._id,
      status: {
        $nin: [
          config.orderStatus.addToCart,
          config.orderStatus.cancelled,
          config.orderStatus.refunded,
          config.orderStatus.returned
        ]
      }
    }
  }
  reportsQuery.productWiseSalesReportQuery = {
    filter: [
      matchQuery,
      {
        $group: {
          _id: { "entityId": "$entityId", "entityName": "$entityName" },
          totalAmount: { $sum: "$BUX" },
          totalQuantity: { $sum: "$quantity"}
        }
      }
    ]
  };
  reportsQuery.itemsToBeShippedQuery = {
    filter: [
      [
        {
          $match: {
            ownerId: req.tokenInfo._id,
            active: true,
            status: { $in: [config.orderStatus.shipped] }
          }
        }, {
          $group: {
            _id: { "entityId": "$entityId", "entityName": "$entityName", "status": "$status" },
            totalQuantity: { $sum: "$quantity" }
          }
        }
      ]
    ]
  };

  reportsQuery.itemsDeliveredQuery = {
    filter: [
      {
        $match: {
          ownerId: req.tokenInfo._id,
          active: true,
          status: config.orderStatus.delivered
        }
      },
      {
        $group: {
          _id: { "entityId": "$entityId", "entityName": "$entityName", "status": "$status" },
          totalQuantity: { $sum: "$quantity" }
        }
      }
    ]
  };
  return reportsQuery;
}


function getSalesSummaryQuery(req) {
  let salesSummaryQuery = [{
    $match: {
      active: true,
      ownerId: req.tokenInfo._id,
      status: {
        $nin: [config.orderStatus.addToCart,
        config.orderStatus.cancelled,
        config.orderStatus.returned,
        config.orderStatus.refunded
        ]
      }
    }
  }, { $unwind: "$currencies" }, { $match: { "currencies.USD": { $exists: true } } }, {
    $project:
    {
      y: { $year: "$created" },
      m: { $month: "$created" },
      d: { $dayOfMonth: "$created" },

      totalAmount: { $multiply: ["$currencies.USD", "$quantity"] },
      totalQuantity: "$quantity"
    }
  }, {
    $group: {
      _id: { "year": "$y", "month": "$m", "day": "$d" },
      totalAmount: { $sum: "$totalAmount" },
      totalQuantity: { $sum: "$totalQuantity" }
    }
  }, {
    $project: {
      dates: {
        "$concat": [
          {
            "$substr": [
              { "$subtract": ["$_id.day", { "$mod": ["$_id.day", 1] }] },
              0,
              -1
            ]
          },
          { "$substr": [{ "$mod": ["$_id.day", 1] }, 1, 3] },
          "/",
          {
            "$substr": [
              { "$subtract": ["$_id.month", { "$mod": ["$_id.month", 1] }] },
              0,
              -1
            ]
          },
          { "$substr": [{ "$mod": ["$_id.month", 1] }, 1, 3] },
          "/",
          {
            "$substr": [
              { "$subtract": ["$_id.year", { "$mod": ["$_id.year", 1] }] },
              0,
              -1
            ]
          }

        ]
      },
      totalAmount: "$totalAmount",
      totalQuantity: "$totalQuantity"
    }
  }]
  return salesSummaryQuery
}
export default {
  setCreateSellerVaribles,
  setUpdateSellerVaribles,
  generateStatement,
  getSellerDetails,
  getReportDetails,
  getSalesSummaryQuery,
  generateSettings
};