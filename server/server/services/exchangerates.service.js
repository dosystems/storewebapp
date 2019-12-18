import Promise from 'bluebird';
import request from 'request';

import config from '../config/config';

import Exchangerates from '../models/exchangerates.model';

import i18nUtil from '../utils/i18n.util';
import session from '../utils/session.util';

/**
 * Convert key value mapping to array
 * @param {Object} data 
 * @returns {Object} | ["BTC/USD",8122.58,8122.56,0.25]
 */
function prepareExchangerateData(exchange) {
  let data = {
    pair: exchange.pair,
    sellRate: exchange.sellRate,
    buyRate: exchange.buyRate,
    fee: exchange.fee,
    maximum: exchange.maximum,
    minimum: exchange.minimum
  };

  return data;
}

/**
 * set exchangerates variables
 * @returns {exchangerates}
 */

function setCreateExchangeratesVaribles(req, exchangerates) {

  if (req.tokenInfo && req.tokenInfo._id) {
    if (req.tokenInfo.loginType === 'employee') {
      exchangerates.createdBy = session.getSessionLoginID(req);
    }

  }
  return exchangerates;
}

/**
 * set exchangerates update variables
 * @returns {exchangerates}
 */
function setUpdateExchangeratesVaribles(req, exchangerates) {
  if (req.tokenInfo && req.tokenInfo._id) {
    if (req.tokenInfo.loginType === 'employee') {
      exchangerates.updatedBy = session.getSessionLoginID(req);
    }
  }
  exchangerates.updated = Date.now();
  return exchangerates;
}

/**
 * Get exchangerate by pair
 * @param {Object} params 
 */
async function getExchangerateByPair(params) {
  // Get exchangerate by pair
  let exchangerate = await Exchangerates.getExchangerateByPair(params);

  // Convert key pair list to array of arrays
  exchangerate = await prepareExchangerateData(exchangerate);
  return exchangerate;
}

/**
 * Get latest exchangerates from api
 * @param {Object} params 
 */
async function getLatestExchangeratesFromAPI(data) {
  let url = 'https://min-api.cryptocompare.com/data/price';
  url += '?fsym=' + data.fromCurrency + '&tsyms=' + data.toCurrency;
  let options = {
    method: 'GET',
    rejectUnauthorized: false,
    url: url,
    headers: {'Content-Type': 'application/json'}
  }
  return new Promise((resolve, reject)=>{
    request(options, (err, response, body) => {
      if (err) {
        console.log('Error: ' + new Date() + ': ' + err);
        // return res.status(config.errorStatus).send({ 'errorCode': config.statusCodes.ERROR, errorMessage: err });
        reject(err);
      } else if (response && response.body) {
        logger.info('Log:Exchangerates Service:getLatestExchangeratesFromAPI:' + i18nUtil.getI18nMessage('exchange_api_success'));
        let result = JSON.parse(response.body);
        console.log('result  --->  ' + result[data.toCurrency]);
        let newPrice = result[data.toCurrency];
        resolve(newPrice);
      }
    });
  });
}


export default {
  setCreateExchangeratesVaribles,
  setUpdateExchangeratesVaribles,
  getExchangerateByPair,
  getLatestExchangeratesFromAPI
}