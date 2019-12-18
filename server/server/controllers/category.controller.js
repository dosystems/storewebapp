import Category from '../models/category.model';

import activityService from '../services/activity.service';
import categoryService from '../services/category.service';

import respUtil from '../utils/resp.util';
import serviceUtil from '../utils/service.util';

/**
 * Load Category and append to req.
 * @param req
 * @param res
 * @param next
 */
async function load(req, res, next) {
  req.category = await Category.get(req.params.categoryId);
  return next();
};

/**
 * Get category
 * @param req
 * @param res
 * @returns {details: Category}
 */
async function get(req, res) {
  logger.info('Log:Category Controller:get: query :' + JSON.stringify(req.query));
  let category = req.category;
  let responseJson = {
    respCode: respUtil.successResponse(req).respCode,
    details: category
  };
  req.query =  serviceUtil.generateListQuery(req);
  req.history = [];
  req.query.filter.contextId = category.id;
  await activityService.getHistory(req);
  if (req.history.length > 0) {
    responseJson.history = req.history;
  };
  res.json(responseJson);
};

/**
 * Create new category
 * @param req
 * @param res
 * @returns { respCode: respCode, respMessage: respMessage }
 */
async function create(req, res) {
  logger.info('Log:Category Controller:create: body :' + JSON.stringify(req.body));
  let category = new Category(req.body);
  category = categoryService.setCreateCategoryVaribles(req, category);
  req.category = await Category.save(category);
  req.entityType = 'category';
  req.activityKey = 'categoryCreate';
  req.contextId = req.category._id;
  req.contextName = req.category.name;

  // creating activity for new category 
  activityService.insertActivity(req);

  res.json(respUtil.createSuccessResponse(req));
};

/**
 * Update existing category
 * @param req
 * @param res
 * @param next
 * @returns { respCode: respCode, respMessage: respMessage }
 */
async function update(req, res, next) {
  logger.info('Log:Category Controller:update: body :' + JSON.stringify(req.body));
  let category = req.category;

  category = Object.assign(category, req.body);
  category = await categoryService.setUpdateCategoryVaribles(req, category);
  req.category = await Category.save(category);
  req.entityType = 'category';
  req.activityKey = 'categoryUpdate';
  req.contextId = req.category._id;
  req.contextName = req.category.name;

  // creating activity for category update 
  activityService.insertActivity(req);
  res.json(respUtil.updateSuccessResponse(req));
};

/**
 * Get category list. based on criteria
 * @param req
 * @param res
 * @param next
 * @returns {categorys: categorys, pagination: pagination}
 */
async function list(req, res, next) {
  let responseJson = {};
  logger.info('Log:Category Controller:list: query :' + JSON.stringify(req.query));
  req.entityType = 'category';
  const query =  serviceUtil.generateListQuery(req);
  if (query.page === 1) {

    // total categories count in that page 
    query.pagination.totalCount = await Category.totalCount(query);
  };

  //get total categories
  const categories = await Category.list(query);
  responseJson.respCode = respUtil.successResponse(req).respCode;
  responseJson.categories = await categoryService.setCategoryCounts(req, categories);
  responseJson.pagination = query.pagination;
  res.json(responseJson);
};

/**
 * Delete category.
 * @param req
 * @param res
 * @param next
 * @returns { respCode: respCode, respMessage: respMessage }
 */
async function remove(req, res, next) {
  logger.info('Log:Category Controller:remove: query :' + JSON.stringify(req.query));
  let category = req.category;
  category.active = false;
  category = await categoryService.setUpdateCategoryVaribles(req, category);
  req.category = await Category.save(category);
  req.entityType = 'category';
  req.activityKey = 'categoryDelete';
  req.contextId = req.category._id;
  req.contextName = req.category.name;

  // creating activity for category delete 
  activityService.insertActivity(req);
  res.json(respUtil.removeSuccessResponse(req));
};


// creates multiple unique categories 
async function createMultipleCategories(req, res) {
  logger.info('Log:Category Controller:Create Multiple: query :' + JSON.stringify(req.body));
  if (req.body.categories) {
    await categoryService.createCategories(req);
  };
  req.entityType = 'category';
  req.activityKey = 'categoryMultiple';

  // creating activity for new category 
  let responseJson = respUtil.createSuccessResponse(req);
  responseJson.categoryId = undefined;
  res.json(responseJson);
};


export default {
  load,
  get,
  create,
  update,
  list,
  remove,
  createMultipleCategories
};
