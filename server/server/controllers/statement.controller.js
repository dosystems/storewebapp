import Statement from '../models/statement.model';

import activityService from '../services/activity.service';
import statementService from '../services/statement.service';

import respUtil from '../utils/resp.util';
import serviceUtil from '../utils/service.util';

/**
 * Load Statement and append to req.
 * @param req
 * @param res
 * @param next
 */
async function load(req, res, next) {
  req.statement = await Statement.get(req.params.statementId);
  return next();
};

/**
 * Get statement
 * @param req
 * @param res
 * @returns {details: Statement}
 */
async function get(req, res) {
  logger.info('Log:Statement Controller:get: query :' + JSON.stringify(req.query));
  let statement = req.statement;
  let responseJson = {
    respCode: respUtil.successResponse(req).respCode,
    details: statement
  };
  res.json(responseJson);
};

/**
 * Create new statement
 * @param req
 * @param res
 * @returns { respCode: respCode, respMessage: respMessage }
 */
async function create(req, res) {
  logger.info('Log:Statement Controller:create: body :' + JSON.stringify(req.body));
  let statement = new Statement(req.body);
  statement = statementService.setCreateStatementVaribles(req, statement);
  req.statement = await Statement.save(statement);
  req.entityType = 'statement';
  req.activityKey = 'statementCreate';
  req.contextId = req.statement._id;

  // adding statement create activity
  activityService.insertActivity(req);

  res.json(respUtil.createSuccessResponse(req));
};

/**
 * Update existing statement
 * @param req
 * @param res
 * @param next
 * @returns { respCode: respCode, respMessage: respMessage }
 */
async function update(req, res, next) {
  logger.info('Log:Statement Controller:update: body :' + JSON.stringify(req.body));
  let statement = req.statement;

  statement = Object.assign(statement, req.body);
  statement = statementService.setUpdateStatementVaribles(req, statement);
  req.statement = await Statement.save(statement);
  req.entityType = 'statement';
  req.activityKey = 'statementUpdate';
  req.contextId = req.statement._id;

  // adding statement update activity
  activityService.insertActivity(req);
  res.json(respUtil.updateSuccessResponse(req));
};

/**
 * Get statement list. based on criteria
 * @param req
 * @param res
 * @param next
 * @returns {statements: statements, pagination: pagination}
 */
async function list(req, res, next) {
  let responseJson = {};
  logger.info('Log:Statement Controller:list: query :' + JSON.stringify(req.query));
  req.entityType = 'statement';
  const query =  serviceUtil.generateListQuery(req);
  if (query.page === 1) {
    // total count 
    query.pagination.totalCount = await Statement.totalCount(query);
  };

  //get total statements
  const statements = await Statement.list(query);
  responseJson.respCode = respUtil.successResponse(req).respCode;
  responseJson.statements = statements;
  responseJson.pagination = query.pagination;
  res.json(responseJson);
};

/**
 * Delete statement.
 * @param req
 * @param res
 * @param next
 * @returns { respCode: respCode, respMessage: respMessage }
 */
async function remove(req, res, next) {
  logger.info('Log:Statement Controller:remove: query :' + JSON.stringify(req.query));
  let statement = req.statement;
  statement.active = false;
  statement = statementService.setUpdateStatementVaribles(req, statement);
  req.statement = await Statement.save(statement);
  req.entityType = 'statement';
  req.activityKey = 'statementDelete';
  req.contextId = req.statement._id;

  // adding statement delete activity
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
