import config from '../config/config';

import Buyer from '../models/buyer.model';
import Entity from '../models/entity.model';
import Order from '../models/order.model';
import Seller from '../models/seller.model';
import Setting from '../models/setting.model';
import Statement from '../models/statement.model';

import dashboardService from '../services/dashboard.services';

import dashboardUtil from '../utils/dashboard.util';


async function list(req, res, next) {
  logger.info('Log:Order Controller:List: query :' + JSON.stringify(req.query));
  let responseJson = {};
  req.execute = true;
  req.exe = true;

  let dashBoardQuery = dashboardUtil.generateQuery(req);
  responseJson.totalActiveOrdersCount = await Order.totalCount(dashBoardQuery.activeOrdersQuery);
  responseJson.totalActiveProductsCount = await Entity.totalCount(dashBoardQuery.totalProductCount);
  responseJson.activeBuyersCount = await Buyer.totalCount(dashBoardQuery.activeBuyersQuery);
  responseJson.activeSellersCount = await Seller.totalCount(dashBoardQuery.activeSellersQuery);
  responseJson.bestSellers = await Order.getAggregateResult(dashBoardQuery.bestSellerQuery);

  //seller chart details
  let sellerCounts = await Seller.getAggregateResult(dashBoardQuery.sellersCountQuery);
  responseJson.sellerChartCounts = dashboardService.lastFourMonthsCount(sellerCounts);

  // buyer chart details
  let buyersCounts = await Buyer.getAggregateResult(dashBoardQuery.buyersCountQuery);
  responseJson.buyerChartCounts = dashboardService.lastFourMonthsCount(buyersCounts);

  //ordres chart details by monthly
  let ordersByMonthCounts = await Order.getAggregateResult(dashBoardQuery.ordersMonthsQuery);
  responseJson.orderChartCounts = dashboardService.lastFourMonthsCount(ordersByMonthCounts);

  //orders chart details by daily
  let orderByDaysCounts = await Order.getAggregateResult(dashBoardQuery.lastThirtyDaysQuery);
  responseJson.orderDayChartCounts = dashboardService.monthlyDayCount(orderByDaysCounts);
  res.json(responseJson)
};

/** 
 * dashboard for vendor
 */
async function getVendorDashBoard(req, res, next) {

  logger.info('Log:dashboard Controller:getVendorDashBoard: query :' + JSON.stringify(req.query));
  let responseJson = {};
  let query = {
    filter: {
      active: true
    }
  };
  req.setting = await Setting.findOne({ "userId": req.tokenInfo._id })

  req.execute = true;
  req.exe = true;
  let dashBoardQuery = dashboardUtil.generateQuery(req);
  responseJson.totalOrdersCount = await Order.getAggregateResult(dashBoardQuery.vendorRecivedOrdersQuery);
  responseJson.todaySalesSummary = await Order.getAggregateResult(dashBoardQuery.todaySalesQuery);
  responseJson.weekSalesSummary = await Order.getAggregateResult(dashBoardQuery.weekSalesQuery);
  responseJson.currentMonthSalesSummary = await Order.getAggregateResult(dashBoardQuery.currentMonthSalesQuery);
  responseJson.monthSalesSummary = await Order.getAggregateResult(dashBoardQuery.lastMonthSalesQuery);
  responseJson.sixMonthSalesSummary = await Order.getAggregateResult(dashBoardQuery.sixMonthSalesQuery);
  responseJson.productsCount = await Entity.getAggregateResult(dashBoardQuery.vendorProductsQuery);
  let paymentStatements = await Statement.getAggregateResult(dashBoardQuery.paymentQuery);
  responseJson.paymentSummary = dashboardService.getPaymentSummary(paymentStatements)
  responseJson.salesByCountry = await Order.getAggregateResult(dashBoardQuery.salesByCountryQuery);
  let buyersCount = await Order.getAggregateResult(dashBoardQuery.buyersQuery);
  responseJson.buyerChartCounts = dashboardService.lastFourMonthsCount(buyersCount);
  // orders chart details by months
  let vendorOrdersByMonthCount = await Order.getAggregateResult(dashBoardQuery.vendorOrdersMonthsQuery);
  responseJson.orderChartCounts = dashboardService.lastFourMonthsCount(vendorOrdersByMonthCount)
  // orders chart details by days

  let vendorOrdersByDaysCounts = await Order.getAggregateResult(dashBoardQuery.vendorOrderslastThirtyDaysQuery);
  responseJson.orderDayChartCounts = dashboardService.monthlyDayCount(vendorOrdersByDaysCounts);
  res.json(responseJson)
};
export default {
  list,
  getVendorDashBoard
}
