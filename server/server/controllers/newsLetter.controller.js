import config from '../config/config';
import Buyer from '../models/buyer.model';
import NewsLetter from '../models/newsLetter.model';
import Seller from '../models/seller.model';

import activityService from '../services/activity.service';
import newsLetterService from '../services/newsLetter.service';
import renderEmailTemplateService from '../services/renderEmailTemplate.service';
import uploadeService from '../services/upload.service';

import respUtil from '../utils/resp.util';
import serviceUtil from '../utils/service.util';

/**
 * Load NewsLetter and append to req.
 * @param req
 * @param res
 * @param next
 */
async function load(req, res, next) {
  req.newsLetter = await NewsLetter.get(req.params.newsLetterId);
  return next();
};

/**
 * Get newsLetter
 * @param req
 * @param res
 * @returns {details: NewsLetter}
 */
async function get(req, res) {
  logger.info('Log:NewsLetter Controller:get: query :' + JSON.stringify(req.query));
  let newsLetter = req.newsLetter;
  let responseJson = {
    respCode: respUtil.successResponse(req).respCode,
    details: newsLetter
  };
  res.json(responseJson);
};

/**
 * Create new newsLetter
 * @param req
 * @param res
 * @returns { respCode: respCode, respMessage: respMessage }
 */
async function create(req, res) {
  logger.info('Log:NewsLetter Controller:create: body :' + JSON.stringify(req.body));
  let newsLetter = new NewsLetter(req.body);
  newsLetter = await newsLetterService.setCreateNewsLetterVaribles(req, newsLetter);
  req.newsLetter = await NewsLetter.save(newsLetter);
  req.entityType = 'newsLetter';
  req.activityKey = 'newsLetterCreate';
  req.contextId = req.newsLetter._id;

  // creating activity for new newsLetter 
  activityService.insertActivity(req);
  if(req.body.type){
    if(req.body.type === "sellers" || req.body.type === 'both'){
      req.emails = await Seller.distinct("email",{active:true,isSubscribed:true});
      renderEmailTemplateService.setCommonEmailVariables(req, res);
    } 
    if(req.body.type === "buyers" || req.body.type === 'both'){
      req.emails = await Buyer.distinct("email",{active:true,isSubscribed:true});
      renderEmailTemplateService.setCommonEmailVariables(req, res);
    }
  }
  res.json(respUtil.createSuccessResponse(req));
};

/**
 * Update existing newsLetter
 * @param req
 * @param res
 * @param next
 * @returns { respCode: respCode, respMessage: respMessage }
 */
async function update(req, res, next) {
  logger.info('Log:NewsLetter Controller:update: body :' + JSON.stringify(req.body));
  let newsLetter = req.newsLetter;

  newsLetter = Object.assign(newsLetter, req.body);
  newsLetter = newsLetterService.setUpdateNewsLetterVaribles(req, newsLetter);
  req.newsLetter = await NewsLetter.save(newsLetter);
  req.entityType = 'newsLetter';
  req.activityKey = 'newsLetterUpdate';
  req.contextId = req.newsLetter._id;

  // creating activity for newsLetter update 
  activityService.insertActivity(req);
  res.json(respUtil.updateSuccessResponse(req));
};

/**
 * Get newsLetter list. based on criteria
 * @param req
 * @param res
 * @param next
 * @returns {newsLetters: newsLetters, pagination: pagination}
 */
async function list(req, res, next) {
  let responseJson = {};
  logger.info('Log:NewsLetter Controller:list: query :' + JSON.stringify(req.query));
  req.entityType = 'newsLetter';
  const query =  serviceUtil.generateListQuery(req);
  if (query.page === 1) {

    // total newsLetters count in that page 
    query.pagination.totalCount = await NewsLetter.totalCount(query);
  };

  //get total newsLetters
  const newsLetters = await NewsLetter.list(query);
  responseJson.respCode = respUtil.successResponse(req).respCode;
  responseJson.newsLetters = newsLetters;
  responseJson.pagination = query.pagination;
  res.json(responseJson);
};

/**
 * Delete newsLetter.
 * @param req
 * @param res
 * @param next
 * @returns { respCode: respCode, respMessage: respMessage }
 */
async function remove(req, res, next) {
  logger.info('Log:NewsLetter Controller:remove: query :' + JSON.stringify(req.query));
  let newsLetter = req.newsLetter;
  newsLetter.active = false;
  newsLetter = newsLetterService.setUpdateNewsLetterVaribles(req, newsLetter);
  req.newsLetter = await NewsLetter.save(newsLetter);
  req.entityType = 'newsLetter';
  req.activityKey = 'newsLetterDelete';
  req.contextId = req.newsLetter._id;

  // creating activity for newsLetter delete 
  activityService.insertActivity(req);
  res.json(respUtil.removeSuccessResponse(req));
};

/**
 * change entity profilePucture
 * @param req
 * @param res
 */
async function uploadImages(req, res, next) {
  logger.info('Log:newsletter Controller :Upload newsLetter logos:body:' + JSON.stringify(req.body));
  req.uploadFile = [];
  req.uploadPath = 'newsLetter';
  //Calling the activity of uploading the required file
  uploadeService.upload(req, res, (err) => {
    if (err) {
      console.log(err)
      logger.info('Error:newsLetter Controller: Change newsLetter Logo: Error:' + JSON.stringify(err));
      req.i18nKey = "uploadDirectoryNotFound";
      res.json(respUtil.getErrorResponse(req));
    } else if (req.uploadFile && req.uploadFile[0] && req.uploadFile[0].name) {
      req.image = req.uploadFile;
      setTimeout(function () {
        res.json(respUtil.uploadLogoSucessResponse(req));
      }, 3000);
    } else {
      req.i18nKey = 'entityLogoUploadedErrorMessage';
      logger.error('Error:Entity Entity:Change Entity Logo: Error : Entity Logo not uploded.');
      res.json(respUtil.getErrorResponse(req));
    };
  });
};


export default {
  load,
  get,
  create,
  update,
  list,
  remove,
  uploadImages
};