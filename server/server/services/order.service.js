import config from '../config/config';
import cron from 'node-cron';
import getIpAddresses from 'get-ip-addresses';
var ip = require('ip')
//var iplocation = require('iplocation')

import Buyer from '../models/buyer.model';
import Country from '../models/country.model';
import Entity from '../models/entity.model';
import Exchangerates from '../models/exchangerates.model';
import Order from '../models/order.model';
import Seller from '../models/seller.model';
import Settings from '../models/setting.model';

import renderEmailTemplateService from '../services/renderEmailTemplate.service';
import entityService from '../services/entity.service';
import dateUtil from '../utils/date.util';
import session from '../utils/session.util';
import serviceUtil from '../utils/service.util';

/**
 * set Order variables
 * @returns {Order}
 */
async function setCreateOrderVaribles(req, order) {
  if (req.tokenInfo) {
    order.createdBy[req.tokenInfo.loginType] = session.getSessionLoginID(req);
    order.createdBy.name = session.getSessionLoginName(req);
    order.userId = session.getSessionLoginID(req);;
    order.userName = session.getSessionLoginName(req);;

    //generating order id 
    let lastOrder = await Order.find({}).sort({ created: -1 }).limit(1);
    if (lastOrder && lastOrder.length > 0 && lastOrder[0].orderId) {
      let id = lastOrder[0].orderId.split("X");
      let num = parseInt(id[1])
      order.orderId = "BUX" + (num + 1)
      if (order.orderId) {
        let exist = await Order.findOne({ orderId: order.orderId })
        while (exist) {
          let id = order.orderId.split("x");
          let num = parseInt(id[1])
          order.orderId = "BUX" + (num + 1)
          exist = await Order.findOne({ orderId: order.orderId })
        }
      }
    } else {
      order.orderId = 'BUX100000';
    }
    //adding orders to cart with status buy 
    // let query = {
    //   filter: {
    //     active: true
    //   }
    // }
    // query.filter.userId = req.tokenInfo._id;
    // query.filter.status = config.orderStatus.addToCart;
    // query.filter.isHold = true;
    // let orders = await Order.list(query);

    // if (orders) {
    //   for (let orderObj of orders) {
    //     orderObj.isHold = false;
    //     req.failedOrder = await Order.save(orderObj);
    //     req.entity = await Entity.get(req.failedOrder.entityId);
    //     await getInventoryDetails(req, req.failedOrder);
    //     if (req.inventory) {
    //       await entityService.updateEntityDetails(req);
    //     }
    //   }
    // }
    if (req.body && req.body.entityId) {
      order.entityId = req.body.entityId;
      req.entity = await Entity.get(req.body.entityId);
      order.entityName = req.entity.name;
      order.ownerId = req.entity.ownerId;
      order.entityCode = req.entity.entityId;
      if (req.body.inventory && req.body.inventory.adminCommission) {
        order.adminCommission = req.body.inventory.adminCommission;
        delete req.body.inventory.adminCommission;
      }

      if (!req.body.shippingFrom) {
        let seller = await Seller.get(order.ownerId);
        if (seller && seller.address) {
          order.shippingFrom = seller.address;
          let country = await Country.findOne({ "name": order.shippingFrom.country });
          if (country) {
            order.shippingFrom.countryCode = country.countryCode;
          }
          order.shippingFrom.name = seller.companyName;
          order.shippingFrom.phone = seller.phoneNumber;
        }
      }

      order.ownerName = req.entity.ownerName;
    }
  }
  return order;
}

/**
 * set Order update variables
 * @returns {Order}
 */
function setUpdateOrderVaribles(req, order) {
  if (req.tokenInfo) {
    order.updatedBy[req.tokenInfo.loginType] = session.getSessionLoginID(req);
    order.updatedBy.name = session.getSessionLoginName(req);
  };
  if (req.body && req.body.status && req.body.status === config.returnOrderStatus.returnRequested) {
    order.cancelled = new Date();
    order.returnStatus = req.body.status;
  }
  if (req.body && req.body.status && req.body.status === config.orderStatus.delivered) {
    order.deliveryDate = new Date();
    order.deliveryDays = dateUtil.getDifference(new Date(order.deliveryDate), new Date(order.purchased));
    delete req.body.deliveryDate;
    delete req.body.deliveryDays;

  }
  order.updated = new Date();
  return order;
};


/**
 * payment of buyer orders amount calculating in BUX
 */

async function setPaymentDetails(req, order, res) {
  let payments = {}
  if (order.status === config.orderStatus.paid) {
    let query = {
      filter: {
        active: true
      }
    }
    let exchangerates = await Exchangerates.list(query);
    if (req.orderBody && req.orderBody.shippingRateDetails) {
      order.deliveryDate = req.orderBody.shippingRateDetails.estimatedDeliveryOn;
      order.deliveryDays = req.orderBody.shippingRateDetails.expectedDeliviryDays;
      order.shippingRateDetails = req.orderBody.shippingRateDetails;
    }
    if (req.orderBody && req.orderBody.currency) {
      if (req.orderBody.currency === 'BUX') {
        order.BUX = req.orderBody.price;
        order.shippingCharges = req.orderBody.shippingCharges;
        order.totalPrice = order.BUX + order.shippingCharges;
      } else {
        for (let currency of order.currencies) {
          for (let key in currency) {
            if (key === 'BUX') {
              order.BUX = currency[key];
            }
          }
        }
        for (let rates of exchangerates) {
          if (req.orderBody.currency && req.orderBody.currency === "EUR" && rates.pair === "BUX/EUR") {
            order.shippingCharges = parseFloat(req.orderBody.shippingCharges / rates.buyRate).toFixed(8);
          };
          if (req.orderBody.currency && req.orderBody.currency === "USD" && rates.pair === "BUX/USD") {
            order.shippingCharges = parseFloat(req.orderBody.shippingCharges / rates.buyRate).toFixed(8);
          }
        }
        order.totalPrice = order.BUX + order.shippingCharges;
      }
    }

    payments.currency = req.orderBody.currency;
    payments.price = req.orderBody.price;
    payments.shippingCharges = req.orderBody.shippingCharges;
    payments.total = req.orderBody.total;
    payments.totalPrice = req.body.totalPrice;
    if (req.body.payments && req.body.payments.paypal) {
      payments.paypal = req.body.payments.paypal;
    }
    if (req.body.payments && req.body.payments.bitsolives) {
      payments.bitsolives = req.body.payments.bitsolives;
    };
    if (req.body.payments && req.body.payments.wallet) {
      payments.wallet = req.body.payments.wallet;
    }

  }
  order.payments = payments;
  order.updated = new Date();
  order.purchased = new Date();
  if(req.body.promocode && req.body.discount){
    order.promocode = req.body.promocode;
    order.discount = req.body.discount;
    order.promocodeId = req.body.promocodeId;
  }
  if (order.totalPrice > 500) {
    let i = ip.address()
    req.ipadd = i;
    req.activityKey = 'securityForBuy'
    req.orderId = order.orderId;
    req.userId = order.userId;
    req.userName = order.userName;
    req.amount = order.totalPrice;
    renderEmailTemplateService.setCommonEmailVariables(req, res)
  }
 
  return order;
}
/**
* adding currency rates in order in cartOrders list 
*/

async function getPriceInDifferentCurrencies(order, req) {
  let query = {
    filter: {
      active: true
    }
  }
  let exchangerates = await Exchangerates.list(query);
  req.entity = await Entity.get(order.entityId);
  //adding admin comminsion to price
  req.setting = await Settings.findOne({
    active: true,
    role: config.roles.superAdmin
  });
  await entityService.addAdminCommission(req.entity, req)
  req = getInventoryDetails(req, order);
  if (req.inventory) {
    let currency = [];
    currency[currency.length] = { USD: req.inventory.Price };
    if (exchangerates && exchangerates.length > 0) {
      for (let rates of exchangerates) {
        if (rates.pair === "BUX/USD") {
          currency[currency.length] = { BUX: parseFloat((currency[0].USD / rates.buyRate).toFixed(8)) };
        };
        if (rates.pair === "BTC/USD") {
          currency[currency.length] = { BTC: parseFloat((currency[0].USD / rates.buyRate).toFixed(8)) };
        };
        if (rates.pair === "EUR/USD") {
          currency[currency.length] = { EUR: parseFloat((currency[0].USD / rates.buyRate).toFixed(2)) };
        };
      }
    }
    order.currencies = currency;
    order.addAdminCommission = req.inventory.adminCommission;
  }
  return order;
}


/**
 * getShippingRateInDiffCurrencies
 */

async function getShippingRateInDiffCurrencies(order) {
  let query = {
    filter: {
      active: true
    }
  }
  let exchangerates = await Exchangerates.list(query);
  if (exchangerates && exchangerates.length > 0) {
    let currency = [];
    currency[currency.length] = { USD: order.shippingRateDetails.shippingAmount };
    for (let rates of exchangerates) {
      if (rates.pair === "BUX/USD") {
        currency[currency.length] = { BUX: parseFloat((currency[0].USD / rates.buyRate).toFixed(8)) };
      };
      if (rates.pair === "BTC/USD") {
        currency[currency.length] = { BTC: parseFloat((currency[0].USD / rates.buyRate).toFixed(8)) };
      };
      if (rates.pair === "EUR/USD") {
        currency[currency.length] = { EUR: parseFloat((currency[0].USD / rates.buyRate).toFixed(2)) };
      };
    }
    order.shippingRateCurrencies = currency;
  }
  return order
}

/**
 * matching entity inventory with order
 * @param {*} req 
 * @param {*} order 
 */
function getInventoryDetails(req, order) {
  let entity = req.entity;
  if (order.inventory && entity && entity.inventories && entity.inventories.length > 1) {
    for (let obj of entity.inventories) {
      let count = 0;
      for (let val in order.inventory) {
        for (let key in obj) {
          if (key === val) {
            if (obj[key] === order.inventory[val]) {
              count++;
            }
          }
        }
      }
      if (count === Object.keys(order.inventory).length) {
        req.inventory = obj;
        req.index = entity.inventories.indexOf(obj);

      }
    }
  } else {
    req.inventory = entity.inventories[0]
    req.index = 0;
  }
  return req;
}

/**
 * checking inventory of cart orders when order adding to cart
 * @param {*} req 
 */
async function setCreateCartOrder(req) {
  let query = {};
  query.filter = {
    active: true,
    status: config.orderStatus.addToCart,
    userId: req.tokenInfo._id
  }
  let orders = await Order.list(query);
  for (let cartOrder of orders) {
    let count = 0;
    if (JSON.stringify(cartOrder.entityId) === JSON.stringify(req.body.entityId)) {
      for (let key1 in cartOrder.inventory) {
        for (let key2 in req.body.inventory) {
          if (key1 === key2) {
            if (cartOrder.inventory[key1] === req.body.inventory[key2]) {
              count++;
            }
          }
        }
      }
      if (count === Object.keys(req.body.inventory).length) {
        cartOrder.quantity += req.body.quantity;
        return cartOrder;
      }
    }


  }
}
async function getInvoiceNumber(length) {
  let invoice;
  invoice = 'Bux' + serviceUtil.generateRandomAlphanumeric(length);
  let details = await Order.findOne({ active: true, invoiceNo: invoice })
  if (details) {
    invoice = 'Bux' + serviceUtil.generateRandomAlphanumeric(length);
  }
  return invoice
}


// cron.schedule('* * * * *', function () {
//   updatePaymentExpiredOrders();
// });
// updatePaymentExpiredOrders();
// /**
// * add orders to cart when payment is pending upto certain time period (expire time) 
// */

// async function updatePaymentExpiredOrders(req = {}) {
//   let query = {};
//   query.filter = { active: true }
//   let date = new Date();
//   date.setMinutes(date.getMinutes() - 1);
//   query.filter = {
//     isHold: true,
//     status: config.orderStatus.addToCart,
//     created: { $lte: new Date(date.toISOString()) }
//   };
//   let orders = await Order.list(query);
//   if(orders && orders.length > 0){
//     for (let order of orders) {
//       order.isHold = false;
//       req.failedOrder = await Order.save(order);
//       req.entity = await Entity.get(req.failedOrder.entityId);
//       await getInventoryDetails(req, req.failedOrder);
//       if (req.inventory) {
//         await entityService.updateEntityDetails(req);
//       }
//     }
//   } 
// }



async function sendMails(req, res) {
  req.buyer = await Buyer.get(req.order.userId);
  if (req.order && req.order.status && req.order.status === config.returnOrderStatus.returnRequested) {
    req.seller = await Seller.get(req.order.ownerId);
    req.entityType = 'seller';
    req.activityKey = 'sellerOrderReturned';
    renderEmailTemplateService.setCommonEmailVariables(req, res);
    req.entityType = 'buyer';
    req.activityKey = 'buyerOrderReturned';
  }
  if (req.order && req.order.status && req.order.status === config.orderStatus.cancelled) {
    req.seller = await Seller.get(req.order.ownerId);
    req.entityType = 'seller';
    req.activityKey = 'sellerOrderCancelled';
    renderEmailTemplateService.setCommonEmailVariables(req, res);
    req.entityType = 'buyer';
    req.activityKey = 'buyerOrderCancelled';
  } if (req.order && req.order.status && req.order.status === config.orderStatus.processing || req.order.status === config.orderStatus.shipped || req.order.status === config.orderStatus.delivered) {
    req.entityType = 'buyer';
    req.activityKey = 'buyerOrderUpdate';
  } if (req.orderDetails && req.order && req.order.status && req.order.status === config.orderStatus.paid) {
    
    req.entityType = "buyer";
    req.activityKey = "buyerOrderConfirm";
  }
  renderEmailTemplateService.setCommonEmailVariables(req, res);
  if (req.body.totalPrice > 500 && req.order && req.order.status && req.order.status === config.orderStatus.paid && req.orderDetails) {
    let i = ip.address()
    req.ipadd = i;
    req.orderId = [];
    req.activityKey = 'securityForBuy'
    req.entityType = 'admin'
    for(let order of req.orderDetails){
      req.orderId.push(order.orderId);
      req.userId = order.userId;
      req.userName = order.userName;
    }
    req.amount = req.body.totalPrice;
    renderEmailTemplateService.setCommonEmailVariables(req, res);
  }
}
export default {
  setCreateOrderVaribles,
  setUpdateOrderVaribles,
  getInventoryDetails,
  setCreateCartOrder,
  getInvoiceNumber,
  getPriceInDifferentCurrencies,
  getShippingRateInDiffCurrencies,
  setPaymentDetails,
  sendMails
};