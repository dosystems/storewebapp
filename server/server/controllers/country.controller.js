import Country from '../models/country.model';

import countryService from '../services/country.service';

import respUtil from '../utils/resp.util';
import serviceUtil from '../utils/service.util';

/**
 * Load Country and append to req.
 * @param req
 * @param res
 * @param next
 */
async function load(req, res, next) {
  req.country = await Country.get(req.params.countryId);
  return next();
};

/**
 * Get country
 * @param req
 * @param res
 * @returns {details: Country}
 */
async function get(req, res) {
  logger.info('Log:Country Controller:get: query :' + JSON.stringify(req.query));
  let country = req.country;
  let responseJson = {
    respCode: respUtil.successResponse(req).respCode,
    details: country
  };
  res.json(responseJson);
};

/**
 * Create new country
 * @param req
 * @param res
 * @returns { respCode: respCode, respMessage: respMessage }
 */
async function create(req, res) {
  logger.info('Log:Country Controller:create: body :' + JSON.stringify(req.body));
  let country = new Country(req.body);
  country = countryService.setCreateCountryVaribles(req, country);
  req.country = await Country.save(country);
  req.entityType = 'country';
  req.activityKey = 'countryCreate';
  req.contextId = req.country._id;
  // adding activity for new country
  res.json(respUtil.createSuccessResponse(req));
};

/**
 * Update existing country
 * @param req
 * @param res
 * @param next
 * @returns { respCode: respCode, respMessage: respMessage }
 */
async function update(req, res, next) {
  logger.info('Log:Country Controller:update: body :' + JSON.stringify(req.body));
  let country = req.country;
  country = Object.assign(country, req.body);
  country = countryService.setUpdateCountryVaribles(req, country);
  req.country = await Country.save(country);
  req.entityType = 'country';
  req.activityKey = 'countryUpdate';
  req.contextId = req.country._id;
  // adding country update activity
  res.json(respUtil.updateSuccessResponse(req));
};

/**
 * Get country list. based on criteria
 * @param req
 * @param res
 * @param next
 * @returns {countrys: countrys, pagination: pagination}
 */
async function list(req, res, next) {
  let responseJson = {};
  logger.info('Log:Country Controller:list: query :' + JSON.stringify(req.query));
  req.entityType = 'country';
  const query =  serviceUtil.generateListQuery(req);
  if (query.page === 1) {
    // total count 
    query.pagination.totalCount = await Country.totalCount(query);
  };

  //get total countrys
  const countrys = await Country.list(query);
  responseJson.respCode = respUtil.successResponse(req).respCode;
  responseJson.countrys = countrys;
  responseJson.pagination = query.pagination;
  res.json(responseJson);
};

/**
 * Delete country.
 * @param req
 * @param res
 * @param next
 * @returns { respCode: respCode, respMessage: respMessage }
 */
async function remove(req, res, next) {
  logger.info('Log:Country Controller:remove: query :' + JSON.stringify(req.query));
  let country = req.country;
  country.active = false;
  country = countryService.setUpdateCountryVaribles(req, country);
  req.country = await Country.save(country);
  req.entityType = 'country';
  req.activityKey = 'countryDelete';
  req.contextId = req.country._id;

  // adding country delete activity
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
