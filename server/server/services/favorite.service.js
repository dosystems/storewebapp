import session from '../utils/session.util';
import Entity from '../models/entity.model';
import Favorite from '../models/favorite.model';
/**
 * set Favorite variables
 * @returns {Favorite}
 */
async function setCreateFavoriteVaribles(req, favorite) {
  if (req.tokenInfo) {
    favorite.createdBy[req.tokenInfo.loginType] = session.getSessionLoginID(req);
    favorite.createdBy.name = session.getSessionLoginName(req);
    favorite.userId = session.getSessionLoginID(req);
    favorite.userName = session.getSessionLoginName(req);
  };
  if (favorite.entityId) {
    let entity = await Entity.get(favorite.entityId);
    favorite.entityName = entity.name;
  };
  return favorite;
};

/**
 * set Favorite update variables
 * @returns {Favorite}
 */
function setUpdateFavoriteVaribles(req, favorite) {
  favorite.updated = Date.now();
  if (req.tokenInfo) {
    favorite.updatedBy[req.tokenInfo.loginType] = session.getSessionLoginID(req);
    favorite.createdBy.name = session.getSessionLoginName(req);
  };
  return favorite;
};


async function getFavorite(req) {
  let query = {
    filter: {
      active: true
    }
  }
  if (req.tokenInfo && req.tokenInfo._id) {
    query.filter.userId = req.tokenInfo._id
  }
  let favorites = await Favorite.list(query);
  return favorites;
}
export default {
  setCreateFavoriteVaribles,
  setUpdateFavoriteVaribles,
  getFavorite
};
