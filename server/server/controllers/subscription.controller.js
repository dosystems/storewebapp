import Plan from '../models/plan.model';
import Subscription from '../models/subscription.model';

import activityService from '../services/activity.service';
import subscriptionService from '../services/subscription.service';

import respUtil from '../utils/resp.util';
import serviceUtil from '../utils/service.util';

/**
 * Load Subscription and append to req.
 * @param req
 * @param res
 * @param next
 */
async function load(req, res, next) {
  req.subscription = await Subscription.get(req.params.subscriptionId);
  return next();
};

/**
 * Get subscription
 * @param req
 * @param res
 * @returns {details: Subscription}
 */
async function get(req, res) {
  logger.info('Log:Subscription Controller:get: query :' + JSON.stringify(req.query));
  let subscription = req.subscription;
  let responseJson = {
    respCode: respUtil.successResponse(req).respCode,
    details: subscription
  };
  res.json(responseJson);
};

/**
 * Create new subscription
 * @param req
 * @param res
 * @returns { respCode: respCode, respMessage: respMessage }
 */
async function create(req, res) {
  logger.info('Log:Subscription Controller:create: body :' + JSON.stringify(req.body));
  let subscription = new Subscription(req.body);
  if (req.body && req.body.planId) {
    req.planDetails = await Plan.get(req.body.planId);
  }
  subscription = await subscriptionService.setCreateSubscriptionVaribles(req, subscription);
  req.subscription = await Subscription.save(subscription);
  req.entityType = 'subscription';
  req.activityKey = 'subscriptionCreate';
  req.contextId = req.subscription._id;

  // creating activity for new subscription 
  activityService.insertActivity(req);

  res.json(respUtil.createSuccessResponse(req));
};

/**
 * Update existing subscription
 * @param req
 * @param res
 * @param next
 * @returns { respCode: respCode, respMessage: respMessage }
 */
async function update(req, res, next) {
  logger.info('Log:Subscription Controller:update: body :' + JSON.stringify(req.body));
  let subscription = req.subscription;

  subscription = Object.assign(subscription, req.body);
  subscription = subscriptionService.setUpdateSubscriptionVaribles(req, subscription);
  req.subscription = await Subscription.save(subscription);
  req.entityType = 'subscription';
  req.activityKey = 'subscriptionUpdate';
  req.contextId = req.subscription._id;

  // creating activity for subscription update 
  activityService.insertActivity(req);
  res.json(respUtil.updateSuccessResponse(req));
};

/**
 * Get subscription list. based on criteria
 * @param req
 * @param res
 * @param next
 * @returns {subscriptions: subscriptions, pagination: pagination}
 */
async function list(req, res, next) {
  let responseJson = {};
  logger.info('Log:Subscription Controller:list: query :' + JSON.stringify(req.query));
  req.entityType = 'subscription';
  const query =  serviceUtil.generateListQuery(req);
  if (query.page === 1) {

    // total subscriptions count in that page 
    query.pagination.totalCount = await Subscription.totalCount(query);
  };

  //get total subscriptions
  const subscriptions = await Subscription.list(query);
  responseJson.respCode = respUtil.successResponse(req).respCode;
  responseJson.subscriptions = subscriptions;
  responseJson.pagination = query.pagination;
  res.json(responseJson);
};

/**
 * Delete subscription.
 * @param req
 * @param res
 * @param next
 * @returns { respCode: respCode, respMessage: respMessage }
 */
async function remove(req, res, next) {
  logger.info('Log:Subscription Controller:remove: query :' + JSON.stringify(req.query));
  let subscription = req.subscription;
  subscription.active = false;
  subscription = subscriptionService.setUpdateSubscriptionVaribles(req, subscription);
  req.subscription = await Subscription.save(subscription);
  req.entityType = 'subscription';
  req.activityKey = 'subscriptionDelete';
  req.contextId = req.subscription._id;

  // creating activity for subscription delete 
  activityService.insertActivity(req);
  res.json(respUtil.removeSuccessResponse(req));
};

/**
 * send mails of subcription expiring alert
 */

async function sendSubscriptionExpireMail(req, res) {
  await subscriptionService.sendMails(req,res);
  res.jsonp("success")
}

export default {
  load,
  get,
  create,
  update,
  list,
  remove,
  sendSubscriptionExpireMail
};