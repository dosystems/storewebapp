import config from '../config/config';

import Role from '../models/roles.model';

import activityService from '../services/activity.service';
import roleServise from '../services/roles.service';

import respUtil from '../utils/resp.util';
import serviceUtil from '../utils/service.util';
/**
 * Load Role and append to req.
 * @param req
 * @param res
 * @param next
 */
async function load(req, res, next) {
  req.role = await Role.get(req.params.roleId);
  return next();
};

/**
 * Get role
 * @param req
 * @param res
 * @returns {details: Role}
 */
async function get(req, res) {
  logger.info('Log:Role Controller:get: query :' + JSON.stringify(req.query));
  let role = req.role;
  let responseJson = {
    details: role
  };
  res.json(responseJson);
};

/**
 * Create new role
 * @param req
 * @param res
 * @returns { respCode: respCode, respMessage: respMessage }
 */
async function create(req, res) {
  logger.info('Log:Role Controller:create: body :' + JSON.stringify(req.body));
  let role = new Role(req.body);
  role = await roleServise.setCreateRoleVaribles(req, role);
  req.role = await Role.save(role);
  req.entityType = 'role';
  req.activityKey = 'roleCreate';
  req.contextId = req.role._id;

  // adding role create activity
  activityService.insertActivity(req);
  res.json(respUtil.createSuccessResponse(req));
};

/**
 * Update existing role
 * @param req
 * @param res
 * @param next
 * @returns { respCode: respCode, respMessage: respMessage }
 */
async function update(req, res, next) {
  logger.info('Log:Role Controller:update: body :' + JSON.stringify(req.body));
  let role = req.role;
  role = Object.assign(role, req.body);
  role = roleServise.setUpdateRoleVaribles(req, role);
  req.role = await Role.save(role);
  req.entityType = 'role';
  req.activityKey = 'roleUpdate';
  req.contextId = req.role._id;

  // adding role update activity
  activityService.insertActivity(req);
  res.json(respUtil.updateSuccessResponse(req));
};

/**
 * Get role list. based on criteria
 * @param req
 * @param res
 * @param next
 * @returns {roles: roles, pagination: pagination}
 */
async function list(req, res, next) {
  let responseJson = {};
  logger.info('Log:Role Controller:list: query :' + JSON.stringify(req.query));
  const query =  serviceUtil.generateListQuery(req);
  if (query.page === 1) {
    // total count 
    query.pagination.totalCount = await Role.totalCount(query);
  };

  //get total roles
  const roles = await Role.list(query);
  responseJson.roles = roles;
  responseJson.pagination = query.pagination;
  res.json(responseJson);
};

/**
 * Delete role.
 * @param req
 * @param res
 * @param next
 * @returns { respCode: respCode, respMessage: respMessage }
 */
async function remove(req, res, next) {
  logger.info('Log:Role Controller:remove: query :' + JSON.stringify(req.query));
  let role = req.role;
  role.active = false;
  role = roleServise.setUpdateRoleVaribles(req, role);
  req.role = await Role.save(role);
  req.entityType = 'role';
  req.activityKey = 'roleDelete';
  req.contextId = req.role._id;

  // adding role delete activity
  activityService.insertActivity(req);
  res.json(respUtil.removeSuccessResponse(req));
};

export default {
  load,
  create,
  get,
  update,
  remove,
  list
}