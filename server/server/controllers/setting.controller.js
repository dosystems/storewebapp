import Setting from '../models/setting.model';

import activityService from '../services/activity.service';
import settingService from '../services/setting.service';

import respUtil from '../utils/resp.util';
import serviceUtil from '../utils/service.util';

/**
 * Load Setting and append to req.
 * @param req
 * @param res
 * @param next
 */
async function load(req, res, next) {
  req.setting = await Setting.get(req.params.settingId);
  return next();
};

/**
 * Get setting
 * @param req
 * @param res
 * @returns {details: Setting}
 */
async function get(req, res) {
  logger.info('Log:Setting Controller:get: query :' + JSON.stringify(req.query));
  let setting = req.setting;
  if (setting.categories && setting.categories.length > 0) {
    setting['categories'].forEach((element, index) => {
      if (element.active === false) {
        delete setting['categories'][index]
      };
    });
    setting['categories'] = setting['categories'].filter(function (item) { return item != null })
  }
  if (setting.vendorWisePercentages && setting.vendorWisePercentages.length > 0) {
    setting['vendorWisePercentages'].forEach((element, index) => {
      if (element.active === false) {
        delete setting['vendorWisePercentages'][index]
      };
    });
    setting['vendorWisePercentages'] = setting['vendorWisePercentages'].filter(function (item) { return item != null })
  }

  let responseJson = {
    respCode: respUtil.successResponse(req).respCode,
    details: setting
  };
  res.json(responseJson);
};

/**
 * Create new setting
 * @param req
 * @param res
 * @returns { respCode: respCode, respMessage: respMessage }
 */
async function create(req, res) {
  logger.info('Log:Setting Controller:create: body :' + JSON.stringify(req.body));
  let setting = new Setting(req.body);
  setting = settingService.setCreateSettingVaribles(req, setting);
  req.setting = await Setting.save(setting);
  req.entityType = 'setting';
  req.activityKey = 'settingCreate';
  req.contextId = req.setting._id;

  // adding setting create activity
  activityService.insertActivity(req);

  res.json(respUtil.createSuccessResponse(req));
};

/**
 * Update existing setting
 * @param req
 * @param res
 * @param next
 * @returns { respCode: respCode, respMessage: respMessage }
 */
async function update(req, res, next) {
  logger.info('Log:Setting Controller:update: body :' + JSON.stringify(req.body));
  let setting = req.setting;
  if (req.body.category || req.body.vendorWisePercentage) {
    setting = settingService.updateSettingDetails(req, setting)
  }
  setting = Object.assign(setting, req.body);
  setting = settingService.setUpdateSettingVaribles(req, setting);
  req.setting = await Setting.save(setting);
  req.entityType = 'setting';
  req.activityKey = 'settingUpdate';
  req.contextId = req.setting._id;

  // adding setting update activity
  activityService.insertActivity(req);
  res.json(respUtil.updateSuccessResponse(req));
};

/**
 * Get setting list. based on criteria
 * @param req
 * @param res
 * @param next
 * @returns {settings: settings, pagination: pagination}
 */
async function list(req, res, next) {
  let responseJson = {};
  logger.info('Log:Setting Controller:list: query :' + JSON.stringify(req.query));
  req.entityType = 'setting';
  const query = serviceUtil.generateListQuery(req);
  if (query.page === 1) {
    // total count 
    query.pagination.totalCount = await Setting.totalCount(query);
  };

  //get total settings
  const settings = await Setting.list(query);
  if (settings.length > 0) {
    for (let setting of settings) {
      if (setting.categories && setting.categories.length > 0) {
        setting['categories'].forEach((element, index) => {
          if (element.active === false) {
            delete setting['categories'][index]
          };
        });
        setting['categories'] = setting['categories'].filter(function (item) { return item != null })
      }
      if (setting.vendorWisePercentages && setting.vendorWisePercentages.length > 0) {
        setting['vendorWisePercentages'].forEach((element, index) => {
          if (element.active === false) {
            delete setting['vendorWisePercentages'][index]
          };
        });
        setting['vendorWisePercentages'] = setting['vendorWisePercentages'].filter(function (item) { return item != null })
      }

      //forming array of percentages details
      if (query && query.filter && query.filter.role && query.filter.role.$in && query.filter.role.$in === "Super Admin") {
        responseJson.superAdminCharges = [];
        if (setting.categories && setting.categories.length > 0) {
          for (let category of setting.categories) {
            let chrgesObj = {
              name: category.name,
              adminCharge: category.adminCharge,
              id: category._id,
              categoryId: category.categoryId,
              type: "Category"
            }
            responseJson.superAdminCharges.push(chrgesObj);
          }
        }
        if (setting.vendorWisePercentages && setting.vendorWisePercentages.length > 0) {
          for (let vendorPercentage of setting.vendorWisePercentages) {
            let chrgesObj = {
              name: vendorPercentage.name,
              adminCharge: vendorPercentage.adminCharge,
              vendorId: vendorPercentage.vendorId,
              id: vendorPercentage._id,
              type: "Vendor"
            }
            responseJson.superAdminCharges.push(chrgesObj);
          }
        }
      }
    };
  };
  //adding filter for percentages array
  if(responseJson.superAdminCharges && responseJson.superAdminCharges.length > 0){
    if (query && query.sortfield && query.sortfield === "name" || query.sortfield === "adminCharge" || query.sortfield === "type" ) {
      if (query && query.direction && query.direction === "desc") {
        responseJson.superAdminCharges.sort((a, b) => {
          if (query.sortfield) {
            let field = query.sortfield
            return b[field] > a[field];
          }
        })
      }
      if (query && query.direction && query.direction === "asc") {
        responseJson.superAdminCharges.sort((a, b) => {
          if (query.sortfield) {
            let field = query.sortfield;
            return a[field] > b[field];
          }
        })
      }
    } 
  }
  responseJson.respCode = respUtil.successResponse(req).respCode;
  responseJson.settings = settings;
  responseJson.pagination = query.pagination;
  res.json(responseJson);
};

/**
 * Delete setting.
 * @param req
 * @param res
 * @param next
 * @returns { respCode: respCode, respMessage: respMessage }
 */
async function remove(req, res, next) {
  logger.info('Log:Setting Controller:remove: query :' + JSON.stringify(req.query));
  let setting = req.setting;
  setting.active = false;
  setting = settingService.setUpdateSettingVaribles(req, setting);
  req.setting = await Setting.save(setting);
  req.entityType = 'setting';
  req.activityKey = 'settingDelete';
  req.contextId = req.setting._id;

  // adding setting delete activity
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
