import UserPromocode from '../models/userpromocode.model';

import activityService from '../services/activity.service';
import userpromocodeService from '../services/userpromocode.service';
import uploadService from '../services/upload.service';

import respUtil from '../utils/resp.util';
import serviceUtil from '../utils/service.util';

/**
 * Load userpromocode and append to req.
 * @param req
 * @param res
 * @param next
 */
async function load(req, res, next) {
  req.userpromocode = await UserPromocode.get(req.params.userpromocodeId);
  return next();
}

/**
 * Get userpromocode
 * @param req
 * @param res
 * @returns {userpromocode}
 */
async function get(req, res) {
  logger.info('Log:UserPromocode Controller:get: query :' + JSON.stringify(req.query));
  return res.json({
    details: req.userpromocode
  });
}

/**
 * Create new userpromocode
 * @param req
 * @param res
 * @returns { respCode: respCode, respMessage: respMessage }
 */
async function create(req, res) {
  logger.info('Log:UserPromocode Controller:create: body :' + JSON.stringify(req.body));
  let userpromocode = new UserPromocode(req.body);

  // set promo code create varialbes
  userpromocode = userpromocodeService.setUserPromoCodeCreateVaribles(req, res, userpromocode);
  req.userpromocode = await UserPromocode.save(userpromocode);
  req.entityType = 'userpromocode';
  req.activityKey = 'userpromocodeCreate';
  activityService.insertActivity(req);
  return res.json(respUtil.createSuccessResponse(req));
}

/**
 * Update existing userpromocode
 * @param req
 * @param res
 * @param next
 * @returns { respCode: respCode, respMessage: respMessage }
 */
async function update(req, res, next) {
  logger.info('Log:UserPromocode Controller:update: body :' + JSON.stringify(req.body));
  let userpromocode = req.userpromocode;
  console.log(userpromocode)
  userpromocode = Object.assign(userpromocode, req.body);

  // set promo code update varialbes
  userpromocode = userpromocodeService.setUserPromoCodeUpdateVaribles(req, userpromocode);
  req.userpromocode = await UserPromocode.save(userpromocode);
  req.entityType = 'userpromocode';
  req.activityKey = 'userpromocodeUpdate';
  activityService.insertActivity(req);
  return res.json(respUtil.updateSuccessResponse(req));
}

/**
 * Get userpromocodes list. based on criteria
 * @param req
 * @param res
 * @param next
 * @returns {userpromocodes: userpromocodes, pagination: pagination}
 */
async function list(req, res, next) {
  logger.info('Log:UserPromocode Controller:list: query :' + JSON.stringify(req.query));
  req.entityType = 'userpromocode';
  const query = serviceUtil.generateListQuery(req);
  if (query.page === 1) {

    // total count 
    query.pagination.totalCount = await UserPromocode.totalCount(query);
  }

  //get total userpromocodes
  const userpromocodes = await UserPromocode.list(query);
  if (req && req.query && req.query.exportToCsv) {
    await uploadService.createCsvFileForExportToCsv(req, userpromocodes);
    return res.json({
      csvFilePath: req.csvFileName
    });
  } else {
    return res.json({
      userpromocodes: userpromocodes,
      pagination: query.pagination
    });
  }
}

/**
 * Delete userpromocode.
 * @param req
 * @param res
 * @param next
 * @returns { respCode: respCode, respMessage: respMessage }
 */
async function remove(req, res, next) {
  logger.info('Log:UserPromocode Controller:remove: body :' + JSON.stringify(req.body));
  const userpromocode = req.userpromocode;
  userpromocode.active = false;
  req.userpromocode = await UserPromocode.save(userpromocode);
  req.entityType = 'userpromocode';
  req.activityKey = 'promocodeDelete';
  activityService.insertActivity(req);
  return res.json(respUtil.removeSuccessResponse(req));
}

export default {
  load,
  get,
  create,
  update,
  list,
  remove
};
