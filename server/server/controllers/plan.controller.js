import Plan from '../models/plan.model';

import activityService from '../services/activity.service';
import planService from '../services/plan.service';

import respUtil from '../utils/resp.util';
import serviceUtil from '../utils/service.util';

/**
 * Load Plan and append to req.
 * @param req
 * @param res
 * @param next
 */
async function load(req, res, next) {
  req.plan = await Plan.get(req.params.planId);
  return next();
};

/**
 * Get plan
 * @param req
 * @param res
 * @returns {details: Plan}
 */
async function get(req, res) {
  logger.info('Log:Plan Controller:get: query :' + JSON.stringify(req.query));
  let plan = req.plan;
  let responseJson = {
    respCode: respUtil.successResponse(req).respCode,
    details: plan
  };
  res.json(responseJson);
};

/**
 * Create new plan
 * @param req
 * @param res
 * @returns { respCode: respCode, respMessage: respMessage }
 */
async function create(req, res) {
  logger.info('Log:Plan Controller:create: body :' + JSON.stringify(req.body));
  let plan = new Plan(req.body);
  plan = await planService.setCreatePlanVaribles(req, plan);
  req.plan = await Plan.save(plan);
  req.entityType = 'plan';
  req.activityKey = 'planCreate';
  req.contextId = req.plan._id;

  // creating activity for new plan 
  activityService.insertActivity(req);

  res.json(respUtil.createSuccessResponse(req));
};

/**
 * Update existing plan
 * @param req
 * @param res
 * @param next
 * @returns { respCode: respCode, respMessage: respMessage }
 */
async function update(req, res, next) {
  logger.info('Log:Plan Controller:update: body :' + JSON.stringify(req.body));
  let plan = req.plan;

  plan = Object.assign(plan, req.body);
  plan = planService.setUpdatePlanVaribles(req, plan);
  req.plan = await Plan.save(plan);
  req.entityType = 'plan';
  req.activityKey = 'planUpdate';
  req.contextId = req.plan._id;

  // creating activity for plan update 
  activityService.insertActivity(req);
  res.json(respUtil.updateSuccessResponse(req));
};

/**
 * Get plan list. based on criteria
 * @param req
 * @param res
 * @param next
 * @returns {plans: plans, pagination: pagination}
 */
async function list(req, res, next) {
  let responseJson = {};
  logger.info('Log:Plan Controller:list: query :' + JSON.stringify(req.query));
  req.entityType = 'plan';
  const query =  serviceUtil.generateListQuery(req);
  if (query.page === 1) {

    // total plans count in that page 
    query.pagination.totalCount = await Plan.totalCount(query);
  };

  //get total plans
  const plans = await Plan.list(query);
  responseJson.respCode = respUtil.successResponse(req).respCode;
  responseJson.plans = plans;
  responseJson.pagination = query.pagination;
  res.json(responseJson);
};

/**
 * Delete plan.
 * @param req
 * @param res
 * @param next
 * @returns { respCode: respCode, respMessage: respMessage }
 */
async function remove(req, res, next) {
  logger.info('Log:Plan Controller:remove: query :' + JSON.stringify(req.query));
  let plan = req.plan;
  plan.active = false;
  plan = planService.setUpdatePlanVaribles(req, plan);
  req.plan = await Plan.save(plan);
  req.entityType = 'plan';
  req.activityKey = 'planDelete';
  req.contextId = req.plan._id;

  // creating activity for plan delete 
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