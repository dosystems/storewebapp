import Deal from '../models/deal.model';

import activityService from '../services/activity.service';
import dealService from '../services/deal.service';

import respUtil from '../utils/resp.util';
import serviceUtil from '../utils/service.util';

/**
 * Load Deal and append to req.
 * @param req
 * @param res
 * @param next
 */
async function load(req, res, next) {
  req.deal = await Deal.get(req.params.dealId);
  return next();
};

/**
 * Get deal
 * @param req
 * @param res
 * @returns {details: Deal}
 */
async function get(req, res) {
  logger.info('Log:Deal Controller:get: query :' + JSON.stringify(req.query));
  let deal = req.deal;
  let responseJson = {
    respCode: respUtil.successResponse(req).respCode,
    details: deal
  };
  res.json(responseJson);
};

/**
 * Create new deal
 * @param req
 * @param res
 * @returns { respCode: respCode, respMessage: respMessage }
 */
async function create(req, res) {
  logger.info('Log:Deal Controller:create: body :' + JSON.stringify(req.body));
  let deal = new Deal(req.body);
  deal = await dealService.setCreateDealVaribles(req, deal);
  req.deal = await Deal.save(deal);
  req.entityType = 'deal';
  req.activityKey = 'dealCreate';
  req.contextId = req.deal._id;

  // creating activity for new deal 
  activityService.insertActivity(req);

  res.json(respUtil.createSuccessResponse(req));
};

/**
 * Update existing deal
 * @param req
 * @param res
 * @param next
 * @returns { respCode: respCode, respMessage: respMessage }
 */
async function update(req, res, next) {
  logger.info('Log:Deal Controller:update: body :' + JSON.stringify(req.body));
  let deal = req.deal;

  deal = Object.assign(deal, req.body);
  deal = dealService.setUpdateDealVaribles(req, deal);
  req.deal = await Deal.save(deal);
  req.entityType = 'deal';
  req.activityKey = 'dealUpdate';
  req.contextId = req.deal._id;

  // creating activity for deal update 
  activityService.insertActivity(req);
  res.json(respUtil.updateSuccessResponse(req));
};

/**
 * Get deal list. based on criteria
 * @param req
 * @param res
 * @param next
 * @returns {deals: deals, pagination: pagination}
 */
async function list(req, res, next) {
  let responseJson = {};
  logger.info('Log:Deal Controller:list: query :' + JSON.stringify(req.query));
  req.entityType = 'deal';
  const query =  serviceUtil.generateListQuery(req);
  if (query.page === 1) {

    // total deals count in that page 
    query.pagination.totalCount = await Deal.totalCount(query);
  };

  //get total deals
  const deals = await Deal.list(query);
  responseJson.respCode = respUtil.successResponse(req).respCode;
  responseJson.deals = deals;
  responseJson.pagination = query.pagination;
  res.json(responseJson);
};

/**
 * Delete deal.
 * @param req
 * @param res
 * @param next
 * @returns { respCode: respCode, respMessage: respMessage }
 */
async function remove(req, res, next) {
  logger.info('Log:Deal Controller:remove: query :' + JSON.stringify(req.query));
  let deal = req.deal;
  deal.active = false;
  deal = dealService.setUpdateDealVaribles(req, deal);
  req.deal = await Deal.save(deal);
  req.entityType = 'deal';
  req.activityKey = 'dealDelete';
  req.contextId = req.deal._id;

  // creating activity for deal delete 
  activityService.insertActivity(req);
  res.json(respUtil.removeSuccessResponse(req));
};

export default {
  load,
  get,
  create,
  update,
  list,
  remove
};
