import requestIp from 'request-ip';
import Token from '../models/token.model';
import serviceUtil from '../utils/service.util';
import config from '../config/config';

/**
 * Get unique token details by accessToken
 * @returns {token}
 */
function getTokenDetails(token) {
  return Token
    .findOne({ accessToken: token }).populate('employee').populate('buyer').populate('seller')
    .then((token) => token);
};

/**
 * set token variables
 * @returns {token}
 */
function setTokenVariables(req) {
  let token = new Token();
  token.accessToken = serviceUtil.generateUUID();
  token.refreshToken = serviceUtil.generateUUID();
  token.loginType = req.entityType;
  if (token.loginType === config.commonRole.employee) {
    token.employee = req.employee._id;
  };
  if (token.loginType === config.commonRole.buyer) {
    token.buyer = req.buyer._id;
  };
  if (token.loginType === config.commonRole.seller) {
    token.seller = req.seller._id;
  };
  token.expires = new Date().getTime() + config.expireTokenTime;
  if (req.body && req.body.type) {
    token.loginFrom = req.body.type;
  } else {
    token.loginFrom = 'web';
  };
  if (req.body && req.body.deviceId) {
    token.deviceId = req.body.deviceId;
  };
  if (req.body && req.body.app_version && req.body.type === 'ios') {
    token.iosMobileAppVersion = req.body.app_version;
    if (req.body.IOSVersion) {
      token.IOSVersion = req.body.IOSVersion;
    };
    if (req.body.Model) {
      token.IOSModel = req.body.Model;
    };
  } else if (req.body && req.body.app_version && req.body.type === 'android') {
    token.androidMobileAppVersion = req.body.app_version;
    if (req.body.dev_version) {
      token.dev_version = req.body.dev_version;
    };
    if (req.body.Model) {
      token.AndroidModel = req.body.Model;
    };
  };
  req.token = token;
  req.isOTPEnabled = config.isOTPEnabled;
  // matching deviceId to users deviceInfo
  if (token && token.loginFrom && token.deviceId && req[req.entityType] && req[req.entityType][token.loginFrom + 'DeviceId']) {
    if (req[req.entityType][token.loginFrom + 'DeviceId'] === token.deviceId) {
      req.isOTPEnabled = false;
    };
  };

  if (req && token && token.loginFrom && token.loginFrom === 'web') {
    token.deviceId = requestIp.getClientIp(req);
  };
};

/**
 * remove exisisting token and save new token
 * @param req
 * @returns {}
 */
async function removeTokenAndSaveNewToken(req) {
  let token;
  let entityType = req.entityType || req.body.entityType;

  if (entityType === config.commonRole.employee) {
    token = await Token.findUniqueEmployeeToken(req.employee._id);
    req.employee.password = undefined;
    req.employee.salt = undefined;
  }
  if (entityType === config.commonRole.buyer) {
    token = await Token.findUniqueBuyerToken(req.buyer._id);
    req.buyer.password = undefined;
    req.buyer.salt = undefined;
  }
  if (entityType === config.commonRole.seller) {
    token = await Token.findUniqueSellerToken(req.seller._id);
    req.seller.password = undefined;
    req.seller.salt = undefined;
  }
  if (token && token.type) {
    token.remove();
  }
  // set token variables
  setTokenVariables(req);
  Token.save(req.token);
}

export default {
  getTokenDetails,
  setTokenVariables,
  removeTokenAndSaveNewToken
}