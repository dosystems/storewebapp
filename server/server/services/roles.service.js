import config from '../config/config';
import Role from '../models/roles.model';
import session from '../utils/session.util';

/**
 * set role variables
 * @returns {Role}
 */
function setCreateRoleVaribles(req, role) {
  if (req.tokenInfo && req.tokenInfo.loginType === config.commonRole.employee) {
    role.createdBy[req.tokenInfo.loginType] = session.getSessionLoginID(req);
  };
  return role;
};

/**
 * set role update variables
 * @returns {Role}
 */
function setUpdateRoleVaribles(req, role) {
  role.updated = Date.now();
  if (req.tokenInfo && req.tokenInfo.loginType === config.commonRole.employee) {
    role.updatedBy[req.tokenInfo.loginType] = session.getSessionLoginID(req);
  };
  return role;
};

async function getPermissions(role) {
  let permissions = await Role.findOne({ active: true, role: role });
  if (permissions) {
    return permissions;
  };
};
export default {
  setCreateRoleVaribles,
  setUpdateRoleVaribles,
  getPermissions
};