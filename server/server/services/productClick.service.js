import session from '../utils/session.util';
// import getIpAddresses from 'get-ip-addresses';
var ip = require('ip')

/**
 * set Seller variables
 * @returns {Seller}
 */
function setCreateProductClickVaribles(req, productClick) {
  if (req.tokenInfo) {
    productClick.createdBy[req.tokenInfo.loginType] = session.getSessionLoginID(req);
    productClick.createdBy.name = session.getSessionLoginName(req);
    productClick.userId =  session.getSessionLoginID(req);
    productClick.userName =  session.getSessionLoginName(req);
  } 
  productClick.ipAddress = ip.address();
  return productClick;
}

/**
 * set Seller update variables
 * @returns {Seller}
 */
function setUpdateProductClickVaribles(req, productClick) {
  productClick.updated = Date.now();
  if (req.tokenInfo) {
    productClick.updatedBy[req.tokenInfo.loginType] = session.getSessionLoginID(req);
    productClick.updatedBy.name = session.getSessionLoginName(req);
  };
  return productClick;
};

export default {
  setCreateProductClickVaribles,
  setUpdateProductClickVaribles
};
