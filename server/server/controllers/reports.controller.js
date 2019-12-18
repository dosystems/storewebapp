import Order from '../models/order.model';
import ProductClick from '../models/productClick.model'

import serviceUtil from '../utils/service.util';


// get the produts by qunatity of products in the cart
async function getProductCartedOrders(req, res) {
  req.aggregateType = 'productCart';
  let query = await serviceUtil.generateListQuery(req);
  if (query.page === 1) {
    // total count 
    let result = await Order.getAggregateResult(query);
    query.pagination.totalCount = result.length;
  }
  let productCart = await Order.getAggregate(query);
  res.json({ productCarts: productCart, pagination: query.pagination })
}

async function mostlyViewed(req, res) {
  req.aggregateType = 'mostlyViewed';
  let query =  serviceUtil.generateListQuery(req);
  if (query.page === 1) {
    // total count 
    let result = await ProductClick.getAggregateResult(query);
    query.pagination.totalCount = result.length;
  }
  let mostlyViewed = await ProductClick.getAggregate(query);
  res.json({ mostleyViewed: mostlyViewed, pagination: query.pagination })
}

async function ordersAmmount(req, res) {
  req.aggregateType = 'orderAmount';
  let query =  serviceUtil.generateListQuery(req);
  if (query.page === 1) {
    // total count 
    let result = await Order.getAggregateResult(query);
    query.pagination.totalCount = result.length;
  }
  let orderAmount = await Order.getAggregate(query);
  res.json({ ordersAmount: orderAmount, pagination: query.pagination })
}

async function bestSeller(req, res) {
  req.aggregateType = 'bestSeller';
  let query =  serviceUtil.generateListQuery(req);
  if (query.page === 1) {
    // total count 
    let result = await Order.getAggregateResult(query);
    query.pagination.totalCount = result.length;
  }
  let bestSeller = await Order.getAggregate(query);
  res.json({ bestSeller: bestSeller, pagination: query.pagination })
}
async function productByOrder(req, res) {
  req.aggregateType = 'productByOrder';
  let query = serviceUtil.generateListQuery(req);
  if (query.page === 1) {
    // total count 
    let result = await Order.getAggregateResult(query);
    query.pagination.totalCount = result.length;
  }
  let produts = await Order.getAggregate(query);
  res.json({ produts: produts, pagination: query.pagination })
}
export default {
  getProductCartedOrders,
  mostlyViewed,
  ordersAmmount,
  bestSeller,
  productByOrder
};