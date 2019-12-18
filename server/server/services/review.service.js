import session from '../utils/session.util';
import Buyer from '../models/buyer.model';
import Entity from '../models/entity.model';
import Review from '../models/review.model';
/**
 * set Review variables
 * @returns {Review}
 */
async function setCreateReviewVaribles(req, review) {
  if (req.tokenInfo) {
    review.createdBy[req.tokenInfo.loginType] = session.getSessionLoginID(req);
    review.createdBy.name = session.getSessionLoginName(req);
    review.userId = session.getSessionLoginID(req);
    review.userName = session.getSessionLoginName(req);
  };
  if (review.entityId) {
    req.entity = await Entity.get(review.entityId);
    if (req.entity) {
      review.entityName = req.entity.name;
      review.ownerId = req.entity.ownerId;
      review.ownerName = req.entity.ownerName;
    };
  };
  if(review.userId){
    req.buyer = await Buyer.get(review.userId);
  }
  return review;
}

/**
 * set Review update variables
 * @returns {Review}
 */
function setUpdateReviewVaribles(req, review) {
  review.updated = Date.now();
  if (req.tokenInfo) {
    review.updatedBy[req.tokenInfo.loginType] = session.getSessionLoginID(req);
    review.createdBy.name = session.getSessionLoginName(req);
  };
  return review;
};

async function getRating(id,req) {
  let reviewsCount = await Review.aggregate([
    {
      $match: {
        entityId: id,
        active: true
      }
    }, {
      $group: {
        _id: "$userId",
        rating: { $sum: "$rating" },
        count: { $sum: 1 }
      }
    }, {
      $group: {
        _id: "",
        rating: { $sum: "$rating" },
        count: { $sum: "$count" },
        users: { $sum: 1 }
      }
    }
  ]);
  let review = {};
  if (reviewsCount && reviewsCount.length > 0) {
    review.rating = reviewsCount[0].rating / reviewsCount[0].count;
    req.reviewsCount = reviewsCount[0].count;
    review.buyersCount = reviewsCount[0].users;
  } else {
    review.rating = 0;
    review.buyersCount = 0;
  }
  console.log(review);
  return review;
}
export default {
  setCreateReviewVaribles,
  setUpdateReviewVaribles,
  getRating

};