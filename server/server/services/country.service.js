import session from '../utils/session.util';

/**
 * set Country create variables
 * @returns {Country}
 */
function setCreateCountryVaribles(req, country) {
  if (req.tokenInfo) {
    country.createdBy[req.tokenInfo.loginType] = session.getSessionLoginID(req);
    country.createdBy.name = session.getSessionLoginName(req);
  }
  return country;
}

/**
 * set Country update variables
 * @returns {Country}
 */
function setUpdateCountryVaribles(req, country) {
  country.updated = Date.now();
  if (req.tokenInfo) {
    country.updatedBy[req.tokenInfo.loginType] = session.getSessionLoginID(req);
    country.updatedBy.name = session.getSessionLoginName(req);
  };
  return country;
};








export default {
  setCreateCountryVaribles,
  setUpdateCountryVaribles

};
