import config from '../config/config';

import Buyer from '../models/buyer.model';
import Entity from '../models/entity.model';
import Review from '../models/review.model';

import activityService from '../services/activity.service';
import reviewService from '../services/review.service';

import respUtil from '../utils/resp.util';
import serviceUtil from '../utils/service.util';

/**
 * Load Review and append to req.
 * @param req
 * @param res
 * @param next
 */
async function load(req, res, next) {
  req.review = await Review.get(req.params.reviewId);
  return next();
};

/**
 * Get review
 * @param req
 * @param res
 * @returns {details: Review}
 */
async function get(req, res) {
  logger.info('Log:Review Controller:get: query :' + JSON.stringify(req.query));
  let review = req.review;
  let responseJson = {
    respCode: respUtil.successResponse(req).respCode,
    details: review
  };
  res.json(responseJson);
};

/**
 * Create new review
 * @param req
 * @param res
 * @returns { respCode: respCode, respMessage: respMessage }
 */
async function create(req, res) {
  logger.info('Log:Review Controller:create: body :' + JSON.stringify(req.body));
  let review = new Review(req.body);
  await reviewService.setCreateReviewVaribles(req, review);
  //buyer added the product to cart 
  req.review = await Review.save(review);
  req.entity.rating = await reviewService.getRating(review.entityId, req);
  req.entity.reviewsCount = req.reviewsCount;
  await Entity.save(req.entity);
  if (req.buyer) {
    let qry = { filter: { active: true } }
    qry.filter.userId = req.buyer._id;
    req.buyer.reviewsCount = await Review.totalCount(qry);
    await Buyer.save(req.buyer);
  }
  req.entityType = 'review';
  req.activityKey = 'reviewCreate';
  req.contextId = req.review._id;
  // adding review create activity
  activityService.insertActivity(req);
  res.json(respUtil.createSuccessResponse(req));
};

/**
 * Update existing review
 * @param req
 * @param res
 * @param next
 * @returns { respCode: respCode, respMessage: respMessage }
 */
async function update(req, res, next) {
  logger.info('Log:Review Controller:update: body :' + JSON.stringify(req.body));
  let review = req.review;
  review = reviewService.setUpdateReviewVaribles(req, review);
  review = Object.assign(review, req.body)
  req.review = await Review.save(review);
  req.entity.rating = await reviewService.getRating(review.entityId, req);
  req.entity.reviewsCount = req.reviewsCount;
  await Entity.save(req.entity);
  req.entityType = 'review';
  req.activityKey = 'reviewUpdate';
  req.contextId = req.review._id;
  // adding review update activity
  activityService.insertActivity(req);
  res.json(respUtil.updateSuccessResponse(req));
};

/**
 * Get review list. based on criteria
 * @param req
 * @param res
 * @param next
 * @returns {reviews: reviews, pagination: pagination}
 */
async function list(req, res, next) {
  let responseJson = {};
  logger.info('Log:Review Controller:list: query :' + JSON.stringify(req.query));
  req.entityType = 'review';
  const query = serviceUtil.generateListQuery(req);
  if (req.tokenInfo && req.tokenInfo._id) {
    if (req.tokenInfo.loginType === config.commonRole.buyer) {
      query.filter.userId = req.tokenInfo._id;
    }
  }
  if (query.page === 1) {
    // total count 
    query.pagination.totalCount = await Review.totalCount(query);
  };

  //get total reviews
  const reviews = await Review.list(query);
  responseJson.respCode = respUtil.successResponse(req).respCode;
  responseJson.reviews = reviews;
  responseJson.pagination = query.pagination;
  res.json(responseJson);
};

/**
 * Delete review.
 * @param req
 * @param res
 * @param next
 * @returns { respCode: respCode, respMessage: respMessage }
 */
async function remove(req, res, next) {
  logger.info('Log:Review Controller:remove: query :' + JSON.stringify(req.query));
  let review = req.review;
  review.active = false;
  review = reviewService.setUpdateReviewVaribles(req, review);
  req.review = await Review.save(review);
  req.entityType = 'review';
  req.activityKey = 'reviewDelete';
  req.contextId = req.review._id;

  // adding review delete activity
  activityService.insertActivity(req);
  res.json(respUtil.removeSuccessResponse(req));
};

export default {
  load,
  get,
  create,
  update,
  list,
  remove
};
