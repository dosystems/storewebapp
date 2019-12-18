import session from '../utils/session.util';

/**
 * set Statement create variables
 * @returns {Statement}
 */
function setCreateStatementVaribles(req, statement) {
  if (req.tokenInfo) {
    statement.createdBy[req.tokenInfo.loginType] = session.getSessionLoginID(req);
    statement.createdBy.name = session.getSessionLoginName(req);
    statement.userId = session.getSessionLoginID(req);
    statement.userName = session.getSessionLoginName(req);
  };
  if (statement.type === 'EXPENSE') {
    statement.ammount = '-' + statement.ammount;
  };
  if (statement.type === 'INCOME') {
    statement.ammount = '+' + statement.ammount;
  };
  return statement;
};

/**
 * set Statement update variables
 * @returns {Statement}
 */
function setUpdateStatementVaribles(req, statement) {
  statement.updated = Date.now();
  if (req.tokenInfo) {
    statement.updatedBy[req.tokenInfo.loginType] = session.getSessionLoginID(req);
    statement.createdBy.name = session.getSessionLoginName(req);
  };
  return statement;
};

export default {
  setCreateStatementVaribles,
  setUpdateStatementVaribles

};
