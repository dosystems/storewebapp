import Payment from '../models/payment.model';

import activityService from '../services/activity.service';
import paymentService from '../services/payment.service';

import respUtil from '../utils/resp.util';
import serviceUtil from '../utils/service.util';

/**
 * Load Payment and append to req.
 * @param req
 * @param res
 * @param next
 */
async function load(req, res, next) {
  req.payment = await Payment.get(req.params.paymentId);
  return next();
};

/**
 * Get payment
 * @param req
 * @param res
 * @returns {details: Payment}
 */
async function get(req, res) {
  logger.info('Log:Payment Controller:get: query :' + JSON.stringify(req.query));
  let payment = req.payment;
  let responseJson = {
    respCode: respUtil.successResponse(req).respCode,
    details: payment
  };
  res.json(responseJson);
};

/**
 * Create new payment
 * @param req
 * @param res
 * @returns { respCode: respCode, respMessage: respMessage }
 */
async function create(req, res) {
  logger.info('Log:Payment Controller:create: body :' + JSON.stringify(req.body));
  let payment = new Payment(req.body);
  payment = await paymentService.setCreatePaymentVaribles(req, payment);
  req.payment = await Payment.save(payment);
  req.entityType = 'payment';
  req.activityKey = 'paymentCreate';
  req.contextId = req.payment._id;

  // creating activity for new payment 
  activityService.insertActivity(req);

  res.json(respUtil.createSuccessResponse(req));
};

/**
 * Update existing payment
 * @param req
 * @param res
 * @param next
 * @returns { respCode: respCode, respMessage: respMessage }
 */
async function update(req, res, next) {
  logger.info('Log:Payment Controller:update: body :' + JSON.stringify(req.body));
  let payment = req.payment;

  payment = Object.assign(payment, req.body);
  payment = paymentService.setUpdatePaymentVaribles(req, payment);
  req.payment = await Payment.save(payment);
  req.entityType = 'payment';
  req.activityKey = 'paymentUpdate';
  req.contextId = req.payment._id;

  // creating activity for payment update 
  activityService.insertActivity(req);
  res.json(respUtil.updateSuccessResponse(req));
};

/**
 * Get payment list. based on criteria
 * @param req
 * @param res
 * @param next
 * @returns {payments: payments, pagination: pagination}
 */
async function list(req, res, next) {
  let responseJson = {};
  logger.info('Log:Payment Controller:list: query :' + JSON.stringify(req.query));
  req.entityType = 'payment';
  const query =  serviceUtil.generateListQuery(req);
  if (query.page === 1) {

    // total payments count in that page 
    query.pagination.totalCount = await Payment.totalCount(query);
  };

  //get total payments
  const payments = await Payment.list(query);
  responseJson.respCode = respUtil.successResponse(req).respCode;
  responseJson.payments = payments;
  responseJson.pagination = query.pagination;
  res.json(responseJson);
};

/**
 * Delete payment.
 * @param req
 * @param res
 * @param next
 * @returns { respCode: respCode, respMessage: respMessage }
 */
async function remove(req, res, next) {
  logger.info('Log:Payment Controller:remove: query :' + JSON.stringify(req.query));
  let payment = req.payment;
  payment.active = false;
  payment = paymentService.setUpdatePaymentVaribles(req, payment);
  req.payment = await Payment.save(payment);
  req.entityType = 'payment';
  req.activityKey = 'paymentDelete';
  req.contextId = req.payment._id;

  // creating activity for payment delete 
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