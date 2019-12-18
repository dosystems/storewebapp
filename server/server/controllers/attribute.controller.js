import Attribute from '../models/attribute.model';

import activityService from '../services/activity.service';
import attributeService from '../services/attribute.service';

import respUtil from '../utils/resp.util';
import serviceUtil from '../utils/service.util';

/**
 * Load Attribute and append to req.
 * @param req
 * @param res
 * @param next
 */
async function load(req, res, next) {
  req.attribute = await Attribute.get(req.params.attributeId);
  return next();
};

/**
 * Get attribute
 * @param req
 * @param res
 * @returns {details: Attribute}
 */
async function get(req, res) {
  logger.info('Log:Attribute Controller:get: query :' + JSON.stringify(req.query));
  let attribute = req.attribute;
  let responseJson = {
    respCode: respUtil.successResponse(req).respCode,
    details: attribute
  };
  res.json(responseJson);
};

/**
 * Create new attribute
 * @param req
 * @param res
 * @returns { respCode: respCode, respMessage: respMessage }
 */
async function create(req, res) {
  logger.info('Log:Attribute Controller:create: body :' + JSON.stringify(req.body));
  let attribute = new Attribute(req.body);
  await attributeService.setCreateAttributeVaribles(req, attribute);

  req.attribute = await Attribute.save(attribute);
  req.entityType = 'attribute';
  req.activityKey = 'attributeCreate';
  req.contextId = req.attribute._id;
  req.contextName = req.attribute.name;
  // adding activity for new attribute
  activityService.insertActivity(req);
  res.json(respUtil.createSuccessResponse(req));
};

/**
 * Update existing attribute
 * @param req
 * @param res
 * @param next
 * @returns { respCode: respCode, respMessage: respMessage }
 */
async function update(req, res, next) {
  logger.info('Log:Attribute Controller:update: body :' + JSON.stringify(req.body));
  let attribute = req.attribute;
  attribute = attributeService.setUpdateAttributeVaribles(req, attribute);
  attribute = Object.assign(attribute, req.body)
  req.attribute = await Attribute.save(attribute);
  req.entityType = 'attribute';
  req.activityKey = 'attributeUpdate';
  req.contextId = req.attribute._id;
  req.contextName = req.attribute.name;
  // adding activity for attribute update 
  activityService.insertActivity(req);
  res.json(respUtil.updateSuccessResponse(req));
};

/**
 * Get attribute list. based on criteria
 * @param req
 * @param res
 * @param next
 * @returns {attributes: attributes, pagination: pagination}
 */
async function list(req, res, next) {
  let responseJson = {};
  logger.info('Log:Attribute Controller:list: query :' + JSON.stringify(req.query));
  req.entityType = 'attribute';
  const query =  serviceUtil.generateListQuery(req);
  if (query.page === 1) {
    // total count 
    query.pagination.totalCount = await Attribute.totalCount(query);
  };

  //get total attributes
  const attributes = await Attribute.list(query);
  responseJson.respCode = respUtil.successResponse(req).respCode;
  responseJson.attributes = attributes;
  responseJson.pagination = query.pagination;
  res.json(responseJson);
};

/**
 * Delete attribute.
 * @param req
 * @param res
 * @param next
 * @returns { respCode: respCode, respMessage: respMessage }
 */
async function remove(req, res, next) {
  logger.info('Log:Attribute Controller:remove: query :' + JSON.stringify(req.query));
  let attribute = req.attribute;
  attribute.active = false;
  attribute = attributeService.setUpdateAttributeVaribles(req, attribute);
  req.attribute = await Attribute.save(attribute);
  req.entityType = 'attribute';
  req.activityKey = 'attributeDelete';
  req.contextId = req.attribute._id;
  req.contextName = req.attribute.name;

  // adding activity for attribute delete 
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
