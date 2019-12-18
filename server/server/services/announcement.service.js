import session from '../utils/session.util';
import { assertAbstractType } from 'graphql';

/**
 * set Announcement variables
 * @returns {Announcement}
 */
async function setCreateAnnouncementVaribles(req, announcement) {
  if (req.tokenInfo) {
    announcement.createdBy[req.tokenInfo.loginType] = session.getSessionLoginID(req);
    announcement.createdBy.name = session.getSessionLoginName(req);
  };
  return announcement;
};

/**
 * set Announcement update variables
 * @returns {Announcement}
 */
function setUpdateAnnouncementVaribles(req, announcement) {
  announcement.updated = Date.now();
  if (req.tokenInfo) {
    announcement.updatedBy[req.tokenInfo.loginType] = session.getSessionLoginID(req);
    announcement.updatedBy.name = session.getSessionLoginName(req);
  };
  return announcement;
};
export default {
  setCreateAnnouncementVaribles,
  setUpdateAnnouncementVaribles
};
