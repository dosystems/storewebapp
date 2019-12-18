import Activity from '../models/activity.model';

import activityService from '../services/activity.service';

import respUtil from '../utils/resp.util';
import serviceUtil from '../utils/service.util';

/**
 * Load activity and append to req.
 * @param req
 * @param res
 * @param next
 */
async function load(req, res, next) {
  req.activity = await Activity.get(req.params.activityId);
  return next();
};

/**
 * Get activity
 * @param req
 * @param res
 * @returns {Activity}
 */
async function get(req, res) {
  logger.info('Log:activity Controller:get: query :' + JSON.stringify(req.query));
  let responseJson = {};
  responseJson.respCode = respUtil.successResponse(req).respCode;
  responseJson.details = req.activity;
  res.json(responseJson);
};

/**
 * Create new activity
 * @param req
 * @param res
 * @returns { respCode: respCode, respMessage: respMessage }
 */
async function create(req, res) {
  logger.info('Log:Auth Controller:create: body :' + JSON.stringify(req.body)); let activity = new Activity(req.body);
  activity = await activityService.setActivityVaribles(req, activity);
  req.activity = await Activity.save(activity);
  req.entityType = 'activity';
  res.json(respUtil.createSuccessResponse(req));
};

/**
 * Update existing activity
 * @param req
 * @param res
 * @param next
 * @returns { respCode: respCode, respMessage: respMessage }
 */
async function update(req, res, next) {
  logger.info('Log:activity Controller:update: body :' + JSON.stringify(req.body));
  let activity = req.activity;
  activity = Object.assign(activity, req.body);
  req.activity = await Activity.save(activity);
  req.entityType = 'activity';
  res.json(respUtil.updateSuccessResponse(req));
};

/**
 * Get activity list. based on criteria
 * @param req
 * @param res
 * @param next
 * @returns {activities: activities, pagination: pagination}
 */
async function list(req, res, next) {
  logger.info('Log:activity Controller:list: query :' + JSON.stringify(req.query));
  let responseJson = {};
  const query = serviceUtil.generateListQuery(req);
  if (query.page === 1) {
    // get total count 
    query.pagination.totalCount = await Activity.totalCount(query);
  };

  //get total activities
  const activities = await Activity.list(query);
  responseJson.respCode = respUtil.successResponse(req).respCode;
  responseJson.activities = activities;
  responseJson.pagination = query.pagination;
  res.json(responseJson);
};

/**
 * Delete activity.
 * @param req
 * @param res
 * @param next
 * @returns { respCode: respCode, respMessage: respMessage }
 */
async function remove(req, res, next) {
  logger.info('Log:activity Controller:remove: query :' + JSON.stringify(req.query));
  const activity = req.activity;
  activity.active = false;
  req.activity = await Activity.save(activity);
  req.entityType = 'activity';
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
