import config from '../config/config';

import Buyer from '../models/buyer.model';
import Entity from '../models/entity.model';
import Order from '../models/order.model';
import Seller from '../models/seller.model';
import activityService from '../services/activity.service';
import buyerService from '../services/buyer.service';
import orderService from '../services/order.service';
import entityService from '../services/entity.service';
import renderEmailTemplateService from '../services/renderEmailTemplate.service';
import sellerService from '../services/seller.service';
import UserPromoCodeService from '../services/userpromocode.service';

import respUtil from '../utils/resp.util';
import serviceUtil from '../utils/service.util';
/**
 * Load Order and append to req.
 * @param req
 * @param res
 * @param next
 */
async function load(req, res, next) {
  req.order = await Order.get(req.params.orderId);
  return next();
};

/**
 * Get order
 * @param req
 * @param res
 * @returns {details: Order}
 */
async function get(req, res) {
  logger.info('Log:Order Controller:get: query :' + JSON.stringify(req.query));
  let order = req.order;
  if (order.status && order.status === config.orderStatus.addToCart) {
    order = await orderService.getPriceInDifferentCurrencies(order, req);
  }
  let responseJson = {
    respCode: respUtil.successResponse(req).respCode,
    details: order
  };
  req.query = serviceUtil.generateListQuery(req);
  req.history = [];
  req.query.filter.contextId = order.id;
  await activityService.getHistory(req);
  if (req.history.length > 0) {
    responseJson.history = req.history;
  };
  res.json(responseJson);
};

/**
 * Create new order
 * @param req
 * @param res
 * @returns { respCode: respCode, respMessage: respMessage }
 */
async function create(req, res) {
  logger.info('Log:Order Controller:create: body :' + JSON.stringify(req.body));
  let order = new Order(req.body);
  if (req.tokenInfo.status !== config.commonStatus.Active) {
    req.i18nKey = 'buyerInactiveStatus'
    res.json(respUtil.getErrorResponse(req));
  } else {
    order = await orderService.setCreateOrderVaribles(req, order);
    let cartOrder;
    //buyer added the product to cart 
    if (req.body && req.body.status === config.orderStatus.addToCart) {
      cartOrder = await orderService.setCreateCartOrder(req);
    }
    if (cartOrder) {
      order = cartOrder;
    }
    req.order = await Order.save(order);
    req.entityType = 'order';
    req.activityKey = 'addedToCart';
    req.contextId = req.order._id;
    // adding order create activity
    activityService.insertActivity(req);
    res.json(respUtil.createSuccessResponse(req));
  }
};

/**
 * Update existing order
 * @param req
 * @param res
 * @param next
 * @returns { respCode: respCode, respMessage: respMessage }
 */
async function update(req, res, next) {
  logger.info('Log:Order Controller:update: body :' + JSON.stringify(req.body));
  let order = req.order;
  if (req.tokenInfo.status !== config.commonStatus.Active) {
    req.i18nKey = 'buyerInactiveStatus'
    res.json(respUtil.getErrorResponse(req));
  } else {
    let responseJson = {}
    order = orderService.setUpdateOrderVaribles(req, order);
    //let know entity and inventory deatils
    req.entity = await Entity.get(order.entityId);
    orderService.getInventoryDetails(req, order);

    if (order && order.status && order.status === config.orderStatus.addToCart) {
      if (req.inventory && req.inventory.Available && (req.inventory.Available > 0 && req.inventory.Available >= req.body.quantity) || order.quantity >= req.body.quantity) {
        order = Object.assign(order, req.body)
        if (order.shippingRateDetails && order.shippingRateDetails.shippingAmount) {
          order = await orderService.getShippingRateInDiffCurrencies(order)
        }
        req.order = await Order.save(order);
        req.activityKey = 'orderUpdate';
      } else if (req.inventory && req.inventory.Available && req.inventory.Available > 0 && req.inventory.Available < req.body.quantity) {
        req.i18nKey = 'quantityNotAvailable'
        res.json(respUtil.getErrorResponse(req))
      } else {
        req.i18nKey = 'outOfStock'
        res.json(respUtil.getErrorResponse(req))
      }
    } else if (req.body && req.body.status && req.body.status === config.returnOrderStatus.returnRequested || req.body.status === config.orderStatus.cancelled) {
      order = Object.assign(order, req.body)
      req.order = await Order.save(order);
      await orderService.sendMails(req, res);
      req.activityKey = "order" + req.order.status;
    } else if (req.body && req.body.status && req.body.status === config.orderStatus.refunded && order.status !== config.orderStatus.refunded) {
      order = Object.assign(order, req.body)
      req.order = await Order.save(order);
      await entityService.updateEntityDetails(req)
      let buyer = await Buyer.get(order.userId);
      buyerService.generateStatement(buyer, req, res);
      sellerService.generateStatement(req, res)
      req.activityKey = 'orderRefund';
    } else {
      order = Object.assign(order, req.body)
      req.order = await Order.save(order);
      await orderService.sendMails(req, res);
      req.entityType = 'order';
      req.activityKey = 'orderUpdate';
      req.contextId = req.order._id;
    }
    if (req.activityKey) {
      req.entityType = 'order';
      req.contextId = req.order._id;
      // adding order update activity
      activityService.insertActivity(req);
      res.json(respUtil.updateSuccessResponse(req));
    }
  }

};

/**
 * Get order list. based on criteria
 * @param req
 * @param res
 * @param next
 * @returns {orders: orders, pagination: pagination}
 */
async function list(req, res, next) {
  let responseJson = {};
  logger.info('Log:Order Controller:list: query :' + JSON.stringify(req.query));
  req.entityType = 'order';
  const query = serviceUtil.generateListQuery(req);
  if (req.tokenInfo && req.tokenInfo._id) {
    if (req.tokenInfo.loginType === config.commonRole.buyer) {
      query.filter.userId = req.tokenInfo._id;
    } else if (req.tokenInfo.loginType === config.commonRole.seller) {
      query.filter.ownerId = req.tokenInfo._id;
    };
  };
  if (query.page === 1) {
    // total count 
    query.pagination.totalCount = await Order.totalCount(query);
  };
  let totalQuntity = await Order.totalQuantity(query);
  //get total orders
  let orders = await Order.list(query);
  if (query && query.filter && query.filter.status && query.filter.status.$regex && query.filter.status.$regex === config.orderStatus.addToCart) {
    let index = 0;
    let count = [];
    for (let order of orders) {
      order = await orderService.getPriceInDifferentCurrencies(order, req);
      //handling the order by availability of entities(after deleting product , order removing from cart)
      let entity = await Entity.findOne({ _id: order.entityId })
      if (entity && entity.active === true) {
        order.multipleCategories = entity.multipleCategories;
        order.isReturnable = entity.isReturnable;
        orders.splice(index, 1, order)
      } else {
        order.active = false;
        await Order.save(order);
        count.push(index);
      }
      index++;
    }
    if (count.length > 0) {
      for (let i of count) {
        orders.splice(i, 1);
      }
    }
  }
  responseJson.respCode = respUtil.successResponse(req).respCode;
  responseJson.orders = orders;
  responseJson.pagination = query.pagination;
  if (totalQuntity && totalQuntity[0] && totalQuntity[0].sum) {
    responseJson.totalQuantity = totalQuntity[0].sum;
  } else {
    responseJson.totalQuantity = 0;
  };
  res.json(responseJson);
};

/**
 * Delete order.
 * @param req
 * @param res
 * @param next
 * @returns { respCode: respCode, respMessage: respMessage }
 */
async function remove(req, res, next) {
  logger.info('Log:Order Controller:remove: query :' + JSON.stringify(req.query));
  let order = req.order;
  order.active = false;
  order = orderService.setUpdateOrderVaribles(req, order);
  req.order = await Order.save(order);
  req.entityType = 'order';
  req.activityKey = 'orderDelete';
  req.contextId = req.order._id;

  // adding order delete activity
  activityService.insertActivity(req);
  res.json(respUtil.removeSuccessResponse(req));
};


/**
 * place Cart orders 
 */
async function updateCartOrders(req, res, next) {
  logger.info('Log:Order Controller: updateCartOrders: body:' + JSON.stringify(req.body));
  console.log(req.tokenInfo)
  if (req.tokenInfo.status !== config.commonStatus.Active) {
    req.i18nKey = 'buyerInactiveStatus'
    res.json(respUtil.getErrorResponse(req));
  } else {
    var responseJson = []
    if (req.body && req.body.orders && req.body.orders.length > 0) {
      let count = 0;
      for (let order of req.body.orders) {
        order = await Order.get(order.orderId);
        req.entity = await Entity.get(order.entityId)
        orderService.getInventoryDetails(req, order);
        if (req.inventory && req.inventory.Available && req.inventory.Available > 0 && req.inventory.Available >= order.quantity) {
          count++;
        } else if (req.inventory && req.inventory.Available && req.inventory.Available > 0 && req.inventory.Available < order.quantity) {
          req.i18nKey = 'quantityNotAvailable'
          responseJson.push({
            orderId: order._id,
            response: respUtil.getErrorResponse(req)
          });
        } else {
          req.i18nKey = 'outOfStock'
          responseJson.push({
            orderId: order._id,
            response: respUtil.getErrorResponse(req)
          });
        }
      }
      if (count === req.body.orders.length) {
        for (let obj of req.body.orders) {
          let order = await Order.get(obj.orderId);
          // order.status = config.orderStatus.buy;
          req.order = orderService.setUpdateOrderVaribles(req, order);
          if (!req.order.isHold) {
            // req.order.isHold = true;
            req.order = await Order.save(req.order);
            // req.entity = await Entity.get(req.order.entityId)
            // orderService.getInventoryDetails(req, req.order);
            // await entityService.updateEntityDetails(req);
          }
          req.entityType = 'order';
          req.activityKey = 'orderUpdate';
          req.contextId = req.order._id;
          // adding order update activity
          activityService.insertActivity(req);
          responseJson.push({
            response: respUtil.updateSuccessResponse(req)
          });
        }
      }
      res.jsonp(responseJson)
    } else {
      req.i18nKey = 'noOrdersInCart'
      res.jsonp(respUtil.getErrorResponse(req))
    }
  }
}

/**
 * order shipment Address Details
 */
async function updateShipmentAddress(req, res, next) {
  logger.info('Log:Order Controller: updateShipmentAddress: body:' + JSON.stringify(req.body));
  if (req.tokenInfo.status !== config.commonStatus.Active) {
    req.i18nKey = 'buyerInactiveStatus'
    res.json(respUtil.getErrorResponse(req));
  } else {
    if (req.body && req.body.orders && req.body.orders.length > 0) {
      for (let obj of req.body.orders) {
        let order = await Order.get(obj.orderId);
        if (req.body && req.body.address) {
          //shipping address saved in orders
          order.shipmentAddress = req.body.address;
          order = orderService.setUpdateOrderVaribles(req, order);
          req.order = await Order.save(order);
        };
      };
      if (req.tokenInfo && req.tokenInfo._id) {
        let buyer = await Buyer.get(req.tokenInfo._id);
        //add or edit address details of buyer in buyers collection
        if (buyer) {
          buyer = await buyerService.updateBuyerDetails(req, buyer);
          await Buyer.save(buyer);
        };
      };
      req.i18nKey = "shipmentAddress";
      res.jsonp(respUtil.successResponse(req))
    };
  }
};


/**
 * payment 
 */
async function updateOrderPayment(req, res, next) {
  logger.info('Log:Order Controller: updateOrderPayment: body:' + JSON.stringify(req.body));
  if (req.tokenInfo.status !== config.commonStatus.Active) {
    req.i18nKey = 'buyerInactiveStatus'
    res.json(respUtil.getErrorResponse(req));
  } else {
    let responseJson = [];
    req.orderDetails = []
    req.buyer = await Buyer.get(req.tokenInfo._id);
    if (req.body && req.body.payments) {
      if (req.body && req.body.orders && req.body.orders.length > 0) {
        let invoice = await orderService.getInvoiceNumber(16);
        for (let obj of req.body.orders) {
          let order = await Order.get(obj.orderId);
          req.orderBody = obj;

          req.entity = await Entity.get(order.entityId)
          orderService.getInventoryDetails(req, order);
          order.invoiceNo = invoice;
          order.status = config.orderStatus.paid;
          order = await orderService.setPaymentDetails(req, order, res);
          // if(order.isHold){
          //   req.order = order;
          //   await entityService.updateEntityDetails(req);
          //   order.isHold = false;
          // } else {
          //   req.order = order;
          //   if (req.inventory) {
          //     console.log(req.inventory)
          //     await entityService.updateEntityDetails(req);
          //   }
          // }
          req.order = await Order.save(order);

          if(req.order && req.order.promocode && req.order.discount){
            await UserPromoCodeService.createUserPromocode(req.order);
          }
          req.orderDetails.push(req.order)
          await buyerService.generateStatement(req.buyer, req, res);
          await sellerService.generateStatement(req, res);
          if (req.inventory) {
            await entityService.updateEntityDetails(req);
          }
          req.i18nKey = "paymentSuccess";
          req.activityKey = "paymentSuccess";
          req.contextId = req.order._id;
          activityService.insertActivity(req);
          responseJson.push({
            order: order._id,
            response: respUtil.successResponse(req)
          });
        }

        // req.entityType = "buyer",
        // req.activityKey = "buyerOrderConfirm"
        await orderService.sendMails(req, res);
        // renderEmailTemplateService.setCommonEmailVariables(req, res)
      }
    } else {
      req.i18nKey = "paymentFail";
      responseJson.push({
        response: respUtil.getErrorResponse(req)
      });
    }
    res.jsonp(responseJson);
  }
}


export default {
  load,
  get,
  create,
  update,
  list,
  remove,
  updateShipmentAddress,
  updateOrderPayment,
  updateCartOrders
};