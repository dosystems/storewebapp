import config from '../config/config';

import Entity from '../models/entity.model';
import Exchangerates from '../models/exchangerates.model';
import ProductClick from '../models/productClick.model';
import Settings from '../models/setting.model';

import activityService from '../services/activity.service';
import entityService from '../services/entity.service';
import productClickService from '../services/productClick.service';

import respUtil from '../utils/resp.util';
import serviceUtil from '../utils/service.util';

/**
 * Load ProductClick and append to req.
 * @param req
 * @param res
 * @param next
 */
async function load(req, res, next) {
  req.productClick = await ProductClick.get(req.params.productClickId);
  return next();
};

/**
 * Get productClick
 * @param req
 * @param res
 * @returns {details: ProductClick}
 */
async function get(req, res) {
  logger.info('Log:ProductClick Controller:get: query :' + JSON.stringify(req.query));
  let productClick = req.productClick;
  let responseJson = {
    respCode: respUtil.successResponse(req).respCode,
    details: productClick
  };
  res.json(responseJson);
};

/**
 * Create new productClick
 * @param req
 * @param res
 * @returns { respCode: respCode, respMessage: respMessage }
 */
async function create(req, res) {
  logger.info('Log:ProductClick Controller:create: body :' + JSON.stringify(req.body));
  let productClick = new ProductClick(req.body);
  productClick = productClickService.setCreateProductClickVaribles(req, productClick);
  if (productClick && productClick.entityId) {

    req.productClick = await ProductClick.save(productClick);
    req.entityType = 'productClick';
    req.activityKey = 'productClickCreate';
    req.contextId = req.productClick._id;
    // adding activity for new productClick
    res.json(respUtil.createSuccessResponse(req));
  } else {
    req.i18nkey = "entityNotFound";
    res.json(respUtil.getErrorResponse(req));
  }
};

/**
 * Update existing productClick
 * @param req
 * @param res
 * @param next
 * @returns { respCode: respCode, respMessage: respMessage }
 */
async function update(req, res, next) {
  logger.info('Log:ProductClick Controller:update: body :' + JSON.stringify(req.body));
  let productClick = req.productClick;
  productClick = Object.assign(productClick, req.body);
  productClick = productClickService.setUpdateProductClickVaribles(req, productClick);
  req.productClick = await ProductClick.save(productClick);
  req.entityType = 'productClick';
  req.activityKey = 'productClickUpdate';
  req.contextId = req.productClick._id;
  // adding productClick update activity
  res.json(respUtil.updateSuccessResponse(req));
};

/**
 * Get productClick list. based on criteria
 * @param req
 * @param res
 * @param next
 * @returns {productClicks: productClicks, pagination: pagination}
 */
async function list(req, res, next) {
  let responseJson = {};
  logger.info('Log:ProductClick Controller:list: query :' + JSON.stringify(req.query));
  const query = serviceUtil.generateListQuery(req);
  if (query.page === 1) {
    // total count 
    query.pagination.totalCount = await ProductClick.totalCount(query);
  };

  //get total productClicks
  const productClicks = await ProductClick.list(query);
  responseJson.respCode = respUtil.successResponse(req).respCode;
  responseJson.productClicks = productClicks;
  responseJson.pagination = query.pagination;
  res.json(responseJson);
};

/**
 * Delete productClick.
 * @param req
 * @param res
 * @param next
 * @returns { respCode: respCode, respMessage: respMessage }
 */
async function remove(req, res, next) {
  logger.info('Log:ProductClick Controller:remove: query :' + JSON.stringify(req.query));
  let productClick = req.productClick;
  productClick.active = false;
  productClick = productClickService.setUpdateProductClickVaribles(req, productClick);
  req.productClick = await ProductClick.save(productClick);
  req.entityType = 'productClick';
  req.activityKey = 'productClickDelete';
  req.contextId = req.productClick._id;

  // adding productClick delete activity
  res.json(respUtil.removeSuccessResponse(req));
};

async function getUniqueProductClicks(req, res) {
  let responseJson = {}
  logger.info('Log:ProductClick Controller:Get unique: query :' + JSON.stringify(req.query));
  req.aggregateType = 'productClick';
  const query = serviceUtil.generateListQuery(req);

  let productClicks = await ProductClick.getAggregate(query);
  responseJson.respCode = respUtil.successResponse(req).respCode;
  let entities = [];
  req.setting = await Settings.findOne({
    active: true,
    role: config.roles.superAdmin
  });
  let exchangerates = await Exchangerates.find({ active: true})
  if (productClicks && productClicks.length > 0) {
    for (let productClick of productClicks) {
      let query = {
        active: true,
        status: config.commonStatus.Active,
        totalAvailable:{$gt:0},
        expiryDate: { $gte: new Date() },
        _id: productClick.entityId
      }
      let entity = await Entity.findOne(query);
       if (entity) {
        entity = entityService.addAdminCommission(entity, req);
        entity = entityService.getPriceInDifferentCurrencies(entity, exchangerates);
        entities.push(entity);
      }
    }
  }
  responseJson.productClicks = entities;
  responseJson.totalCount = entities.length
  res.json(responseJson)
}

export default {
  load,
  get,
  create,
  update,
  list,
  remove,
  getUniqueProductClicks
};
