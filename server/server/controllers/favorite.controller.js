import config from '../config/config';

import Entity from '../models/entity.model';
import Exchangerates from '../models/exchangerates.model';
import Favorite from '../models/favorite.model';
import Settings from '../models/setting.model';

import activityService from '../services/activity.service';
import entityService from '../services/entity.service';
import favoriteService from '../services/favorite.service';

import respUtil from '../utils/resp.util';
import serviceUtil from '../utils/service.util';

/**
 * Load Favorite and append to req.
 * @param req
 * @param res
 * @param next
 */
async function load(req, res, next) {
  req.favorite = await Favorite.get(req.params.favoriteId);
  return next();
};

/**
 * Get favorite
 * @param req
 * @param res
 * @returns {details: Favorite}
 */
async function get(req, res) {
  logger.info('Log:Favorite Controller:get: query :' + JSON.stringify(req.query));
  let favorite = req.favorite;
  let responseJson = {
    respCode: respUtil.successResponse(req).respCode,
    details: favorite
  };
  res.json(responseJson);
};

/**
 * Create new favorite
 * @param req
 * @param res
 * @returns { respCode: respCode, respMessage: respMessage }
 */
async function create(req, res) {
  logger.info('Log:Favorite Controller:create: body :' + JSON.stringify(req.body));
  let favorite = new Favorite(req.body);
  favorite = await favoriteService.setCreateFavoriteVaribles(req, favorite);
  req.favorite = await Favorite.save(favorite);
  req.entityType = 'favorite';
  req.activityKey = 'favoriteCreate';
  req.contextId = req.favorite._id;

  // creating activity for new favorite 
  activityService.insertActivity(req);

  res.json(respUtil.createSuccessResponse(req));
};

/**
 * Update existing favorite
 * @param req
 * @param res
 * @param next
 * @returns { respCode: respCode, respMessage: respMessage }
 */
async function update(req, res, next) {
  logger.info('Log:Favorite Controller:update: body :' + JSON.stringify(req.body));
  let favorite = req.favorite;

  favorite = Object.assign(favorite, req.body);
  favorite = favoriteService.setUpdateFavoriteVaribles(req, favorite);
  req.favorite = await Favorite.save(favorite);
  req.entityType = 'favorite';
  req.activityKey = 'favoriteUpdate';
  req.contextId = req.favorite._id;

  // creating activity for favorite update 
  activityService.insertActivity(req);
  res.json(respUtil.updateSuccessResponse(req));
};

/**
 * Get favorite list. based on criteria
 * @param req
 * @param res
 * @param next
 * @returns {favorites: favorites, pagination: pagination}
 */
async function list(req, res, next) {
  let responseJson = {};
  logger.info('Log:Favorite Controller:list: query :' + JSON.stringify(req.query));
  req.entityType = 'favorite';
  const query =  serviceUtil.generateListQuery(req);
  if (query.page === 1) {

    // total favorites count in that page 
    query.pagination.totalCount = await Favorite.totalCount(query);
  };

  //get total favorites
  const favorites = await Favorite.list(query);
  let index;
  req.setting = await Settings.findOne({
    active: true,
    role: config.roles.superAdmin
  });
  let exchangerates = await Exchangerates.find({ active: true})
  
  for (let favorite of favorites){
    index = favorites.indexOf(favorite)
    let entity = await Entity.get(favorite.entityId);
     if(entity){
      entity = entityService.addAdminCommission(entity, req);
      entity = await entityService.getPriceInDifferentCurrencies(entity, exchangerates);
      favorite.entity = entity;
      favorites.splice(index,1,favorite)

    }
  }
  responseJson.respCode = respUtil.successResponse(req).respCode;
  responseJson.favorites = favorites;
  responseJson.pagination = query.pagination;
  res.json(responseJson);
};

/**
 * Delete favorite.
 * @param req
 * @param res
 * @param next
 * @returns { respCode: respCode, respMessage: respMessage }
 */
async function remove(req, res, next) {
  logger.info('Log:Favorite Controller:remove: query :' + JSON.stringify(req.query));
  let favorite = req.favorite;
  favorite.active = false;
  favorite = favoriteService.setUpdateFavoriteVaribles(req, favorite);
  req.favorite = await Favorite.save(favorite);
  req.entityType = 'favorite';
  req.activityKey = 'favoriteDelete';
  req.contextId = req.favorite._id;

  // creating activity for favorite delete 
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
