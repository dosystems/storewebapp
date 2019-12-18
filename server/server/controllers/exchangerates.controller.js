import cron from 'node-cron';
import request from 'request';
import config from '../config/config';
import Exchangerates from '../models/exchangerates.model';

import activityService from '../services/activity.service';
import exchangeratesService from '../services/exchangerates.service';

import i18nUtil from '../utils/i18n.util';
import respUtil from '../utils/resp.util';
import serviceUtil from '../utils/service.util';

/**
  * Implement async for each process
  * @param {Array} array 
  * @param {Function} callback 
  */
async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array)
  }
}

/**
 * Load Exchangerates and append to req.
 * @param req
 * @param res
 * @param next
 */
async function load(req, res, next) {
  req.exchangerates = await Exchangerates.get(req.params.exchangeratesId);
  return next();
}
/**
 * Get exchangerates
 * @param req
 * @param res
 * @returns {details: exchangerates}
 */

async function get(req, res) {
  logger.info('Log:exchangerates Controller:get: query :' + JSON.stringify(req.query));
  req.query = await serviceUtil.generateListQuery(req);
  let exchangerates = req.exchangerates;
  logger.info('Log:exchangerates Controller:get:' + i18nUtil.getI18nMessage('recordFound'));
  let responseJson = {
    respCode: respUtil.successResponse(req).respCode,
    details: exchangerates
  };
  res.json(responseJson);
}
/**
 * Create new exchangerates
 * @param req
 * @param res
 * @returns { respCode: respCode, respMessage: respMessage }
 */
async function create(req, res) {
  logger.info('Log:exchangerates Controller:create: body :' + JSON.stringify(req.body));
  let exchangerates = new Exchangerates(req.body);
  if (req.tokenInfo && req.tokenInfo.loginType === 'employee') {
    if (req.tokenInfo._id) {
      exchangerates.createdBy.employee = req.tokenInfo._id;
    }
  } else {
    req.i18nKey = 'not_an_admin';
    logger.error('Error:exchangerates Controller:create:' + i18nUtil.getI18nMessage('not_an_admin'));
    return res.json(respUtil.getErrorResponse(req));
  }
  if (!exchangerates.buyRate || !exchangerates.sellRate || exchangerates.buyRate < exchangerates.sellRate) {
    req.i18nKey = 'buyrate_must_be_greater_than_sellrate';
    logger.error('Error:exchangerates Controller:create:' + i18nUtil.getI18nMessage('buyrate_must_be_greater_than_sellrate'));
    return res.json(respUtil.getErrorResponse(req));
  }
  req.exchangerates = await Exchangerates.save(exchangerates);
  req.entityType = 'exchangerates';
  req.activityKey = 'exchangeratesCreate';
  // for creating employee activity
  activityService.insertActivity(req);
  logger.info('Log:exchangerates Controller:create:' + i18nUtil.getI18nMessage('exchangeratesCreate'));
  res.json(respUtil.createSuccessResponse(req));
}

/**
 * Update existing exchangerates
 * @param req
 * @param res
 * @param next
 * @returns { respCode: respCode, respMessage: respMessage }
 */
async function update(req, res, next) {
  logger.info('Log:exchangerates Controller:update: body :' + JSON.stringify(req.body));
  let exchangerates = req.exchangerates;
  exchangerates = Object.assign(exchangerates, req.body);
  if (req.tokenInfo && req.tokenInfo.loginType === 'employee') {
    if (req.tokenInfo._id) {
      exchangerates.updatedBy.employee = req.tokenInfo._id;
    }
  } else {
    req.i18nKey = 'not_an_admin';
    logger.error('Error:exchangerates Controller:update:' + i18nUtil.getI18nMessage('not_an_admin'));
    return res.json(respUtil.getErrorResponse(req));
  }
  if (!exchangerates.buyRate || !exchangerates.sellRate || exchangerates.buyRate < exchangerates.sellRate) {
    req.i18nKey = 'buyrate_must_be_greater_than_sellrate';
    logger.error('Error:exchangerates Controller:create:' + i18nUtil.getI18nMessage('buyrate_must_be_greater_than_sellrate'));
    return res.json(respUtil.getErrorResponse(req));
  }
  exchangerates.updated = Date.now();
  if (req.body.type === 'api') {
    exchangerates = await changeExchangeratesTypeToAPI(exchangerates);
  }
  req.exchangerates = await Exchangerates.save(exchangerates);
  req.entityType = 'exchangerates';
  req.activityKey = 'exchangeratesUpdate';
  // for updating employee activity
  activityService.insertActivity(req);
  logger.info('Log:exchangerates Controller:update:' + i18nUtil.getI18nMessage('exchangeratesUpdate'));
  res.json(respUtil.updateSuccessResponse(req));
}

/**
 * Get exchangerates list. based on criteria
 * @param req
 * @param res
 * @param next
 * @returns {exchangerates: exchangerates, pagination: pagination}
 */
async function list(req, res, next) {
  logger.info('Log:exchangerates Controller:list: query :' + JSON.stringify(req.query));
  const query = await serviceUtil.generateListQuery(req);
  if (query.page === 1) {
    //  total count;
    query.pagination.totalCount = await Exchangerates.totalCount(query);
  }
  //get total exchangerates
  const exchangeratess = await Exchangerates.list(query);
  logger.info('Log:exchangerates Controller:list:' + i18nUtil.getI18nMessage('recordsFound'));
  let responseJson = {
    respCode: respUtil.successResponse(req).respCode,
  };
  responseJson.exchangerates = exchangeratess;
  responseJson.pagination = query.pagination;
  res.json(responseJson)
}

/**
 * Delete exchangerates.
 * @param req
 * @param res
 * @param next
 * @returns { respCode: respCode, respMessage: respMessage }
 */
async function remove(req, res, next) {
  logger.info('Log:exchangerates Controller:remove: query :' + JSON.stringify(req.query));
  const exchangerates = req.exchangerates;
  exchangerates.active = false;
  if (req.tokenInfo && req.tokenInfo.loginType === 'employee') {
    if (req.tokenInfo._id) {
      exchangerates.updatedBy.employee = req.tokenInfo._id;
    }
  } else {
    req.i18nKey = 'not_an_admin';
    logger.error('Error:exchangerates Controller:remove:' + i18nUtil.getI18nMessage('not_an_admin'));
    return res.json(respUtil.getErrorResponse(req));
  }
  exchangerates.updated = Date.now();
  req.exchangerates = await Exchangerates.save(exchangerates);
  req.entityType = 'exchangerates';
  req.activityKey = 'exchangeratesDelete';
  // for deleting employee activity
  activityService.insertActivity(req);
  res.json(respUtil.removeSuccessResponse(req));
}

/**
 * get a Exchangerate by Pair
 * @param req
 * @param res
 */
async function getExchangerateByPair(req, res) {
  logger.info('Log:exchangerates Controller:getExchangerateByPair: query :' + JSON.stringify(req.query));
  let responseJson = { respCode: 200, respMessage: i18nUtil.getI18nMessage('exchangerates_list_success') };
  let pair = '';
  if (req && req.query && req.query.pair) {
    pair = req.query.pair;
  }
  let exchangerate = await Exchangerates.getExchangerateByPair(pair);
  responseJson.details = exchangerate;
  res.jsonp(responseJson);
}

/**
 * update Exchangerate by type changes
 * @param req
 * @param res
 */
async function updateExchangeratesForTypeAPI(req, res) {
  let query = {};
  query.filter = { active: true, type: 'api' };
  let exchagePairs = await Exchangerates.list(query);
  if (exchagePairs && exchagePairs.length > 0) {
    await asyncForEach(exchagePairs, async (exchangePair, exchangekey) => {
      // split the pair
      let currency = exchangePair.pair.split("/");
      let reqData = { fromCurrency: currency[0], toCurrency: currency[1] };
      let newPrice = await exchangeratesService.getLatestExchangeratesFromAPI(reqData);
      exchangePair.sellRate = newPrice;
      exchangePair.buyRate = newPrice;
      await Exchangerates.save(exchangePair);
    })
    return res.jsonp({ 'respCode': 200, respMessage: 'Exchangerates new prices updated successfully' });
  }
}

/**
 * change Exchangerate type to API
 * @param req
 * @param res
 */
async function changeExchangeratesTypeToAPI(exchangerate) {
  // split the pair
  let currency = exchangerate.pair.split("/");
  let reqData = { fromCurrency: currency[0], toCurrency: currency[1] };
  let newPrice = await exchangeratesService.getLatestExchangeratesFromAPI(reqData);
  exchangerate.type = 'api';
  exchangerate.sellRate = newPrice;
  exchangerate.buyRate = newPrice;
  return exchangerate;
}

cron.schedule('0 5 * * *', function () {
  getExhangeRates();
});

async function getExhangeRates(req, res) {
  let userCallback;
  function getRates(req, callback) {
    var options = {
      method: 'GET',
      url: config.urls.ratesUrl
    }
    request(options, function (err, response, body) {
      if (err) {
        console.error('Error token response ' + new Date() + ': ' + err);
      } else {
        if (callback) {
          userCallback = callback;
        }
        // get user data from db ..................
        setTimeout(function () { userCallback(response) }, 3000);
      }
    });

  }
  getRates(req, async function (data) {
    let rates = JSON.parse(data.body);
    if (rates && rates.exchangerates && rates.exchangerates.length > 0) {
      for(let rate of rates.exchangerates){
        let exchagerate = await Exchangerates.findOne({pair:rate.pair});
        if(exchagerate){
          exchagerate.sellRate = rate.sellRate;
          exchagerate.buyRate = rate.buyRate;
          await Exchangerates.save(exchagerate);
        } else {
          exchagerate = new Exchangerates(rate);
          await Exchangerates.save(exchagerate);
        }
      }
      // await Exchangerates.remove()
      // await Exchangerates.insertMany(rates.exchangerates);
    }
  })
}

export default {
  load,
  get,
  create,
  update,
  list,
  remove,
  getExchangerateByPair,
  updateExchangeratesForTypeAPI,
  changeExchangeratesTypeToAPI,
 // getExhangeRates
};
