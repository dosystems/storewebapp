import config from '../config/config';
import tokenService from '../services/token.service';
import serviceUtil from '../utils/service.util';
import respUtil from '../utils/resp.util';

function updateExpireTime(token, type) {
  if (type === 'removeToken') {
    token.remove();
  } else {
    token.expires = new Date().getTime() + config.expireTokenTime;
    token.updated = new Date();
    token.save();
  };
};

/**
 * middleware b/w client and server
 */
async function isAllowed(req, res, next) {
  let token = '';

  // get token from request headers
  if (req.headers && req.headers.authorization) {
    token = serviceUtil.getBearerToken(req.headers);
  };
  // get token from request query parameters
  if (req.query && req.query.token) {
    token = req.query.token;
  };
  if (token) {

    //gets the token details based on the access token
    let tokenData = await tokenService.getTokenDetails(token);
    if (tokenData && tokenData.accessToken) {
      if (!(tokenData.expires < new Date().getTime())) {

        //if login type is employee adds the employe data to the response
        if (tokenData.loginType === 'employee') {
          req.tokenInfo = tokenData.employee;
        };
        //if login type is Buyer adds the buyer data to the response
        if (tokenData.loginType === 'buyer') {
          req.tokenInfo = tokenData.buyer;
        };
        //if login type is seller adds the seller data to the response
        if (tokenData.loginType === 'seller') {
          req.tokenInfo = tokenData.seller;
        };
      
        req.tokenInfo.loginType = tokenData.loginType;
        req.tokenInfo.loginFrom = tokenData.loginFrom;
        req.tokenInfo.iosMobileAppVersion = tokenData.iosMobileAppVersion;
        req.tokenInfo.androidMobileAppVersion = tokenData.androidMobileAppVersion;
        if (!req.tokenInfo.loginFrom) {
          req.tokenInfo.loginFrom = 'web';
        };
        updateExpireTime(tokenData, 'updateTime');
      } else {
        updateExpireTime(tokenData, 'removeToken');
        req.i18nKey = 'tokenExpiredMsg';

        //response if token experied
        return res.json(respUtil.getErrorResponse(req));
      };
    } else {
      req.i18nKey = 'invalidTokenMsg';

      //response if invalid token provided
      return res.json(respUtil.getErrorResponse(req));
    };
  } else {
    if (config.isTokenNotPassed) {
      req.i18nKey = 'tokenNotProvideMessage';

      //response if tokene not provided
      return res.json(respUtil.getErrorResponse(req));
    } else {
      return next();
    };
  };
  return next();
};

async function isSuperAdmin(req, res) {
  if (req.tokenInfo && req.tokenInfo.role && req.tokenInfo.role === config.commonRole.SuperAdmin) {
    return next();
  } else {
    req.i18nKey = 'invalidSuperAdminAuth';
    return res.json(respUtil.getErrorResponse(req));
  }
}
export default {
  isAllowed,
  isSuperAdmin
};
