import config from '../config/config';

import Color from '../models/color.model';
import Entity from '../models/entity.model';

import activityService from '../services/activity.service';
import colorService from '../services/color.service';
import uploadeService from '../services/upload.service';

import respUtil from '../utils/resp.util';
import serviceUtil from '../utils/service.util';
/**
 * Load Color and append to req.
 * @param req
 * @param res
 * @param next
 */
async function load(req, res, next) {
  req.color = await Color.get(req.params.colorId);
  return next();
};

/**
 * Get color
 * @param req
 * @param res
 * @returns {details: Color}
 */
async function get(req, res) {
  logger.info('Log:Color Controller:get: query :' + JSON.stringify(req.query));
  let color = req.color;
  let responseJson = {
    respCode: respUtil.successResponse(req).respCode,
    details: color
  };
  res.json(responseJson);
};

/**
 * Create new color
 * @param req
 * @param res
 * @returns { respCode: respCode, respMessage: respMessage }
 */
async function create(req, res) {
  logger.info('Log:Color Controller:create: body :' + JSON.stringify(req.body));
  let color = new Color(req.body);
  color = colorService.setCreateColorVaribles(req, color);
  req.color = await Color.save(color);
  req.entityType = 'color';
  req.activityKey = 'colorCreate';
  req.contextId = req.color._id;
  req.contextName = req.color.name;

  // creating activity for new color
  activityService.insertActivity(req);

  res.json(respUtil.createSuccessResponse(req));
};

/**
 * Update existing color
 * @param req
 * @param res
 * @param next
 * @returns { respCode: respCode, respMessage: respMessage }
 */
async function update(req, res, next) {
  logger.info('Log:Color Controller:update: body :' + JSON.stringify(req.body));
  let color = req.color;
  if (req.body && req.body.sizeChart) {
    color = await colorService.updateColorDetails(req, color);
  }

  color = Object.assign(color, req.body);
  color = colorService.setUpdateColorVaribles(req, color);
  req.color = await Color.save(color);
  req.entityType = 'color';
  req.activityKey = 'colorUpdate';
  req.contextId = req.color._id;
  req.contextName = req.color.name;

  // creating update activity for color
  activityService.insertActivity(req);
  res.json(respUtil.updateSuccessResponse(req));
};

/**
 * Get color list. based on criteria
 * @param req
 * @param res
 * @param next
 * @returns {colors: colors, pagination: pagination}
 */
async function list(req, res, next) {
  let responseJson = {};
  logger.info('Log:Color Controller:list: query :' + JSON.stringify(req.query));
  req.entityType = 'color';
  const query = serviceUtil.generateListQuery(req);
  if (query.page === 1) {
    // total count 
    query.pagination.totalCount = await Color.totalCount(query);
  };

  //get total colors
  const colors = await Color.list(query);
  for (let brnd of colors) {
    let products = await Entity.find({ active: true, colorId: brnd._id })
    brnd.productCount = products.length;
  }
  responseJson.respCode = respUtil.successResponse(req).respCode;
  responseJson.colors = colors;
  responseJson.pagination = query.pagination;
  res.json(responseJson);
};

/**
 * Delete color.
 * @param req
 * @param res
 * @param next
 * @returns { respCode: respCode, respMessage: respMessage }
 */
async function remove(req, res, next) {
  logger.info('Log:Color Controller:remove: query :' + JSON.stringify(req.query));
  let color = req.color;
  color.active = false;
  color = colorService.setUpdateColorVaribles(req, color);
  req.color = await Color.save(color);
  req.entityType = 'color';
  req.activityKey = 'colorDelete';
  req.contextId = req.color._id;
  req.contextName = req.color.name;

  // create delete activity for color
  activityService.insertActivity(req);
  res.json(respUtil.removeSuccessResponse(req));
};


/**
 * upload Color sizechart image
 * @param req
 * @param res
 */
async function uploadColorImage(req, res, next) {
  logger.info('Log:color Controller :Upload sizechart image:body:' + JSON.stringify(req.body));
  req.uploadFile = [];
  req.uploadPath = 'sizeChart';
  //Calling the activity of uploading the required file
  uploadeService.upload(req, res, (err) => {
    if (err) {
      logger.error('Error:color Controller:upload sizeChart  : Error:' + JSON.stringify(err));
      req.i18nKey = "uploadDirectoryNotFound";
      res.json(respUtil.getErrorResponse(req));
    } else if (req.uploadFile && req.uploadFile[0] && req.uploadFile[0].name) {
      req.image = req.uploadFile;
      setTimeout(function () {
        res.json(respUtil.uploadLogoSucessResponse(req));
      }, 3000);
    } else {
      req.i18nKey = 'sizeChartImageUploadErrorMessage';
      res.json(respUtil.getErrorResponse(req));
    };
  });
};

export default {
  load,
  get,
  create,
  update,
  list,
  remove,
  uploadColorImage
};
