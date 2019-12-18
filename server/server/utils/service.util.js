import random from 'random-int';
import randomString from 'randomstring';
import isCorrupted from 'is-corrupted-jpeg';

import Cryptr from 'cryptr';
const cryptr = new Cryptr("Bux64614646165456646");
import config from '../config/config';
import requestIp from 'request-ip';
import dateUtils from '../utils/date.util';
/**
 * get client ip
 * @param req
 * @returns {randomString}
 */
function getClientIp(req) {
  return requestIp.getClientIp(req);
}

/**
 * get bearer token
 * @returns {token}
 */
function getBearerToken(headers) {
  if (headers && headers.authorization) {
    const parted = headers.authorization.split(' ');
    if (parted.length === 2) {
      return parted[1];
    } else {
      return null;
    }
  } else {
    return null;
  }
}

/**
 * generate uuid
 * @returns {uuid}
 */
function generateUUID() {
  let d = new Date().getTime();
  const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    let r = (d + Math.random() * 16) % 16 | 0;
    d = Math.floor(d / 16);
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
  return uuid;
}

/**
 * generate random string
 * @param length
 * @param chars
 * @returns {randomString}
 */
function generateRandomString(length, chars) {
  let mask = '';
  if (chars.indexOf('a') > -1) mask += 'abcdefghijklmnopqrstuvwxyz';
  if (chars.indexOf('A') > -1) mask += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  if (chars.indexOf('#') > -1) mask += '0123456789';
  if (chars.indexOf('!') > -1) mask += '~`!@#$%^&*()_+-={}[]:";\'<>?,./|\\';
  let result = '';
  for (let i = length; i > 0; --i) result += mask[Math.round(Math.random() * (mask.length - 1))];
  return result;
}

/**
 * generate list query
 * @param req
 * @returns { filter: filter, sorting: sorting }
 */
function generateListQuery(req) {
  let criteria = {
    limit: config.limit,
    page: config.page,
    sortfield: config.sortfield,
    direction: config.direction,
    filter: {},
    pagination: {}
  };
  req.json = {
    active: true
  };
  let aggregateQuery = checkForAggregate(req);
  let data = req.query;
  if (data && data.limit) {
    criteria.limit = criteria.pagination.limit = parseInt(data.limit);
  };
  if (data && data.page) {
    criteria.page = criteria.pagination.page = parseInt(data.page);
  };
  if (data && data.filter) {
    let cred;
    if (req.entity && req.entity === "category") {
      cred = data.filter;
    } else {
      cred = JSON.parse(data.filter);
    };
    if (cred.limit) {
      criteria.limit = criteria.pagination.limit = parseInt(cred['limit']);
    };
    if (cred.page) {
      criteria.page = criteria.pagination.page = parseInt(cred['page']);
    };
    if (cred.sortfield) {
      criteria.sortfield = cred['sortfield'];
    };
    if (cred.direction) {
      criteria.direction = cred['direction'];
    };
    req.json = genrateFilterQuery(req, cred);
  }
  if (criteria.sortfield) {
    criteria.sorting = {};
    if (criteria.direction === 'desc') {
      criteria.sorting[criteria.sortfield] = -1;
    } else {
      criteria.sorting[criteria.sortfield] = 1;
    };
  }
  if (aggregateQuery.filter && aggregateQuery.filter.length > 0) {
    aggregateQuery.filter.unshift({ $match: req.json })
    aggregateQuery.sorting = criteria.sorting
    aggregateQuery.page = criteria.page;
    aggregateQuery.limit = criteria.limit;
    aggregateQuery.pagination = criteria.pagination;
    return aggregateQuery
  } else {
    criteria.filter = req.json;
  }
  if (req.entityType === 'entity') {
    if (!(criteria.filter.visibleDate)) {
      criteria.filter.visibleDate = {
        $lte: new Date(dateUtils.getTodayDate() + config.dayRanges.start)
      };
    }
    if (!(criteria.filter.expiryDate)) {
      criteria.filter.expiryDate = {
        $gte: new Date(dateUtils.getTodayDate() + config.dayRanges.end)
      };
    }
    criteria.filter.status = config.commonStatus.Active;
    criteria.filter.totalAvailable = {$gt:0};
  }
  return criteria;
};



/**
 * Generates the regex filter the query
 * @param {} json 
 * @param {*} cred 
 */
function genrateFilterQuery(req, cred) {
  if (cred && cred.globalSearch) {
    let globalObj = cred.globalSearch;
    if (globalObj && globalObj.type === 'user' && globalObj.value) {
      let filtersArr = ["email", "phone", "displayName", ,
        "name", "phoneNumber", "gender", "address.address",
        "parent", "tree", "multipleCategories", "ownerName", "userName", "title",
        "status", "productName", "longName", "parent", "entityName",
        "tree", "category", "subject", "context", "contextType", "desc", "companyName",
        "pair", "header", "type"
      ];
      filtersArr.forEach(function (v) {
        if (!req.json['$or']) {
          req.json['$or'] = [];
        };
        let jsonNew = {};
        jsonNew[v] = { '$regex': globalObj.value, '$options': 'i' };
        req.json['$or'].push(jsonNew);
      });
      //adding and to & condtion for filter
      let value = globalObj.value;
      let array = value.split(" ");
      let index = array.indexOf("and");
      if (index !== -1) {
        array.splice(index, 1, "&");
      }
      value = array.join(" ");
      globalObj.value = value;
      filtersArr.forEach(function (v) {
        if (!req.json['$or']) {
          req.json['$or'] = [];
        };
        let jsonNew = {};
        jsonNew[v] = { '$regex': globalObj.value, '$options': 'i' };
        req.json['$or'].push(jsonNew);
      });
    };
  };
  if (cred && cred.criteria) {
    let filters = cred.criteria;
    if (filters && filters.length > 0) {
      filters.forEach(function (v, i) {
        if (v.type === 'eq') {
          if (v.value && typeof (v.value) === 'number' && v.value % 1 !== 0) {
            if (!req.json[v.key]) {
              req.json[v.key] = {};
            };
            let str = v.value.toString();
            let arr = str.split(".");
            let len = arr[1].length;
            let inc = "0."
            for (let i = 1; i <= len; i++) {
              inc = inc + "0";
              if (i === len) {
                inc = inc + "5";
              }
            }
            let val1 = parseFloat((v.value + parseFloat(inc)).toFixed(len + 1));
            let val2 = parseFloat((v.value - parseFloat(inc)).toFixed(len + 1))
            req.json[v.key]["$lte"] = val1;
            req.json[v.key]["$gte"] = val2;
          } else {
            req.json[v.key] = v.value;
          }
        };
        if (v.type === 'in') {
          req.json[v.key] = { "$in": v.value };
        };
        if (v.type === 'gte') {
          if (!req.json[v.key]) {
            req.json[v.key] = {};
          };
          req.json[v.key]["$gte"] = v.value;
        };
        if (v.type === 'lteDate') {
          if (!req.json[v.key]) {
            req.json[v.key] = {};
          };
          req.json[v.key]["$lte"] = v.value + config.dayRanges.end;
        };
        if (v.type === 'gteDate') {
          if (!req.json[v.key]) {
            req.json[v.key] = {};
          };
          req.json[v.key]["$gte"] = v.value + config.dayRanges.start;
        };
        if (v.type === 'lte') {
          if (!req.json[v.key]) {
            req.json[v.key] = {};
          };
          req.json[v.key]["$lte"] = v.value;
        };
        if (v.type === 'or') {
          if (!req.json['$or']) {
            req.json['$or'] = [];
          };
          let jsonNew = {};
          jsonNew[v.key] = { '$regex': v.value, '$options': 'i' };
          req.json['$or'].push(jsonNew);
        };
        if (v.type === 'ne') {
          req.json[v.key] = { $ne: v.value };
        };
        if (v.type === 'nin') {
          req.json[v.key] = { "$in": v.value };
        };
        if (v.type === 'regexOr') {
          req.json[v.key] = { '$regex': v.value, '$options': 'i' };
        };
      });
    }
  }
  return req.json;
}


//Genaretes the required aggregate query based on the entityType requested
function checkForAggregate(req) {
  let aggregateQuery = {}
  if (req.aggregateType === 'productCart') {
    req.json.status = 'AddToCart'
    aggregateQuery.filter = [
      {
        $group:
        {
          _id: { entityId: "$entityId", name: "$entityName" },
          quantity: { $sum: "$quantity" }
        }
      }
    ]
  }
  if (req.aggregateType === 'mostlyViewed') {
    aggregateQuery.filter = [
      {
        $group:
        {
          _id: { entityId: "$entityId", name: "$name" },
          count: { $sum: 1 }
        }
      }
    ]
  }
  if (req.aggregateType === "orderAmount") {
    req.json.status = { $nin: ["AddToCart", "Cancelled", "Returned", "Refunded"] };
    aggregateQuery.filter = [
      {
        $group: {
          _id: { entityId: "$entityId", entityName: "$entityName" },
          totalAmmount: { $sum: "$BUX" }
        }
      }
    ]
  }
  if (req.aggregateType === "bestSeller") {
    req.json.status = { $nin: ["AddToCart", "Cancelled", "Returned", "Refunded"] }
    aggregateQuery.filter = [
      {
        $group:
        {
          _id: { ownerId: "$ownerId", ownerName: "$ownerName" },
          totalAmount: { $sum: "$BUX" },
          count: { $sum: 1 }
        }
      }
    ]
  }
  if (req.aggregateType === 'productClick') {
    aggregateQuery.filter = [
      { $sort: { created: -1 } },
      {
        $group: {
          _id: "$entityId",
          images: { $first: "$images" },
          price: { $first: "$price" },
          name: { $first: "$name" },
          created: { $first: "$created" },
          entityId: { $first: "$entityId" },
          ipAddress: { $first: "$ipAddress" },
          active: { $first: "$active" },
          reviews: { $first: "$reviews" }

        }
      }
    ]
  }
  if (req.aggregateType === "productByOrder") {
    req.json.status = { $nin: ["AddToCart", "Cancelled", "Returned", "Refunded"] };
    aggregateQuery.filter = [
      {
        $group:
        {
          _id: { entityId: "$entityId", entityName: "$entityName" },
          quantity: { $sum: "$quantity" },
          totalAmount: { $sum: "$BUX" }
        }
      }
    ]
  }
  if (req.aggregateType === "popularProduct") {
    let date = dateUtils.getTodayDate()
    aggregateQuery.filter = [
      {
        $match: {
          _id: { $in: req.productIds },
          status:"Active",
          totalAvailable:{$gt:0},
          expiryDate: { $gte: new Date(date + config.dayRanges.end) },
          visibleDate: { $lte: new Date(date + config.dayRanges.start) }
        }
      }
    ]
  }

  return aggregateQuery
}
/**
 * encode string using buffer
 * @param enString
 * @returns encodeString
 */
function encodeString(enString) {
  // return new Buffer(enString).toString('base64');
  return cryptr.encrypt(enString);
};

/**
 * decode string using buffer
 * @param deString
 * @returns decodeString
 */
function decodeString(deString) {
  //return new Buffer(deString, 'base64').toString();
  return cryptr.decrypt(deString);
};

function generateRandom() {
  let randomnO = random(config.randomLimits.min, config.randomLimits.max);
  return randomnO;
}

function generateRandomAlphanumeric(length) {
  let random = randomString.generate({
    length: length,
    charset: 'alphabetic'
  });
  return random;
}

function isImageCurrupted(image) {
  return isCorrupted(image)
}

/**
 * remove body fields
 * @param req Object
 * @param res Object
 * @param next Function
 */
function removeBodyFields(req, res, next) {
  let removeFieldsArr = ['active'];
  removeFieldsArr.forEach((field) => {
    if (req.body && (req.body[field] || typeof req.body[field] === 'boolean')) {
      delete req.body[field];
    }
  });
  next();
};


export default {
  getBearerToken,
  generateUUID,
  generateRandomString,
  generateListQuery,
  getClientIp,
  encodeString,
  decodeString,
  generateRandom,
  isImageCurrupted,
  generateRandomAlphanumeric,
  removeBodyFields
};