import CategoryRequest from '../models/categoryRequest.model';
import Seller from '../models/seller.model';

import activityService from '../services/activity.service';
import categoryRequestService from '../services/categoryRequest.service';
import renderEmailTemplateService from '../services/renderEmailTemplate.service';

import respUtil from '../utils/resp.util';
import serviceUtil from '../utils/service.util';

/**
 * Load CategoryRequest and append to req.
 * @param req
 * @param res
 * @param next
 */
async function load(req, res, next) {
  req.categoryRequest = await CategoryRequest.get(req.params.categoryRequestId);
  return next();
};

/**
 * Get categoryRequest
 * @param req
 * @param res
 * @returns {details: CategoryRequest}
 */
async function get(req, res) {
  logger.info('Log:CategoryRequest Controller:get: query :' + JSON.stringify(req.query));
  let categoryRequest = req.categoryRequest;
  let responseJson = {
    respCode: respUtil.successResponse(req).respCode,
    details: categoryRequest
  };
  res.json(responseJson);
};

/**
 * Create new categoryRequest
 * @param req
 * @param res
 * @returns { respCode: respCode, respMessage: respMessage }
 */
async function create(req, res) {
  logger.info('Log:CategoryRequest Controller:create: body :' + JSON.stringify(req.body));
  let categoryRequest = new CategoryRequest(req.body);
  categoryRequest = await categoryRequestService.setCreateCategoryRequestVaribles(req, categoryRequest);
  req.categoryRequest = await CategoryRequest.save(categoryRequest);
  req.entityType = 'categoryRequest';
  req.activityKey = 'categoryRequestCreate';
  req.contextId = req.categoryRequest._id;

  // creating activity for new categoryRequest 
  activityService.insertActivity(req);

  res.json(respUtil.createSuccessResponse(req));
};

/**
 * Update existing categoryRequest
 * @param req
 * @param res
 * @param next
 * @returns { respCode: respCode, respMessage: respMessage }
 */
async function update(req, res, next) {
  logger.info('Log:CategoryRequest Controller:update: body :' + JSON.stringify(req.body));
  let categoryRequest = req.categoryRequest;
  categoryRequest = Object.assign(categoryRequest, req.body);
  categoryRequest = categoryRequestService.setUpdateCategoryRequestVaribles(req, categoryRequest);
  req.categoryRequest = await CategoryRequest.save(categoryRequest);
  req.entityType = 'categoryRequest';
  req.activityKey = 'categoryRequestUpdate';
  req.contextId = req.categoryRequest._id;
  if(req.categoryRequest.status === "Approved" || req.categoryRequest.status === "Rejected"){
    req.seller = await Seller.get(categoryRequest.userId);
    renderEmailTemplateService.setCommonEmailVariables(req, res);
  }
  // creating activity for categoryRequest update 
  activityService.insertActivity(req);
  res.json(respUtil.updateSuccessResponse(req));
};

/**
 * Get categoryRequest list. based on criteria
 * @param req
 * @param res
 * @param next
 * @returns {categoryRequests: categoryRequests, pagination: pagination}
 */
async function list(req, res, next) {
  let responseJson = {};
  logger.info('Log:CategoryRequest Controller:list: query :' + JSON.stringify(req.query));
  req.entityType = 'categoryRequest';
  const query =  serviceUtil.generateListQuery(req);
  if (query.page === 1) {

    // total categoryRequests count in that page 
    query.pagination.totalCount = await CategoryRequest.totalCount(query);
  };

  //get total categoryRequests
  const categoryRequests = await CategoryRequest.list(query);
  responseJson.respCode = respUtil.successResponse(req).respCode;
  responseJson.categoryRequests = categoryRequests;
  responseJson.pagination = query.pagination;
  res.json(responseJson);
};

/**
 * Delete categoryRequest.
 * @param req
 * @param res
 * @param next
 * @returns { respCode: respCode, respMessage: respMessage }
 */
async function remove(req, res, next) {
  logger.info('Log:CategoryRequest Controller:remove: query :' + JSON.stringify(req.query));
  let categoryRequest = req.categoryRequest;
  categoryRequest.active = false;
  categoryRequest = categoryRequestService.setUpdateCategoryRequestVaribles(req, categoryRequest);
  req.categoryRequest = await CategoryRequest.save(categoryRequest);
  req.entityType = 'categoryRequest';
  req.activityKey = 'categoryRequestDelete';
  req.contextId = req.categoryRequest._id;

  // creating activity for categoryRequest delete 
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
