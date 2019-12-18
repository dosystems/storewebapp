import session from '../utils/session.util';

/**
 * set Deal variables
 * @returns {Deal}
 */
async function setCreateDealVaribles(req, deal) {
  if (req.tokenInfo) {
    deal.createdBy[req.tokenInfo.loginType] = session.getSessionLoginID(req);
    deal.createdBy.name = session.getSessionLoginName(req);
  };
  return deal;
};

/**
 * set Deal update variables
 * @returns {Deal}
 */
function setUpdateDealVaribles(req, deal) {
  deal.updated = Date.now();
  if (req.tokenInfo) {
    deal.updatedBy[req.tokenInfo.loginType] = session.getSessionLoginID(req);
    deal.updatedBy.name = session.getSessionLoginName(req);
  };
  return deal;
};

export default {
  setCreateDealVaribles,
  setUpdateDealVaribles
};
