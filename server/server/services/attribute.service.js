import session from '../utils/session.util';

/**
 * set Attribute create variables
 * @returns {Attribute}
 */
function setCreateAttributeVaribles(req, attribute) {
  if (req.tokenInfo) {
    attribute.createdBy[req.tokenInfo.loginType] = session.getSessionLoginID(req);
    attribute.createdBy.name = session.getSessionLoginName(req);
  }
  return attribute;
}

/**
 * set Attribute update variables
 * @returns {Attribute}
 */
function setUpdateAttributeVaribles(req, attribute) {
  attribute.updated = Date.now();
  if (req.tokenInfo) {
    attribute.updatedBy[req.tokenInfo.loginType] = session.getSessionLoginID(req);
    attribute.updatedBy.name = session.getSessionLoginName(req);
  };
  return attribute;
};

export default {
  setCreateAttributeVaribles,
  setUpdateAttributeVaribles

};
