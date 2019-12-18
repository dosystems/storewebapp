import session from '../utils/session.util';

/**
 * set CategoryRequest variables
 * @returns {CategoryRequest}
 */
async function setCreateCategoryRequestVaribles(req, categoryRequest) {
  if (req.tokenInfo) {
    categoryRequest.createdBy[req.tokenInfo.loginType] = session.getSessionLoginID(req);
    categoryRequest.createdBy.name = session.getSessionLoginName(req);
    categoryRequest.userId = session.getSessionLoginID(req);
  };
  categoryRequest.status = "Requested";
  return categoryRequest;
};

/**
 * set CategoryRequest update variables
 * @returns {CategoryRequest}
 */
function setUpdateCategoryRequestVaribles(req, categoryRequest) {
  categoryRequest.updated = Date.now();
  if (req.tokenInfo) {
    categoryRequest.updatedBy[req.tokenInfo.loginType] = session.getSessionLoginID(req);
    categoryRequest.updatedBy.name = session.getSessionLoginName(req);
  };
  return categoryRequest;
};

export default {
  setCreateCategoryRequestVaribles,
  setUpdateCategoryRequestVaribles
};
