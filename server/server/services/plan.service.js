import session from '../utils/session.util';
import Entity from '../models/entity.model';
/**
 * set Plan variables
 * @returns {Plan}
 */
async function setCreatePlanVaribles(req, plan) {
  if (req.tokenInfo) {
    plan.createdBy[req.tokenInfo.loginType] = session.getSessionLoginID(req);
    plan.createdBy.name = session.getSessionLoginName(req);
  };
  return plan;
};

/**
 * set Plan update variables
 * @returns {Plan}
 */
function setUpdatePlanVaribles(req, plan) {
  plan.updated = Date.now();
  if (req.tokenInfo) {
    plan.updatedBy[req.tokenInfo.loginType] = session.getSessionLoginID(req);
    plan.createdBy.name = session.getSessionLoginName(req);
  };
  return plan;
};

export default {
  setCreatePlanVaribles,
  setUpdatePlanVaribles
};
